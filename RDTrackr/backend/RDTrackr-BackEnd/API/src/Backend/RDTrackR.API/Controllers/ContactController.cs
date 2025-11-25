using Microsoft.AspNetCore.Mvc;
using RDTrackR.Application.UseCases.Contact;
using RDTrackR.Communication.Requests.Contact;

namespace RDTrackR.API.Controllers
{

    public class ContactController : RDTrackRBaseController
    {
        [HttpPost]
        public async Task<IActionResult> SendMessage(
           [FromServices] ISendContactMessageUseCase useCase,
           [FromBody] RequestContactJson request)
        {
            await useCase.Execute(request);
            return Ok(new { message = "Mensagem enviada com sucesso!" });
        }
    }
}
