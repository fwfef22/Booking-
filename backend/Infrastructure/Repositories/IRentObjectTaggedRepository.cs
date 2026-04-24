using Domain;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
namespace Infrastructure.Repositories;

public interface IRentObjectTaggedRepository
{

    Task AddAsync(Rent_Object_Tagged objecttagged);
    Task<List<Rent_Object_Tagged>> GetAllAsync();
    Task<List<Rent_Object_Tagged>> GetByTagIdAsync(string tag_id);
    Task<List<Rent_Object_Tagged>> GetByObjectIdAsync(string object_id);
    Task<List<Rent_Object_Tagged>> GetByAllTagIdsAsync(List<string> tagIds);
    Task SaveChangesAsync();
    IQueryable<Rent_Object_Tagged> Query();
}