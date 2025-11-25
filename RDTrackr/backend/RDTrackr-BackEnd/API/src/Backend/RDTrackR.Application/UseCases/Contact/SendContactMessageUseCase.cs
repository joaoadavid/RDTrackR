using RDTrackR.Communication.Requests.Contact;
using RDTrackR.Domain.Services.Email;

namespace RDTrackR.Application.UseCases.Contact
{
    public class SendContactMessageUseCase : ISendContactMessageUseCase
    {
        private readonly IContactEmailService _emailService;

        public SendContactMessageUseCase(IContactEmailService emailService)
        {
            _emailService = emailService;
        }

        public async Task Execute(RequestContactJson request)
        {
            await _emailService.SendContactMessageAsync(
                request.Name,
                request.Email,
                request.Subject,
                request.Message
            );
        }
    }
}
