namespace RDTrackR.Domain.Repositories.Organization
{
    public interface IOrganizationReadOnlyRepository
    {
        Task<Entities.Organization?> GetByIdAsync(long id);
        Task<bool> ExistsAsync(long id);
        Task<List<Entities.Organization>> GetAllAsync();
    }
}
