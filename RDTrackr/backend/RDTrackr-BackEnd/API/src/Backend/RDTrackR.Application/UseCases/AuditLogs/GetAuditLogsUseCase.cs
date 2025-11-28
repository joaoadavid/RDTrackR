using RDTrackR.Communication.Requests.AuditLogs;
using RDTrackR.Communication.Responses.Audit;
using RDTrackR.Communication.Responses.Pages;
using RDTrackR.Domain.Repositories.Audit;

namespace RDTrackR.Application.UseCases.AuditLogs
{
    public class GetAuditLogsUseCase : IGetAuditLogsUseCase
    {
        private readonly IAuditLogRepository _repo;

        public GetAuditLogsUseCase(IAuditLogRepository repo)
        {
            _repo = repo;
        }

        public async Task<PagedResponse<ResponseAuditLogJson>> Execute(RequestGetAuditLogsPagedJson request)
        {
            int page = request.Page <= 0 ? 1 : request.Page;
            int pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

            var (logs, total) = await _repo.GetPagedAsync(
                page, pageSize, request.Type, request.Search
            );

            return new PagedResponse<ResponseAuditLogJson>
            {
                Items = logs.Select(log => new ResponseAuditLogJson
                {
                    User = log.UserName,
                    Action = log.Description,
                    Type = log.ActionType.ToString(),
                    Date = log.Timestamp
                }).ToList(),
                Total = total,
                Page = page,
                PageSize = pageSize
            };
        }
    }
}

