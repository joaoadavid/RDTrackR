using RDTrackR.Communication.Requests.AuditLogs;
using RDTrackR.Communication.Responses.Audit;
using RDTrackR.Communication.Responses.Pages;

namespace RDTrackR.Application.UseCases.AuditLogs
{
    public interface IGetAuditLogsUseCase
    {
        Task<PagedResponse<ResponseAuditLogJson>> Execute(RequestGetAuditLogsPagedJson request);
    }
}