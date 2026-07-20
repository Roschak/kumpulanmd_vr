using VRHaji.Web.Models;

namespace VRHaji.Web.Interfaces;

/// <summary>Tracking dan penyimpanan progress pengguna.</summary>
public interface IProgressService
{
    Task<IReadOnlyList<UserProgress>> GetProgressAsync(string userId);
    Task<int> GetHighestCompletedSceneAsync(string userId);
    Task SaveCheckpointAsync(string userId, int sceneId, int checkpointId, int skor);
    Task ResetAsync(string userId);
}
