namespace Application.DTOs;
using Domain.Enums;

public class PaymentQueryDto
{
    public string? PaymentId { get; set; } 
    public string? ReservationId { get; set; } 
    public decimal? Amount { get; set; }
    public PaymentStatus? Status { get; set; } 
    public DateTime? CreatedAt { get; set;  }
    public DateTime? CompletedAt { get; set; } 
    public DateTime? CanceledAt { get; set; }
}