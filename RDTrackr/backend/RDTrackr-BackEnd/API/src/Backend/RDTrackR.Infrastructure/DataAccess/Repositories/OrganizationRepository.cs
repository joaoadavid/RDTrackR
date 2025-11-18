using Microsoft.EntityFrameworkCore;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories.Organization;

namespace RDTrackR.Infrastructure.DataAccess.Repositories
{
    public class OrganizationRepository : IOrganizationReadOnlyRepository, IOrganizationWriteOnlyRepository
    {
        private readonly RDTrackRDbContext _dbContext;
        public OrganizationRepository(RDTrackRDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task AddAsync(Organization organization)
        {
            await _dbContext.Organizations.AddAsync(organization);
        }

        public async Task<bool> ExistsAsync(long id)
        {
            return await _dbContext.Organizations
               .AsNoTracking()
               .AnyAsync(o => o.Id == id);
        }

        public async Task<List<Organization>> GetAllAsync()
        {
            return await _dbContext.Organizations
                  .AsNoTracking()
                  .ToListAsync();
        }

        public async Task<Organization?> GetByIdAsync(long id)
        {
            return await _dbContext.Organizations
                .AsNoTracking()
                .FirstOrDefaultAsync(o => o.Id == id);
        }
    }
}
