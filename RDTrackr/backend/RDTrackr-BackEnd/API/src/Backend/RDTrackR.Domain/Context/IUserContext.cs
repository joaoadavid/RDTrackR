namespace RDTrackR.Domain.Context
{
    public interface IUserContext
    {
        long UserId { get; }
        string UserName { get; }
        long OrganizationId { get; }
        string Role { get; }
    }
}



