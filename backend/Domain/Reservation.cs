namespace Domain;
using Domain.Enums;

public class Reservation
{
    public string Reservation_ID { get; set; } = Guid.NewGuid().ToString("N");
   
    public DateTime CreatedAt { get; set; }

    public DateTime ReservationDate { get; set; }

    public TimeSpan ReservationTime { get; set; } = TimeSpan.Zero;

    public ReservationStatus Status { get; set; } = ReservationStatus.Pending;

    public string Room_ID { get; set; } = string.Empty;
    public Rent_Object_Room Room { get; set; } = new(); 

    public string User_ID { get; set; } = string.Empty;
    public User _user { get; set; } = new User();

    public ICollection<Payment> Payments { get; set; } = new List<Payment>();



}

