namespace RDTrackR.Domain.Entities
{
    public class Notification : EntityTenantBase
    {
        public long UserId { get; set; }
        public string Message { get; set; } = null!;
        public bool Read { get; set; }
    }

}
