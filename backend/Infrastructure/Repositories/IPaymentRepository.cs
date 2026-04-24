namespace Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Domain;
using Infrastructure.Persistence;

public interface IPaymentRepository
{
    Task<Payment?> GetByIdAsync(string paymentId);
    Task AddAsync(Payment payment);
    Task SaveChangesAsync();
    IQueryable<Domain.Payment> Query();
}