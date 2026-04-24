namespace Domain;
public class Tag
{
    public string Tag_ID { get; set; } = Guid.NewGuid().ToString("N");
    public string Name { get; set; } = string.Empty;

    public ICollection<Rent_Object_Tagged> Object_tagged { get; set; }   
}

