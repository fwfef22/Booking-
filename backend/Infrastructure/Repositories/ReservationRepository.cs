using Domain;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
namespace Infrastructure.Repositories;

public class ReservationRepository : IReservationRepository
{
    private readonly AppDbContext _context;

    public ReservationRepository(AppDbContext context) => _context = context;

    public async Task<Domain.Reservation> GetByIdAsync(string Reservation_id) => await _context.Reservations.FindAsync(Reservation_id);

    public async Task AddAsync(Domain.Reservation _reservation)
    {
        _context.Reservations.Add(_reservation);
    }

    public async Task UpdateAsync(Domain.Reservation _reservation)
    {
        _context.Reservations.Update(_reservation);
    }

    public async Task<List<Domain.Reservation>> GetByUserIdAsync(string User_id)
    {
        return await _context.Reservations
            .Where(r => r.User_ID == User_id)
            .ToListAsync();
    }

    public async Task<List<Domain.Reservation>> GetAllAsync()
    {
        return await _context.Reservations.ToListAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
    public async Task<List<Reservation>> GetResevationByRoomIdAndDate(string room_id, DateTime ReservationDate)
    {
        return await _context.Reservations.Where(rsv => rsv.Room_ID == room_id)
                                                .Where(rsv => rsv.ReservationDate == ReservationDate)
                                                .ToListAsync();
        

    }


    public IQueryable<Domain.Reservation> Query()
    {
        return _context.Reservations;
    }
}
