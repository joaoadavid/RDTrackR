using Microsoft.EntityFrameworkCore;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories.Audit;

namespace RDTrackR.Infrastructure.DataAccess.Repositories
{
    public class AuditLogRepository : IAuditLogRepository
    {
        private readonly RDTrackRDbContext _context;

        public AuditLogRepository(RDTrackRDbContext context) => _context = context;

        public async Task AddAsync(AuditLog log)
        {
            await _context.AuditLogs.AddAsync(log);
        }

        public async Task<List<AuditLog>> GetRecentAsync(string? filterType, string? search)
        {
            var query = _context.AuditLogs.AsQueryable();

            if (!string.IsNullOrEmpty(filterType))
                query = query.Where(x => x.ActionType.ToString() == filterType);

            if (!string.IsNullOrEmpty(search))
                query = query.Where(x => x.Description.Contains(search));

            return await query
                .OrderByDescending(x => x.Timestamp)
                .Take(100)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<(List<AuditLog> Logs, int Total)> GetPagedAsync(
        int page,
        int pageSize,
        string? filterType,
        string? search)
        {
            var query = _context.AuditLogs.AsQueryable();

            if (!string.IsNullOrWhiteSpace(filterType) && filterType != "all")
                query = query.Where(x => x.ActionType.ToString() == filterType);

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(x => x.Description.Contains(search));

            var total = await query.CountAsync();

            var logs = await query
                .OrderByDescending(x => x.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking()
                .ToListAsync();

            return (logs, total);
        }

    }
}
