namespace VRHaji.Web.Models;

/// <summary>Progress belajar pengguna (diidentifikasi lewat id anonim browser).</summary>
public class UserProgress
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int SceneId { get; set; }
    public int CheckpointId { get; set; }
    public bool Completed { get; set; }
    public int Skor { get; set; }
    public DateTime? CompletedAt { get; set; }
}
