namespace VRHaji.Web.Models;

/// <summary>Checkpoint kuis validasi pemahaman pada sebuah scene.</summary>
public class CheckpointData
{
    public int Id { get; set; }
    public int SceneId { get; set; }
    public int Urutan { get; set; }
    public string Nama { get; set; } = string.Empty;
    /// <summary>Daftar pertanyaan dalam JSON: [{q, options[], correct}].</summary>
    public string QuestionsJson { get; set; } = "[]";
    /// <summary>Jumlah minimal jawaban benar agar lulus.</summary>
    public int MinBenar { get; set; }
    public SceneData? Scene { get; set; }
}
