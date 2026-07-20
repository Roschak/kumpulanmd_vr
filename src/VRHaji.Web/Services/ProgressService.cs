using Microsoft.EntityFrameworkCore;
using VRHaji.Web.Data;
using VRHaji.Web.Interfaces;
using VRHaji.Web.Models;

namespace VRHaji.Web.Services;

/// <summary>Implementasi tracking progress berbasis EF Core.</summary>
public class ProgressService(IDbContextFactory<VRHajiDbContext> factory) : IProgressService
{
    public async Task<IReadOnlyList<UserProgress>> GetProgressAsync(string userId)
    {
        await using var db = await factory.CreateDbContextAsync();
        return await db.UserProgress.AsNoTracking()
            .Where(p => p.UserId == userId)
            .ToListAsync();
    }

    public async Task<int> GetHighestCompletedSceneAsync(string userId)
    {
        await using var db = await factory.CreateDbContextAsync();
        var completedScenes = await db.UserProgress.AsNoTracking()
            .Where(p => p.UserId == userId && p.Completed && p.CheckpointId == 0)
            .Select(p => p.SceneId)
            .ToListAsync();
        return completedScenes.Count == 0 ? 0 : completedScenes.Max();
    }

    public async Task SaveCheckpointAsync(string userId, int sceneId, int checkpointId, int skor)
    {
        if (string.IsNullOrWhiteSpace(userId)) return;
        await using var db = await factory.CreateDbContextAsync();
        var existing = await db.UserProgress.FirstOrDefaultAsync(
            p => p.UserId == userId && p.SceneId == sceneId && p.CheckpointId == checkpointId);
        if (existing is null)
        {
            db.UserProgress.Add(new UserProgress
            {
                UserId = userId, SceneId = sceneId, CheckpointId = checkpointId,
                Completed = true, Skor = skor, CompletedAt = DateTime.UtcNow
            });
        }
        else
        {
            existing.Completed = true;
            existing.Skor = Math.Max(existing.Skor, skor);
            existing.CompletedAt = DateTime.UtcNow;
        }
        await db.SaveChangesAsync();
    }

    public async Task ResetAsync(string userId)
    {
        await using var db = await factory.CreateDbContextAsync();
        await db.UserProgress.Where(p => p.UserId == userId).ExecuteDeleteAsync();
    }
}
