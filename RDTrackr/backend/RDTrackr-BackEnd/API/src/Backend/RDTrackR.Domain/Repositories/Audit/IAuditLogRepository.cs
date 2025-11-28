using RDTrackR.Domain.Entities;

namespace RDTrackR.Domain.Repositories.Audit
{
    public interface IAuditLogRepository
    {
        Task AddAsync(AuditLog log);
        Task<List<AuditLog>> GetRecentAsync(string? filterType, string? search);
        Task<(List<AuditLog> Logs, int Total)> GetPagedAsync(
        int page,
        int pageSize,
        string? filterType,
        string? search);
    }
}
