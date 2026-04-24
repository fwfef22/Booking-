using Domain;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
namespace Infrastructure.Repositories;
public class TagRepository : ITagRepository
{
    private readonly AppDbContext _context;
    public TagRepository(AppDbContext context) => _context = context;

    public async Task<Tag> GetByIdAsync(string tag_id) => await _context.Tags.FindAsync(tag_id);
    public async Task<Tag> GetByNameAsync(string tag_name) => await _context.Tags.FirstOrDefaultAsync(t => t.Name == tag_name);


    public async Task AddAsync(Tag tag)
    {
        _context.Tags.Add(tag);
    }

    public async Task<List<Tag>> GetAllAsync()
    {
        return await _context.Tags.ToListAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public IQueryable<Tag> Query()
    {
        return _context.Tags;
    }
}
