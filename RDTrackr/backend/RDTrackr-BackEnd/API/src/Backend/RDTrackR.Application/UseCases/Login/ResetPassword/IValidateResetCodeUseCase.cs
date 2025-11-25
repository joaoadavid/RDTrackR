using RDTrackR.Communication.Requests.Login;

namespace RDTrackR.Application.UseCases.Login.ResetPassword
{
    public interface IValidateResetCodeUseCase
    {
        Task Execute(RequestValidateResetCodeJson request);
    }
}