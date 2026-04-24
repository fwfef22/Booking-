namespace Domain;
using Domain.Enums;

public class Rent_Object
{
    public string Rent_Object_ID { get; set; } = Guid.NewGuid().ToString("N");
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public int Default_Time { get; set; } = 60;
    public double Pay_for_Hour { get; set; } = 0.0;
    public char FrontEnd_Color { get; set; } = 'r';
    public string Adres_Miasto { get; set; } = string.Empty;
    public string Phone_Number { get; set; } = string.Empty;
    public RentObjectStatus Status { get; set; } = RentObjectStatus.Active;
    public DateTime Created_At { get; set; }
    public int Rating { get; set; } = 0;

    public string Owner_ID { get; set; } = string.Empty;
    public User Owner { get; set; } = new User();


    public ICollection<Rent_Object_Tagged> Object_tagged { get; set; }
    public ICollection<Rent_Object_Room> Object_Rooms { get; set; }

}

