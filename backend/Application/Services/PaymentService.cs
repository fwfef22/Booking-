using Application.DTOs;
using Infrastructure.Repositories;
using Domain;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace Application.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _repository;
    private readonly IReservationRepository _reservationRepository;
    private readonly IEmailService _emailService;
    private readonly IUserRepository _userRepository;
    public PaymentService(IPaymentRepository repository, IReservationRepository reservationRepository, IEmailService emailService, IUserRepository userRepository)
    {
        _repository = repository;
        _reservationRepository = reservationRepository;
        _emailService = emailService;
        _userRepository = userRepository;
    }

    public async Task<GeneralResponse> CreatePaymentAsync(CreatePaymentDto request)
    {
        var reservation = await _reservationRepository.GetByIdAsync(request.Reservation_ID);
        if (reservation == null)
        {
            return new GeneralResponse
            {
                Success = false,
                Message = "Reservation not found."
            };
        }

        if(request.Amount < 0)
        {
            return new GeneralResponse
            {
                Success = false,
                Message = "Amount must be greater than zero."
            };
        }

        var payment = new Payment
        {
            Amount = request.Amount,
            Reservation_ID = request.Reservation_ID,
            Status = PaymentStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        payment.Status = PaymentStatus.Completed;
        payment.CompletedAt = DateTime.UtcNow;

        reservation.Status = ReservationStatus.Paid;

        await _repository.AddAsync(payment);
        await _repository.SaveChangesAsync();
        var user = await _userRepository.GetByIdAsync(reservation.User_ID);
        await _emailService.SendPaymentAsync(user.Email, payment.Payment_ID, payment.Amount);

        return new GeneralResponse
        {
            Success = true,
            Message = "Payment created and reservation updated successfully."
        };
    }

    public async Task<PaymentDto> GetPaymentByPaymentId(string paymentId)
    {
        var payment = await _repository.Query().FirstOrDefaultAsync(p => p.Payment_ID == paymentId);
        if (payment == null) return null;

        return new PaymentDto
        {
            Payment_ID = payment.Payment_ID,
            Amount = payment.Amount,
            Status = payment.Status,
            CreatedAt = payment.CreatedAt,
            CompletedAt = payment.CompletedAt,
            Reservation_ID = payment.Reservation_ID,
            CanceledAt = payment.CanceledAt
        };
    }

    public async Task<List<PaymentDto>> GetPaymentsByReservationId(string reservationId)
    {
        var payments = await _repository.Query()
            .Where(p => p.Reservation_ID == reservationId)
            .ToListAsync();

        return payments.Select(payment => new PaymentDto
        {
            Payment_ID = payment.Payment_ID,
            Amount = payment.Amount,
            Status = payment.Status,
            CreatedAt = payment.CreatedAt,
            CompletedAt = payment.CompletedAt,
            Reservation_ID = payment.Reservation_ID,
            CanceledAt= payment.CanceledAt
            
        }).ToList();
    }
    public async Task<GeneralResponse> CancelPaymentAsync(string reservationId)
    {
        var reservation = await _reservationRepository.GetByIdAsync(reservationId);

        if (reservation.Status != ReservationStatus.Cancelled)
        {
            return new GeneralResponse
            {
                Success = false,
                Message = "Reservation is not canceled."
            };
        }

        var payments = await _repository.Query()
            .Where(p => p.Reservation_ID == reservationId)
            .ToListAsync();

        string msg = "";
        int i = 0;
        foreach (var payment in payments)
        {
            i++;
            if (payment.Status == PaymentStatus.Completed)
            {

                msg += "Payment #" + i + ": Canceled completed, awaiting for refund\n";
                payment.Status = PaymentStatus.Refunded;
                payment.CanceledAt = DateTime.UtcNow;
                continue;
            }
            if (payment.Status == PaymentStatus.Pending)
            {
                msg += "Payment #" + i + ": Canceled while in Pending\n";
                payment.Status = PaymentStatus.Failed;
                payment.CanceledAt = DateTime.UtcNow;
                continue;
            }
        }

        await _repository.SaveChangesAsync();
        var user = await _userRepository.GetByIdAsync(reservation.User_ID);

        var refundedPayments = payments.Where(p => p.Status == PaymentStatus.Refunded).ToList();
        var totalRefund = refundedPayments.Sum(p => p.Amount);
        var firstPayment = refundedPayments.FirstOrDefault();

        await _emailService.SendRefundAsync(user.Email, firstPayment?.Payment_ID ?? "", totalRefund);

        return new GeneralResponse
        {
            Success = true,
            Message = msg
        };


    }
    public async Task<GeneralResponse> CancelPaymentConfirmAsync(string reservationId)
    {
        var reservation = await _reservationRepository.GetByIdAsync(reservationId);

        if (reservation.Status != ReservationStatus.Cancelled)
        {
            return new GeneralResponse
            {
                Success = false,
                Message = "Reservation is not canceled."
            };
        }

        var payments = await _repository.Query()
            .Where(p => p.Reservation_ID == reservationId)
            .ToListAsync();

        string msg = "";
        int i = 0;
        foreach (var payment in payments)
        {
            i++;
            if (payment.Status == PaymentStatus.Refunded)
            {
                //Spawdzenie refundu etc.
                msg += "Payment #" + i + ": Refund completed\n";
                payment.Status = PaymentStatus.Refunded;
                continue;
            }
        }

        await _repository.SaveChangesAsync();
        var user = await _userRepository.GetByIdAsync(reservation.User_ID);

        var refundedPayments = payments.Where(p => p.Status == PaymentStatus.Refunded).ToList();
        var totalRefund = refundedPayments.Sum(p => p.Amount);
        var firstPayment = refundedPayments.FirstOrDefault();

        await _emailService.SendRefundAsync(user.Email, firstPayment?.Payment_ID ?? "", totalRefund);
        return new GeneralResponse
        {
            Success = true,
            Message = msg
        };
    }
    public async Task<List<PaymentDto>> QueryPaymentsAsync(PaymentQueryDto query)
    {
        var q = _repository.Query();

        if (!string.IsNullOrWhiteSpace(query.PaymentId))
        {
            q = q.Where(p => p.Payment_ID == query.PaymentId);
        }

        if (!string.IsNullOrWhiteSpace(query.ReservationId))
        {
            q = q.Where(p => p.Reservation_ID == query.ReservationId);
        }

        if (query.Amount.HasValue)
        {
            q = q.Where(p => p.Amount == (decimal)query.Amount.Value);
        }

        if (query.Status.HasValue)
        {
            q = q.Where(p => p.Status == query.Status.Value);
        }

        if (query.CreatedAt.HasValue)
        {
            var start = query.CreatedAt.Value.Date;
            var end = start.AddDays(1);
            q = q.Where(p => p.CreatedAt >= start && p.CreatedAt < end);
        }

        if (query.CompletedAt.HasValue)
        {
            var start = query.CompletedAt.Value.Date;
            var end = start.AddDays(1);
            q = q.Where(p => p.CompletedAt.HasValue && p.CompletedAt.Value >= start && p.CompletedAt.Value < end);
        }
        if (query.CanceledAt.HasValue)
        {
            var start = query.CanceledAt.Value.Date;
            var end = start.AddDays(1);
            q = q.Where(p => p.CanceledAt.HasValue && p.CanceledAt.Value >= start && p.CanceledAt.Value < end);
        }

        var payments = await q.ToListAsync();

        return payments.Select(payment => new PaymentDto
        {
            Payment_ID = payment.Payment_ID,
            Amount = payment.Amount,
            Status = payment.Status,
            CreatedAt = payment.CreatedAt,
            CompletedAt = payment.CompletedAt,
            Reservation_ID = payment.Reservation_ID,
            CanceledAt = payment.CanceledAt
        }).ToList();
    }
}