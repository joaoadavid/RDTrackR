using Microsoft.EntityFrameworkCore;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Enums;
using RDTrackR.Domain.Repositories.Movements;

namespace RDTrackR.Infrastructure.DataAccess.Repositories
{
    public class MovementRepository :
        IMovementReadOnlyRepository,
        IMovementWriteOnlyRepository
    {
        private readonly RDTrackRDbContext _context;

        public MovementRepository(RDTrackRDbContext context)
        {
            _context = context;
        }

        public async Task<List<Movement>> GetAllAsync(User user)
        {
            return await _context.Movements
                .AsNoTracking()
                .Where(m => m.OrganizationId == user.OrganizationId)
                .Include(m => m.Product)
                .Include(m => m.Warehouse)
                .Include(m => m.CreatedBy)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();
        }

        public async Task<Movement?> GetByIdAsync(long id)
        {
            return await _context.Movements
                .AsNoTracking()
                .Include(m => m.Product)
                .Include(m => m.Warehouse)
                .Include(m => m.CreatedBy)
                .FirstOrDefaultAsync(m => m.Id == id);
        }


        public async Task<List<Movement>> GetByTypeAsync(string type)
        {
            return await _context.Movements
                .AsNoTracking()
                .Include(m => m.Product)
                .Include(m => m.Warehouse)
                .Include(m => m.CreatedBy)
                .Where(m => m.Type.ToString().ToUpper() == type.ToUpper()!)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Movement>> GetFilteredAsync(long? warehouseId, MovementType? type, DateTime? startDate, DateTime? endDate, User user)
        {
            var query = _context.Movements
                .Where(m=>m.OrganizationId == user.OrganizationId)
                .Include(m => m.Product)
                .Include(m => m.Warehouse)
                .Include(m => m.CreatedBy)
                .AsQueryable();

            if (warehouseId.HasValue)
                query = query.Where(m => m.WarehouseId == warehouseId.Value);

            if (type.HasValue)
                query = query.Where(m => m.Type == type.Value);

            if (startDate.HasValue)
                query = query.Where(m => m.CreatedAt >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(m => m.CreatedAt <= endDate.Value);

            return await query
                .OrderByDescending(m => m.CreatedAt)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<int> CountAsync(User user)
        {
            return await _context.Movements.Where(m=>m.OrganizationId == user.OrganizationId).CountAsync();
        }

        public async Task AddAsync(Movement movement)
        {
            await _context.Movements.AddAsync(movement);
        }
    }
}
