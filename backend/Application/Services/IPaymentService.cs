using Application.DTOs;

namespace Application.Services;

public interface IPaymentService
{
    Task<GeneralResponse> CreatePaymentAsync(CreatePaymentDto request);
    Task<GeneralResponse> CancelPaymentAsync(string reservationId);
    Task<GeneralResponse> CancelPaymentConfirmAsync(string reservationId);
    Task<PaymentDto> GetPaymentByPaymentId(string paymentId);
    Task<List<PaymentDto>> GetPaymentsByReservationId(string reservationId);
    Task<List<PaymentDto>> QueryPaymentsAsync(PaymentQueryDto query);
}