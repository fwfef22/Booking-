using Domain;
namespace Application.DTOs;

public class AddRentObjectRoom
{
    public string Rent_Obj_Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Adres_Ulica_1 { get; set; } = string.Empty;
    public string Adres_Ulica_2 { get; set; } = string.Empty;
    public string Adres_Budynek { get; set; } = string.Empty;
    public string Adres_Pokoj { get; set; } = string.Empty;
    public string Adres_KodPocztowy { get; set; } = string.Empty;
}
