using Microsoft.AspNetCore.Mvc;
using RDTrackR.API.Attributes;
using RDTrackR.Application.UseCases.AuditLogs;
using RDTrackR.Communication.Requests.AuditLogs;
using RDTrackR.Communication.Responses.Audit;
using RDTrackR.Communication.Responses.Pages;

namespace RDTrackR.API.Controllers
{
    [AuthenticatedUser("admin")]
    public class AuditLogController : RDTrackRBaseController
    {
        [HttpGet("audit/logs")]
        [ProducesResponseType(typeof(PagedResponse<ResponseAuditLogJson>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetLogs(
        [FromQuery] RequestGetAuditLogsPagedJson request,
        [FromServices] IGetAuditLogsUseCase useCase)
        {
            var result = await useCase.Execute(request);
            return Ok(result);
        }
    }
}
