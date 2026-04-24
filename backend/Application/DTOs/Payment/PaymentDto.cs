namespace Application.DTOs;
using Domain.Enums;

public class PaymentDto
{
    public string Payment_ID { get; set; } = string.Empty;
    public string Reservation_ID { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public PaymentStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? CanceledAt { get; set; }
}