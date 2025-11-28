
namespace RDTrackR.Communication.Requests.AuditLogs
{
    public class RequestGetAuditLogsPagedJson
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;

        public string? Type { get; set; }
        public string? Search { get; set; }
    }
}
