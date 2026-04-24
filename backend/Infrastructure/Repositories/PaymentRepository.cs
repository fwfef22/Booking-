using Domain;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
namespace Infrastructure.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly AppDbContext _context;

    public PaymentRepository(AppDbContext context) => _context = context;

    public async Task<Payment?> GetByIdAsync(string paymentId) => await _context.Payments.FindAsync(paymentId);

    public async Task AddAsync(Payment payment)
    {
        _context.Payments.Add(payment);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public IQueryable<Domain.Payment> Query()
    {
        return _context.Payments;
    }
}