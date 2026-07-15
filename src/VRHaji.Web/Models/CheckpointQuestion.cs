namespace VRHaji.Web.Models;

/// <summary>DTO pertanyaan checkpoint yang dikirim ke UI.</summary>
public record CheckpointQuestion(string Q, string[] Options, int Correct);

/// <summary>DTO konten edukasi per scene.</summary>
public record EdukasiContent(
    string Judul,
    string[] Penjelasan,
    string[] Dalil,
    string[] Hikmah,
    string[] Larangan,
    string[] Tips);
