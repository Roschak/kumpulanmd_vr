using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using VRHaji.Web.Data;
using VRHaji.Web.Interfaces;
using VRHaji.Web.Models;

namespace VRHaji.Web.Services;

/// <summary>Implementasi manajemen scene berbasis EF Core.</summary>
public class SceneService(IDbContextFactory<VRHajiDbContext> factory) : ISceneService
{
    private static readonly JsonSerializerOptions _json = new(JsonSerializerDefaults.Web);

    public async Task<IReadOnlyList<SceneData>> GetAllScenesAsync()
    {
        await using var db = await factory.CreateDbContextAsync();
        return await db.Scenes.AsNoTracking().OrderBy(s => s.Urutan).ToListAsync();
    }

    public async Task<SceneData?> GetSceneByUrutanAsync(int urutan)
    {
        await using var db = await factory.CreateDbContextAsync();
        return await db.Scenes.AsNoTracking()
            .Include(s => s.Checkpoints)
            .FirstOrDefaultAsync(s => s.Urutan == urutan);
    }

    public async Task<IReadOnlyList<CheckpointData>> GetCheckpointsAsync(int sceneId)
    {
        await using var db = await factory.CreateDbContextAsync();
        return await db.Checkpoints.AsNoTracking()
            .Where(c => c.SceneId == sceneId)
            .OrderBy(c => c.Urutan)
            .ToListAsync();
    }

    public EdukasiContent? ParseEdukasi(SceneData scene) =>
        JsonSerializer.Deserialize<EdukasiContent>(scene.EdukasiJson);

    public IReadOnlyList<CheckpointQuestion> ParseQuestions(CheckpointData checkpoint) =>
        JsonSerializer.Deserialize<List<CheckpointQuestion>>(checkpoint.QuestionsJson) ?? [];
}
