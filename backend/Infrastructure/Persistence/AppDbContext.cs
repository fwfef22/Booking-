using Microsoft.EntityFrameworkCore;
using Domain;

namespace Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Tag> Tags { get; set; }
    public DbSet<Domain.Rent_Object> Rent_Objects { get; set; }
    public DbSet<Rent_Object_Tagged> Rent_Object_Tagged { get; set; }
    public DbSet<Rent_Object_Room> Rent_Object_Room { get; set; }

    public DbSet<Reservation> Reservations { get; set; }

    public DbSet<Payment> Payments { get; set; }



    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}

