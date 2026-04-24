namespace Application.DTOs;

public class CreatePaymentDto
{
    public string Reservation_ID { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}
