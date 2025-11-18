namespace RDTrackR.Domain.Entities
{
    public class User : EntityTenantBase
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public Guid UserIdentifier { get; set; } = Guid.NewGuid();
        public string Role { get; set; } = "Admin";
    }

}