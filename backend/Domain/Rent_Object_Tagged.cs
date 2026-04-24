namespace Domain;

public class Rent_Object_Tagged
{

    public string Rent_Object_Tagged_ID { get; set; } = Guid.NewGuid().ToString("N");
    public string Tag_ID { get; set; } = string.Empty;
    public Tag Tag {  get; set; }
    public string Rent_Object_ID { get; set; } = string.Empty;
    public Domain.Rent_Object _Rent_Object { get; set; } 
}

