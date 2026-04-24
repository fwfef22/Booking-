namespace Application.DTOs;
using Domain.Enums;

public class RentObjectRoomDto
{
    public string Rent_Object_ID { get; set; } = string.Empty;
    public string Rent_Object_Room_ID { get; set; } = string.Empty;
    public string Name_Object { get; set; } = string.Empty;
    public string Name_Object_Room { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public int Default_Time { get; set; } = 60;
    public double Pay_for_Hour { get; set; } = 0.0;
    public char FrontEnd_Color { get; set; } = 'r';
    public int Rate { get; set; }
    
    // Address fields
    public string Adres_Miasto { get; set; } = string.Empty;
    public string Adres_Ulica_1 { get; set; } = string.Empty;
    public string Adres_Ulica_2 { get; set; } = string.Empty;
    public string Adres_Budynek { get; set; } = string.Empty;
    public string Adres_Pokoj {  get; set; } = string.Empty;
    public string Adres_KodPocztowy { get; set; } = string.Empty;
    
    public string Phone_Number { get; set; } = string.Empty;
    public DateTime Created_At { get; set; }
    public string Owner_ID { get; set; } = string.Empty;
    public RentObjectStatus Status { get; set; } = RentObjectStatus.Active;

    public List<TagDto> TagList { get; set; } = new();
}
