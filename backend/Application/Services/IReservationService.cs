using Application.DTOs;

namespace Application.Services;

public interface IReservationService
{
    Task<ReservationIdResponse> CreateAsync(CreateReservationDto request);
    Task<ReservationDto> GetReservationById(string reservationId);
    Task<List<ReservationDto>> GetReservationByUserId(string UserId);
    Task<GeneralResponse> CancelReservationAsync(string reservationId);

    Task<List<TimeSpanForReservations>> GetAllowedTimeSpanForReservationByRoomIdAndDate(RequestTimeSpanForReservations request);
}