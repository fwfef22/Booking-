using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Domain;
namespace Infrastructure.Persistence.EntityTypeConfigurations;
public class RentObjectTaggedConfiguration : IEntityTypeConfiguration<Rent_Object_Tagged>
{
    public void Configure(EntityTypeBuilder<Rent_Object_Tagged> builder)
    {
        builder.HasKey(ot => ot.Rent_Object_Tagged_ID);

        builder.HasIndex(ot => new { ot.Rent_Object_ID, ot.Tag_ID }).IsUnique();
        
        builder.HasOne(ot => ot._Rent_Object)
            .WithMany(o => o.Object_tagged)
            .HasForeignKey(ot => ot.Rent_Object_ID)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ot => ot.Tag)
            .WithMany(t => t.Object_tagged)
            .HasForeignKey(ot => ot.Tag_ID)
            .OnDelete(DeleteBehavior.Cascade);

    }
}

