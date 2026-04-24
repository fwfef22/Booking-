using Domain;
namespace Infrastructure.Repositories;

public interface IRentObjectRoomRepository
{
    Task<Domain.Rent_Object_Room> GetByIdAsync(string Object_room_id);
    Task<List<Domain.Rent_Object_Room> > GetByMainIdAsync(string Object_id);
    IQueryable<Domain.Rent_Object_Room> QueryWithMainOrder();

    Task AddAsync(Domain.Rent_Object_Room _object_room);
    Task<List<Domain.Rent_Object_Room>> GetAllAsync();
    Task SaveChangesAsync();
    
}