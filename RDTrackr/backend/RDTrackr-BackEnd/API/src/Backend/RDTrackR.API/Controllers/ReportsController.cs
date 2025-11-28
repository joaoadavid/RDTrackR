using Microsoft.AspNetCore.Mvc;
using RDTrackR.API.Attributes;
using RDTrackR.Application.UseCases.Reports;
using RDTrackR.Communication.Responses.Reports;

namespace RDTrackR.API.Controllers
{
    
    [AuthenticatedUser("Admin")]
    public class ReportsController : RDTrackRBaseController
    {
        [HttpGet]
        [ProducesResponseType(typeof(ResponseReportsJson), StatusCodes.Status200OK)]
        public async Task<IActionResult> Get(
            [FromServices] IGetReportsUseCase useCase)
        {
            var result = await useCase.Execute();
            return Ok(result);
        }
    }
}
