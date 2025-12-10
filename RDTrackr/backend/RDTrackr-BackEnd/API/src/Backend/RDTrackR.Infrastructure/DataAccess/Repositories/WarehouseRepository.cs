using Microsoft.EntityFrameworkCore;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories.Warehouses;

namespace RDTrackR.Infrastructure.DataAccess.Repositories
{
    public class WarehouseRepository : IWarehouseReadOnlyRepository, IWarehouseWriteOnlyRepository
    {
        private readonly RDTrackRDbContext _context;

        public WarehouseRepository(RDTrackRDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Warehouse warehouse)
        {
            await _context.Warehouses.AddAsync(warehouse);
        }

        public async Task UpdateAsync(Warehouse warehouse)
        {
            _context.Entry(warehouse).State = EntityState.Modified;
        }


        public async Task DeleteAsync(Warehouse warehouse)
        {
            _context.Warehouses.Remove(warehouse);
        }

        public async Task<List<Warehouse>> GetAllAsync(User user)
        {
            return await _context.Warehouses
                .Where(w => w.OrganizationId == user.OrganizationId)
                .Select(w => new Warehouse
                {
                    Id = w.Id,
                    Name = w.Name,
                    Location = w.Location,
                    Capacity = w.Capacity,
                    CreatedByUserId = w.CreatedByUserId,

                    Items = w.StockItems
                        .Where(i => i.Product.Active)
                        .Sum(i => (int?)i.Quantity) ?? 0,

                    Utilization = w.Capacity == 0
                        ? 0
                        : (int)(
                            ((double)(
                                w.StockItems
                                    .Where(i => i.Product.Active)
                                    .Sum(i => (int?)i.Quantity) ?? 0
                            ) / w.Capacity) * 100
                          ),

                    StockItems = w.StockItems
                        .Where(i => i.Product.Active)
                        .ToList()
                })
                .ToListAsync();
        }

        public async Task<List<Warehouse>> GetPagedAsync(
        User user,
        int page,
        int pageSize,
        string? search)
        {
            var query = _context.Warehouses
                .AsNoTracking()
                .Where(w => w.OrganizationId == user.OrganizationId);

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(w =>
                    w.Name.Contains(search) ||
                    w.Location.Contains(search));

            return await query
                .OrderBy(w => w.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(w => new Warehouse
                {
                    Id = w.Id,
                    Name = w.Name,
                    Location = w.Location,
                    Capacity = w.Capacity,
                    CreatedByUserId = w.CreatedByUserId,

                    Items = w.StockItems
                        .Where(i => i.Product.Active)
                        .Sum(i => (int?)i.Quantity) ?? 0,

                    Utilization = w.Capacity == 0
                        ? 0
                        : (int)((
                                (double)(w.StockItems.Where(i => i.Product.Active)
                                .Sum(i => (int?)i.Quantity) ?? 0)
                            / w.Capacity) * 100),

                    StockItems = w.StockItems
                        .Where(i => i.Product.Active)
                        .ToList()
                })
                .ToListAsync();
        }

        public async Task<int> CountAsync(User user, string? search = null)
        {
            var query = _context.Warehouses
                .Where(w => w.OrganizationId == user.OrganizationId);

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(w =>
                    w.Name.Contains(search) ||
                    w.Location.Contains(search));

            return await query.CountAsync();
        }



        public async Task<Warehouse?> GetByIdAsync(long id, User user)
        {
            return await _context.Warehouses
                .AsNoTracking()
                .Include(w => w.StockItems)
                .FirstOrDefaultAsync
                (w => w.Id == id
                && w.CreatedByUserId == user.Id);
        }
    }
}