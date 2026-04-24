using Domain;
namespace Infrastructure.Repositories;
public interface ITagRepository
{
    Task<Tag> GetByIdAsync(string tag_id);
    Task<Tag> GetByNameAsync(string tag_name);

    Task AddAsync(Tag tag);
    Task<List<Tag>> GetAllAsync();
    Task SaveChangesAsync();
    IQueryable<Tag> Query();
}