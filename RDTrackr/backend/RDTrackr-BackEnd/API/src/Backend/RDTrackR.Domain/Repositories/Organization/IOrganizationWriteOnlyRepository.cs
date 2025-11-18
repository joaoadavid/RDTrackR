namespace RDTrackR.Domain.Repositories.Organization
{
    public interface IOrganizationWriteOnlyRepository
    {
        Task AddAsync(Entities.Organization organization);
    }
}
