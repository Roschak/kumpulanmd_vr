namespace VRHaji.Web.Models;

/// <summary>Entitas scene simulasi (Scene 01 - 11).</summary>
public class SceneData
{
    public int Id { get; set; }
    public string Nama { get; set; } = string.Empty;
    public string Deskripsi { get; set; } = string.Empty;
    public int Urutan { get; set; }
    public string Lokasi { get; set; } = string.Empty;
    public string Waktu { get; set; } = string.Empty;
    /// <summary>Konfigurasi tambahan scene dalam bentuk JSON (durasi, objective, dsb).</summary>
    public string ConfigJson { get; set; } = "{}";
    /// <summary>Konten edukasi (penjelasan, dalil, hikmah, larangan, tips) dalam JSON.</summary>
    public string EdukasiJson { get; set; } = "{}";
    public ICollection<CheckpointData> Checkpoints { get; set; } = [];
}
