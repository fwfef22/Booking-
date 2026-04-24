using Domain;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Linq;
namespace Infrastructure.Repositories;

public class RentObjectTaggedRepository : IRentObjectTaggedRepository
{
    private readonly AppDbContext _context;
    public RentObjectTaggedRepository(AppDbContext context) => _context = context;


    public async Task AddAsync(Rent_Object_Tagged objecttagged)
    {
        _context.Rent_Object_Tagged.Add(objecttagged);
    }

    public async Task<List<Rent_Object_Tagged>> GetAllAsync()
    {
        return await _context.Rent_Object_Tagged.ToListAsync();
    }
    public async Task<List<Rent_Object_Tagged>> GetByTagIdAsync(string tag_id)
    {
        return await _context.Rent_Object_Tagged
            .Where(ot => ot.Tag_ID == tag_id)
            .ToListAsync();
    }
    public async Task<List<Rent_Object_Tagged>> GetByAllTagIdsAsync(List<string> tagIds)
    {
        var tagCount = tagIds.Count;

        return await _context.Rent_Object_Tagged
            .Where(ot => tagIds.Contains(ot.Tag_ID))
            .GroupBy(ot => ot.Rent_Object_ID)
            .Where(g => g.Select(ot => ot.Tag_ID).Distinct().Count() == tagCount)
            .SelectMany(g => g)
            .ToListAsync();
    }
    public async Task<List<Rent_Object_Tagged>> GetByObjectIdAsync(string object_id)
    {
        return await _context.Rent_Object_Tagged
            .Where(ot => ot.Rent_Object_ID == object_id)
            .ToListAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public IQueryable<Rent_Object_Tagged> Query()
    {
        return _context.Rent_Object_Tagged;
    }
}
