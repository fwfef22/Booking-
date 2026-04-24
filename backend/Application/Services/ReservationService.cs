using Application.DTOs;
using Infrastructure.Repositories;
using Domain;
using Domain.Enums;
using System.Collections.Specialized;

namespace Application.Services;

public class ReservationService : IReservationService
{
    private readonly IReservationRepository _repository;
    private readonly IRentObjectRoomRepository _roomRepository;
    private readonly IRentObjectRepository _rentobjRepository;
    private readonly IUserRepository _userRepository;
    private readonly IEmailService _emailService;
    private readonly IPaymentService _paymentService;

    public ReservationService(IReservationRepository repository, IRentObjectRoomRepository roomRepository, IUserRepository userRepository, IRentObjectRepository rentObjectRepository, IEmailService emailService, IPaymentService paymentService)
    {
        _repository = repository;
        _roomRepository = roomRepository;
        _userRepository = userRepository;
        _rentobjRepository = rentObjectRepository;
        _paymentService = paymentService;
        _emailService = emailService;
    }

    public async Task<ReservationIdResponse> CreateAsync(CreateReservationDto request){

        if (string.IsNullOrWhiteSpace(request.UserId))
            return new ReservationIdResponse { Success = false, Message = "UserId is required" };
        if (string.IsNullOrWhiteSpace(request.RentObjectRoomId))
            return new ReservationIdResponse { Success = false, Message = "RentObjectRoomId is required" };
        //if (request.ReservationDate_Time == null)
        //    return new GeneralResponse { Success = false, Message = "ReservationDate_Time is required" };

        var user = await _userRepository.GetByIdAsync(request.UserId);
        Console.WriteLine($"Looking for userId: '{request.UserId}', User found: {user != null}, Email: '{user?.Email}'");

        if (user == null)
            return new ReservationIdResponse { Success = false, Message = "User not found" };

        var room = await _roomRepository.GetByIdAsync(request.RentObjectRoomId);
        if (room == null)
            return new ReservationIdResponse { Success = false, Message = "Room not found" };

        //Check if room is empty
        var reservationList = await _repository.GetResevationByRoomIdAndDate(request.RentObjectRoomId, request.ReservationDate_Time.Date);

        //TimeZone
        request.ReservationDate_Time += TimeSpan.FromHours(2);

        var rentObj = await _rentobjRepository.GetByIdAsync(
                room.Rent_Object_Main_ID
            );
        foreach (var reservationfromList in reservationList){
            // if our request is closer to any activy request by N minutes, then we cannot create it
                if(Math.Abs(
                (request.ReservationDate_Time.TimeOfDay - reservationfromList.ReservationTime).TotalMinutes
                ) < rentObj.Default_Time)
            {
                return new ReservationIdResponse { Success = false, Message = "Requested time is closed/active" };
            }                 
        }

        var reservation = new Reservation
        {
            ReservationTime = request.ReservationDate_Time.TimeOfDay,
            ReservationDate = DateTime.SpecifyKind(request.ReservationDate_Time, DateTimeKind.Utc),
            Room_ID = room.Rent_Object_Room_ID,
            Room = room,
            User_ID = user.User_ID,
            _user = user,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(reservation);
        await _repository.SaveChangesAsync();

        await _emailService.SendReservationCreatedAsync(user.Email, reservation.Reservation_ID, reservation.CreatedAt, reservation.ReservationDate, 0);

        return new ReservationIdResponse { Success = true, Message = "Reservation created successfully", ReservationId = reservation.Reservation_ID };
    }

    public async Task<List<TimeSpanForReservations>> GetAllowedTimeSpanForReservationByRoomIdAndDate(RequestTimeSpanForReservations request)
    {
        var room = await _roomRepository.GetByIdAsync(request.RentObjectRoomId);
        if (room == null)
            return null;


        var reservationList = await _repository.GetResevationByRoomIdAndDate(request.RentObjectRoomId, request.Date.Date);

        var rentObj = await _rentobjRepository.GetByIdAsync(
                room.Rent_Object_Main_ID
            );

        //all rooms start at 8:00 and ends on 21:00
        var start = TimeSpan.FromHours(8);
        var end = TimeSpan.FromHours(21);
        var stepInt = rentObj.Default_Time;
        var step = TimeSpan.FromMinutes(stepInt);
        var returnlist = new List<TimeSpanForReservations>();
        for ( TimeSpan timespan = start; timespan <= end; timespan = timespan.Add(step))
        {
            var IsTimeSpan = new TimeSpanForReservations
            {
                time_span = timespan,
                IsAllowed = true
            };
            foreach (var reservationfromList in reservationList)
            {
                // if our request is closer to any activy request by N minutes, then we cannot create it
                if (Math.Abs(
                    (IsTimeSpan.time_span - reservationfromList.ReservationTime).TotalMinutes
                    ) < stepInt)
                {
                    IsTimeSpan.IsAllowed = false;
                    break;
                }
            }
            returnlist.Add(IsTimeSpan);
        }
        return returnlist;
    }
    public async Task<ReservationDto> GetReservationById(string reservationId)
    {
        var reservation = await _repository.GetByIdAsync(reservationId);
        if (reservation == null) return null;
        return new ReservationDto
        {
            Reservation_ID = reservation.Reservation_ID,
            RentObjectRoomId = reservation.Room_ID,
            UserId = reservation.User_ID,
            CreatedAt = reservation.CreatedAt,
            ReservationTime = reservation.ReservationTime,
            Status = reservation.Status,
            ReservationDate = reservation.ReservationDate

        }
            ;
    }
    public async Task<List<ReservationDto> > GetReservationByUserId(string UserId)
    {
        var reservations = await _repository.GetByUserIdAsync(UserId);


        if (reservations.Count == 0) return null;


        var ListReservationDto = new List<ReservationDto>();
        foreach (var reservation in reservations)
        {
            var localDateTime = (reservation.ReservationDate + reservation.ReservationTime).ToLocalTime();
            ListReservationDto.Add(new ReservationDto
            {
                Reservation_ID = reservation.Reservation_ID,
                RentObjectRoomId = reservation.Room_ID,
                UserId = reservation.User_ID,
                CreatedAt = reservation.CreatedAt,
                ReservationTime = localDateTime.TimeOfDay,
                Status = reservation.Status,
                ReservationDate = reservation.ReservationDate

            });
        }

        return ListReservationDto;
    }

    public async Task<GeneralResponse> CancelReservationAsync(string reservationId)
    {
        var reservation = await _repository.GetByIdAsync(reservationId);
        if (reservation == null)
            return new GeneralResponse { Success = false, Message = "Reservation not found." };

        if (reservation.Status == ReservationStatus.Cancelled)
            return new GeneralResponse { Success = false, Message = "Reservation is already canceled." };

        reservation.Status = ReservationStatus.Cancelled;
        reservation.ReservationDate = DateTime.SpecifyKind(reservation.ReservationDate, DateTimeKind.Utc);
        reservation.CreatedAt = DateTime.SpecifyKind(reservation.CreatedAt, DateTimeKind.Utc);
        await _repository.UpdateAsync(reservation);
        await _repository.SaveChangesAsync();

        // await _paymentService.CancelPaymentAsync(reservation.Reservation_ID);

        var user = await _userRepository.GetByIdAsync(reservation.User_ID); 
        await _emailService.SendReservationCancelledAsync(user.Email, reservation.Reservation_ID);

        return new GeneralResponse { Success = true, Message = "Reservation canceled successfully." };
    }    
}