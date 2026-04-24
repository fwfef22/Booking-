using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Domain;
using Domain.Enums;
namespace Infrastructure.Persistence.EntityTypeConfigurations;
public class RentObjectConfiguration : IEntityTypeConfiguration<Domain.Rent_Object>
{
    public void Configure(EntityTypeBuilder<Domain.Rent_Object> builder)
    {
        builder.HasKey(o => o.Rent_Object_ID);
        builder.Property(o => o.Name).IsRequired();
        builder.Property(o => o.Created_At)
            .IsRequired()
            .HasDefaultValueSql("CURRENT_TIMESTAMP AT TIME ZONE 'UTC'");
        builder.Property(o => o.Status)
            .HasConversion(new EnumToStringConverter<RentObjectStatus>());
        builder.HasOne(o => o.Owner)
            .WithMany(u => u.Objects)
            .HasForeignKey(o => o.Owner_ID)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);
        
    }
}
