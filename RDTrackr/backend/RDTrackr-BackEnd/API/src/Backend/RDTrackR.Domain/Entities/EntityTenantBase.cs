namespace RDTrackR.Domain.Entities
{
    public abstract class EntityTenantBase : EntityBase
    {
        public long OrganizationId { get; set; }

        public Organization Organization { get; set; } = null!;
    }
}
