using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Domain;
using Domain.Enums;
namespace Infrastructure.Persistence.EntityTypeConfigurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Domain.Payment>
{
    public void Configure(EntityTypeBuilder<Domain.Payment> builder)
    {
        builder.HasKey(p => p.Payment_ID);
        builder.Property(p => p.Amount).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(p => p.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("CURRENT_TIMESTAMP AT TIME ZONE 'UTC'");
        builder.Property(p => p.Status)
            .HasConversion(new EnumToStringConverter<PaymentStatus>());
        builder.HasOne(p => p.Reservation)
            .WithMany(r => r.Payments)
            .HasForeignKey(p => p.Reservation_ID)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);
    }
}