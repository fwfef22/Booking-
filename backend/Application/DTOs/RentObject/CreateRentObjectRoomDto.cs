using Domain;
namespace Application.DTOs;

public class CreateRentObjectRoomDto
{
    public string Name { get; set; } = string.Empty;
    public string Adres_Ulica_1 { get; set; } = string.Empty;
    public string Adres_Ulica_2 { get; set; } = string.Empty;
    public string Adres_Budynek { get; set; } = string.Empty;
    public string Adres_Pokoj { get; set; } = string.Empty;
    public string Adres_KodPocztowy { get; set; } = string.Empty;
}
