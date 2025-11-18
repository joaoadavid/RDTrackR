using Microsoft.AspNetCore.Mvc;
using RDTrackR.API.Attributes;
using RDTrackR.Application.UseCases.Overview.Get;
using RDTrackR.Communication.Responses.Overview;

namespace RDTrackR.API.Controllers
{
    [AuthenticatedUser]
    public class OverviewController : RDTrackRBaseController
    {
        [HttpGet]
        [ProducesResponseType(typeof(ResponseOverviewJson), StatusCodes.Status200OK)]
        public async Task<IActionResult> Get(
            [FromServices] IGetOverviewUseCase useCase)
        {
            var result = await useCase.Execute();
            return Ok(result);
        } 
    }
}
