using Domain;
namespace Infrastructure.Repositories;

public interface IReservationRepository
{                                             
    IQueryable<Domain.Reservation> Query();
    Task<Domain.Reservation> GetByIdAsync(string Reservation_id);
    Task<List<Domain.Reservation>> GetByUserIdAsync(string User_id);

    Task AddAsync(Domain.Reservation _reservation);
    Task UpdateAsync(Domain.Reservation _reservation);
    Task<List<Domain.Reservation>> GetAllAsync();
    Task<List<Reservation>> GetResevationByRoomIdAndDate(string room_id, DateTime ReservationDate);
    Task SaveChangesAsync();
   
}