namespace Application.DTOs;

public class ReservationIdResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string ReservationId { get; set; } = string.Empty;
}