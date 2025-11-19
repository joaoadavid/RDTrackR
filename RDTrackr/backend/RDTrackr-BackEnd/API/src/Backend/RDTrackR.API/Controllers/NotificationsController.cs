using Microsoft.AspNetCore.Mvc;
using RDTrackR.API.Attributes;
using RDTrackR.Application.UseCases.Notifications;
using RDTrackR.Communication.Responses.Notifications;

namespace RDTrackR.API.Controllers
{
    [AuthenticatedUser]
    public class NotificationsController : RDTrackRBaseController
    {
        [HttpGet("notifications")]
        [ProducesResponseType(typeof(List<ResponseNotificationJson>), StatusCodes.Status200OK)]

        public async Task<IActionResult> GetUnread(
            [FromServices] IGetNotificationUseCase useCase)
        {
            return Ok(await useCase.Execute());
        }

        [HttpPost("notifications/{id}/read")]
        public async Task<IActionResult> MarkAsRead(
            long id,
            [FromServices] IMarkNotificationAsReadUseCase useCase)
        {
            await useCase.Execute(id);
            return NoContent();
        }
    }


}
