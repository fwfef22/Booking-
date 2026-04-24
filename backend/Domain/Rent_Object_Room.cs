namespace Domain;

public class Rent_Object_Room
{
    public string Rent_Object_Room_ID { get; set; } = Guid.NewGuid().ToString("N");
    public string Name { get; set; } = string.Empty;
    public string Adres_Ulica_1 { get; set; } = string.Empty;
    public string Adres_Ulica_2 { get; set; } = string.Empty;
    public string Adres_Budynek { get; set; } = string.Empty;
    public string Adres_Pokoj { get; set; } = string.Empty;
    public string Adres_KodPocztowy { get; set; } = string.Empty;

    public string Rent_Object_Main_ID { get; set; } = string.Empty;
    public Rent_Object Main_Rent_Object { get; set; } = new Rent_Object();

    public ICollection<Domain.Reservation> Reservations { get; set; }


}


