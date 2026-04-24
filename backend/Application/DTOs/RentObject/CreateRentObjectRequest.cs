using Domain;
namespace Application.DTOs;

public class CreateRentObjectRequest
{
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public int Default_Time { get; set; } = 60;
    public double Pay_for_Hour { get; set; } = 0.0;
    public char FrontEnd_Color { get; set; } = 'r';
    public string Adres_Miasto { get; set; } = string.Empty;
    public string Phone_Number { get; set; } = string.Empty;
    public string Owner_ID { get; set; } = string.Empty;

    public List<CreateRentObjectRoomDto> RoomsList { get; set; } = new();

    public List<string> TagList { get; set; } = new();
}
