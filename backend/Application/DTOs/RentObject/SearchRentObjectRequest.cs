namespace Application.DTOs;

public class SearchRentObjectRequest
{
    public string? Id { get; set; }
    public string? Name { get; set; }
    public string? Adres_Miasto { get; set; }
    public string? Adres_Ulica_1 { get; set; }
    public string? Adres_Budynek { get; set; }
    public string? Adres_KodPocztowy { get; set; }
    public string? Adres_Pokoj {  get; set; }
    public string? Phone_Number { get; set; }
    public string? Owner_ID { get; set; }
    public string? Status { get; set; }
    public List<string>? TagList { get; set; }
    public int? MinRate { get; set; }
    public int? MaxRate { get; set; }
    public int? Limit { get; set; }
}
