using Microsoft.AspNetCore.Mvc;
using RDTrackR.API.Attributes;
using RDTrackR.Application.UseCases.User.Admin;
using RDTrackR.Communication.Requests.User;
using RDTrackR.Communication.Responses.User.Admin;

namespace RDTrackR.API.Controllers
{
    [AuthenticatedUser("Admin")]
    [Route("users/admin")]
    public class AdminUserController : RDTrackRBaseController
    {
        [HttpGet]
        [ProducesResponseType(typeof(List<ResponseShortUserJson>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll(
            [FromServices] IGetAllUsersUseCase useCase)
            => Ok(await useCase.Execute());

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        
        public async Task<IActionResult> Update(
            long id,
            [FromBody] RequestAdminUpdateUserJson request,
            [FromServices] IAdminUpdateUserUseCase useCase)
        {
            await useCase.Execute(id, request);
            return NoContent();
        }

        [HttpPatch("{id}/toggle")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> ToggleActive(
            long id,
            [FromServices] IAdminToggleUserActiveUseCase useCase)
        {
            await useCase.Execute(id);
            return NoContent();
        }
    }
}
