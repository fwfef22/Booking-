namespace Application.DTOs;

public class RegisterRequest
{
    public string First_Name { get; set; }
    public string Last_Name { get; set; }
    public string Email { get; set; }
    public string Adres_Miasto { get; set; }
    public string Adres_Ulica_1 { get; set; }
    public string Adres_Ulica_2 { get; set; }
    public string Adres_Budynek { get; set; }
    public string Adres_Pokoj { get; set; }
    public string Adres_KodPocztowy { get; set; }
    public string Phone_Number { get; set; }
    public string Password { get; set; }
    public string ConfirmPassword { get; set; }
}
