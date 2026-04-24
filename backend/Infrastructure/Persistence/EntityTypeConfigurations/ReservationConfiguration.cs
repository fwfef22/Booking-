using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Domain;
using Domain.Enums;
namespace Infrastructure.Persistence.EntityTypeConfigurations;
public class ReservationConfiguration : IEntityTypeConfiguration<Domain.Reservation>
{
    public void Configure(EntityTypeBuilder<Domain.Reservation> builder)
    {
        builder.HasKey(r => r.Reservation_ID);
        
        builder.Property(r => r.CreatedAt)
            .IsRequired()
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("CURRENT_TIMESTAMP AT TIME ZONE 'UTC'");
        
        builder.Property(r => r.ReservationDate)
            .IsRequired()
            .HasColumnType("timestamp with time zone");
        
        builder.Property(r => r.Status)
            .IsRequired()
            .HasConversion(new EnumToStringConverter<ReservationStatus>());
        
        builder.HasOne(r => r._user)
            .WithMany(u => u.Reservations)
            .HasForeignKey(r => r.User_ID)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(r => r.Room)
            .WithMany(rm => rm.Reservations)
            .HasForeignKey(r => r.Room_ID)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);

    }
}
