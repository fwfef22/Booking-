using Domain.Enums;

namespace Application.Services;

public interface IEmailService
{
    Task SendReservationCreatedAsync(string to, string reservationId, DateTime checkIn, DateTime checkOut, decimal total);
    Task SendReservationCancelledAsync(string to, string reservationId);
    Task SendObjectCreatedAsync(string to, string objectName);
    Task SendObjectEditedAsync(string to, string objectName);
    Task SendObjectDeletedAsync(string to, string objectName);
    Task SendRegistrationAsync(string to, string userName);
    Task SendLoginAsync(string to, string userName, DateTime loginTime);
    Task SendPaymentAsync(string to, string paymentId, decimal amount);
    Task SendRefundAsync(string to, string paymentId, decimal amount);
}