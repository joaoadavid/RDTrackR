using RDTrackR.Domain.Enums;

namespace RDTrackR.Domain.Entities
{
    public class AuditLog : EntityBase
    {
        public long UserId { get; set; }
        public string UserName { get; set; } = null!;
        public AuditActionType ActionType { get; set; }
        public string Description { get; set; } = null!;
        public long OrganizationId { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
