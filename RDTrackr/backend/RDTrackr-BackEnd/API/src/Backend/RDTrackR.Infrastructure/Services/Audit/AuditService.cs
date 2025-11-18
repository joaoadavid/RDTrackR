using RDTrackR.Domain.Context;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Enums;
using RDTrackR.Domain.Repositories.Audit;
using RDTrackR.Domain.Services.Audit;

namespace RDTrackR.Infrastructure.Services.Audit
{
    public class AuditService : IAuditService
    {
        private readonly IAuditLogRepository _repo;
        private readonly IUserContext _user;

        public AuditService(IAuditLogRepository repo, IUserContext user)
        {
            _repo = repo;
            _user = user;
        }

        public async Task Log(AuditActionType type, string description)
        {
            await _repo.AddAsync(new AuditLog
            {
                UserId = _user.UserId,
                UserName = _user.UserName,
                ActionType = type,
                Description = description,
                OrganizationId = _user.OrganizationId,
                Timestamp = DateTime.UtcNow
            });
        }
    }

}
