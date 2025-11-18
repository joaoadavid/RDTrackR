using Microsoft.AspNetCore.Mvc;
using RDTrackR.API.Attributes;
using RDTrackR.Domain.Context;
using RDTrackR.Domain.Repositories.Notifications;

namespace RDTrackR.API.Controllers
{
    [AuthenticatedUser]
    public class NotificationsController : RDTrackRBaseController
    {
        [HttpGet("notifications")]
        public async Task<IActionResult> GetUnread(
            [FromServices] IUserContext user,
            [FromServices] INotificationRepository repo)
        {
            return Ok(await repo.GetAllUnreadAsync(user));
        }


        [HttpPost("notifications/{id}/read")]
        public async Task<IActionResult> MarkAsRead(long id,
            [FromServices] INotificationRepository repo)
        {
            await repo.MarkAsReadAsync(id);
            return NoContent();
        }

    }
}
