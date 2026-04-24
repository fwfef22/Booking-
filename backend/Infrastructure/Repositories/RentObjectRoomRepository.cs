using Domain;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
namespace Infrastructure.Repositories;

public class RentObjectRoomRepository : IRentObjectRoomRepository
{
    private readonly AppDbContext _context;

    public RentObjectRoomRepository(AppDbContext context) => _context = context;

    public async Task<Domain.Rent_Object_Room> GetByIdAsync(string Object_room_id) => await _context.Rent_Object_Room.FindAsync(Object_room_id);

    public async Task<List<Domain.Rent_Object_Room> > GetByMainIdAsync(string Object_id)
    {
        return await _context.Rent_Object_Room.Where(or => or.Rent_Object_Main_ID == Object_id).ToListAsync();
    }

    public async Task AddAsync(Domain.Rent_Object_Room _object_room)
    {
        _context.Rent_Object_Room.Add(_object_room);
    }

    public async Task<List<Domain.Rent_Object_Room>> GetAllAsync()
    {
        return await _context.Rent_Object_Room.ToListAsync();
    }
    public IQueryable<Domain.Rent_Object_Room> QueryWithMainOrder()
    {
        return _context.Rent_Object_Room
          .Include(or => or.Main_Rent_Object);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

}
