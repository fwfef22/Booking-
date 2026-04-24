namespace Domain;

public class User
{
    public string User_ID { get; set; } = Guid.NewGuid().ToString("N");
    public string First_Name { get; set; } = string.Empty;
    public string Last_Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;
    public string Adres_Miasto { get; set; } = string.Empty;
    public string Adres_Ulica_1 { get; set; } = string.Empty;
    public string Adres_Ulica_2 { get; set; } = string.Empty;
    public string Adres_Budynek { get; set; } = string.Empty;
    public string Adres_Pokoj { get; set; } = string.Empty;
    public string Adres_KodPocztowy { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Phone_Number { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public ICollection<Domain.Rent_Object> Objects { get; set; }
    public ICollection<Domain.Reservation> Reservations { get; set; }
}
