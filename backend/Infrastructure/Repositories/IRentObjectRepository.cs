using Domain;
namespace Infrastructure.Repositories;

public interface IRentObjectRepository
{                                             
    IQueryable<Domain.Rent_Object> Query();
    Task<Domain.Rent_Object> GetByIdAsync(string Object_id);

    Task AddAsync(Domain.Rent_Object _object);
    Task<List<Domain.Rent_Object>> GetAllAsync();
    Task SaveChangesAsync();
    Task <bool> CheckIfNameExistsAsync(string name);
    //Task <bool> CheckIfAdressExistsAsync(string adres_miasto, string adres_ulica_1, string adres_alica_2, string adres_budynek, string adres_kodPocztowy);

}