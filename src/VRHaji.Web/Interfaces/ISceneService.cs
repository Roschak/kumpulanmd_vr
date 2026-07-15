using VRHaji.Web.Models;

namespace VRHaji.Web.Interfaces;

/// <summary>Manajemen scene dan kontennya.</summary>
public interface ISceneService
{
    Task<IReadOnlyList<SceneData>> GetAllScenesAsync();
    Task<SceneData?> GetSceneByUrutanAsync(int urutan);
    Task<IReadOnlyList<CheckpointData>> GetCheckpointsAsync(int sceneId);
    EdukasiContent? ParseEdukasi(SceneData scene);
    IReadOnlyList<CheckpointQuestion> ParseQuestions(CheckpointData checkpoint);
}
