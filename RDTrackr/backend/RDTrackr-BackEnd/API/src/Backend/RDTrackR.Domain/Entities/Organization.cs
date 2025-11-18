namespace RDTrackR.Domain.Entities
{
    public class Organization : EntityBase
    {
        public string Name { get; set; } = string.Empty;

        public List<User> Users { get; set; } = new();
    }
}

