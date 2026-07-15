using VRHaji.Web.Interfaces;
using VRHaji.Web.Models;

namespace VRHaji.Web.Services;

/// <summary>Validasi jawaban kuis checkpoint.</summary>
public class ValidationService : IValidationService
{
    public (int Benar, bool Lulus) Validate(
        CheckpointData checkpoint, IReadOnlyList<CheckpointQuestion> questions, int[] answers)
    {
        var benar = 0;
        for (var i = 0; i < questions.Count && i < answers.Length; i++)
        {
            if (answers[i] == questions[i].Correct) benar++;
        }
        return (benar, benar >= checkpoint.MinBenar);
    }
}
