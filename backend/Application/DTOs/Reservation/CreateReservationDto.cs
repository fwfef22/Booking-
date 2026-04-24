namespace Application.DTOs;

public class CreateReservationDto
{
    public string RentObjectRoomId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public DateTime ReservationDate_Time { get; set; }
}