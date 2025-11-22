using Microsoft.AspNetCore.Mvc;
using RDTrackR.API.Attributes;
using RDTrackR.Application.UseCases.AuditLogs;
using RDTrackR.Communication.Responses.Audit;

namespace RDTrackR.API.Controllers
{
    [AuthenticatedUser("admin")]
    public class AuditLogController : RDTrackRBaseController
    {
        [HttpGet("audit/logs")]
        [ProducesResponseType(typeof(List<ResponseAuditLogJson>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetLogs(
            [FromQuery] string? type,
            [FromQuery] string? search,
            [FromServices] IGetAuditLogsUseCase useCase)
        {
            var result = await useCase.Execute(type, search);
            return Ok(result);
        }
    }
}
