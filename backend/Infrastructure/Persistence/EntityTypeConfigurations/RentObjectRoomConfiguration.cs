using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Domain;
namespace Infrastructure.Persistence.EntityTypeConfigurations;

public class RentObjectRoomConfiguration : IEntityTypeConfiguration<Domain.Rent_Object_Room>
{
    public void Configure(EntityTypeBuilder<Domain.Rent_Object_Room> builder)
    {
        builder.HasKey(or => or.Rent_Object_Room_ID);
        builder.Property(or => or.Name).IsRequired();
        builder.HasOne(or => or.Main_Rent_Object)
            .WithMany(om => om.Object_Rooms)
            .HasForeignKey(or => or.Rent_Object_Main_ID)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);
    }
}