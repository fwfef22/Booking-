using Domain;
using Domain.Enums;
namespace Application.DTOs;

public class EditRentObjectRequest
{

    public string Rent_Object_ID { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public int Default_Time { get; set; } = -1;
    public double Pay_for_Hour { get; set; } = -1;
    public char FrontEnd_Color { get; set; } = ' ';
    public string Adres_Miasto { get; set; } = string.Empty;
    public string Phone_Number { get; set; } = string.Empty;

    public int Status { get; set; } = -1;


}
