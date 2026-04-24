namespace Domain;
using Domain.Enums;

public class Payment
{
    public string Payment_ID { get; set; } = Guid.NewGuid().ToString("N");
    public decimal Amount { get; set; }

    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public DateTime CreatedAt { get; set; }

    public DateTime? CompletedAt { get; set; }
    public DateTime? CanceledAt { get; set; }

    public string Reservation_ID { get; set; } = string.Empty;
    public Reservation? Reservation { get; set; }
}