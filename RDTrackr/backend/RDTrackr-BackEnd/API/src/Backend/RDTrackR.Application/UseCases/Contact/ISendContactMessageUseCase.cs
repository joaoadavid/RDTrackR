using RDTrackR.Communication.Requests.Contact;

namespace RDTrackR.Application.UseCases.Contact
{
    public interface ISendContactMessageUseCase
    {
        Task Execute(RequestContactJson request);
    }
}