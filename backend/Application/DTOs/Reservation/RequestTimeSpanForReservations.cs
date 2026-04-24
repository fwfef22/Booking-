namespace Application.DTOs;

public class RequestTimeSpanForReservations
{
    public DateTime Date { get; set; }
    public string RentObjectRoomId { get; set; } = string.Empty;
}