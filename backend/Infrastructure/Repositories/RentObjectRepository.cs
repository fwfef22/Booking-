using Domain;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
namespace Infrastructure.Repositories;

public class RentObjectRepository : IRentObjectRepository
{
    private readonly AppDbContext _context;

    public RentObjectRepository(AppDbContext context) => _context = context;

    public async Task<Domain.Rent_Object> GetByIdAsync(string object_id) => await _context.Rent_Objects.FindAsync(object_id);

    public async Task AddAsync(Domain.Rent_Object _object)
    {
        _context.Rent_Objects.Add(_object);
    }

    public async Task<List<Domain.Rent_Object>> GetAllAsync()
    {
        return await _context.Rent_Objects.ToListAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task<bool> CheckIfNameExistsAsync(string name)
    {
        return await _context.Rent_Objects.AnyAsync(o => o.Name == name);
    }

    /*
    public async Task<bool> CheckIfAdressExistsAsync(string adres_miasto, string adres_ulica_1, string adres_ulica_2, string adres_budynek, string adres_kodPocztowy)
    {
        return await _context.Rent_Objects.AnyAsync(o => o.Adres_Miasto == adres_miasto && o.Adres_Ulica_1 == adres_ulica_1 && o.Adres_Ulica_2 == adres_ulica_2 && o.Adres_Budynek == adres_budynek && o.Adres_KodPocztowy == adres_kodPocztowy);
    }
    */

    public IQueryable<Domain.Rent_Object> Query()
    {
        return _context.Rent_Objects;
    }
}
