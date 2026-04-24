namespace Application.DTOs;
using Domain.Enums;

public class ReservationDto
{
    public string RentObjectRoomId { get; set; } = string.Empty;
    public string Reservation_ID { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;

    public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
    public DateTime CreatedAt { get; set; }
    public DateTime ReservationDate { get; set; }

    public TimeSpan ReservationTime { get; set; }
}