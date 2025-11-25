using Microsoft.AspNetCore.Mvc;
using RDTrackR.API.Attributes;
using RDTrackR.Application.UseCases.Movements.GetAll;
using RDTrackR.Application.UseCases.Movements.Register;
using RDTrackR.Communication.Requests.Movements;
using RDTrackR.Communication.Responses.Movements;
using RDTrackR.Communication.Responses.Pages;

namespace RDTrackR.API.Controllers
{
    [AuthenticatedUser]
    public class MovementController : RDTrackRBaseController
    {
        [HttpGet]
        [ProducesResponseType(typeof(PagedResponse<ResponseMovementJson>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll(
           [FromServices] IGetAllMovementsUseCase useCase,
           [FromQuery] RequestGetMovementsPagedJson request)
        {
            var result = await useCase.Execute(request);
            return Ok(result);
        }

        [HttpPost]
        [ProducesResponseType(typeof(ResponseMovementJson), StatusCodes.Status201Created)]
        public async Task<IActionResult> Register(
            [FromServices] IRegisterMovementUseCase useCase,
            [FromBody] RequestRegisterMovementJson request)
        {
            var result = await useCase.Execute(request);
            return Created(string.Empty, result);
        }
    }

}
