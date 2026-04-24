using System.Runtime.CompilerServices;
using Domain;
namespace Infrastructure.Repositories;
public interface IUserRepository
{
    Task<User> GetByIdAsync(string user_id);

    Task AddAsync(User user);
    Task<List<User>> GetAllAsync();
    Task SaveChangesAsync();
    Task <bool> CheckIfEmailExistsAsync(string email);
}
