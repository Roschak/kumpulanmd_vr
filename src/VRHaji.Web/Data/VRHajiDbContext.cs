using Microsoft.EntityFrameworkCore;
using VRHaji.Web.Models;

namespace VRHaji.Web.Data;

/// <summary>DbContext utama aplikasi VR Education Haji &amp; Umrah.</summary>
public class VRHajiDbContext(DbContextOptions<VRHajiDbContext> options) : DbContext(options)
{
    public DbSet<SceneData> Scenes => Set<SceneData>();
    public DbSet<CheckpointData> Checkpoints => Set<CheckpointData>();
    public DbSet<UserProgress> UserProgress => Set<UserProgress>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<SceneData>(e =>
        {
            e.HasIndex(s => s.Urutan).IsUnique();
            e.HasMany(s => s.Checkpoints)
             .WithOne(c => c.Scene)
             .HasForeignKey(c => c.SceneId)
             .OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<UserProgress>(e =>
        {
            e.HasIndex(p => new { p.UserId, p.SceneId, p.CheckpointId }).IsUnique();
        });
    }
}
