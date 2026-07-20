using VRHaji.Web.Models;

namespace VRHaji.Web.Interfaces;

/// <summary>Validasi jawaban checkpoint.</summary>
public interface IValidationService
{
    /// <summary>Menghitung jumlah benar dan status lulus untuk jawaban pengguna.</summary>
    (int Benar, bool Lulus) Validate(CheckpointData checkpoint, IReadOnlyList<CheckpointQuestion> questions, int[] answers);
}
