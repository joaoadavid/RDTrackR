using Microsoft.EntityFrameworkCore;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories.StockItems;

namespace RDTrackR.Infrastructure.DataAccess.Repositories
{
    public class StockItemRepository : IStockItemReadOnlyRepository, IStockItemWriteOnlyRepository
    {
        private readonly RDTrackRDbContext _context;

        public StockItemRepository(RDTrackRDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(StockItem stockItem)
        {
            await _context.StockItems.AddAsync(stockItem);
        }

        public Task UpdateAsync(StockItem stockItem)
        {
            _context.StockItems.Update(stockItem);
            return Task.CompletedTask;
        }

        public async Task<List<StockItem>> GetAllAsync(User user)
        {
            return await _context.StockItems
                .Where(s => s.OrganizationId == user.OrganizationId)
                .Include(s => s.Product)
                .Include(s => s.Warehouse)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<StockItem?> GetByIdAsync(long id)
        {
            return await _context.StockItems
                .Include(s => s.Product)
                .Include(s => s.Warehouse)
                .Include(s => s.CreatedBy)
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<List<StockItem>> GetReplenishmentCandidatesAsync(User user)
        {
            return await _context.StockItems
                .Where(s => s.OrganizationId == user.OrganizationId)
                .Include(s => s.Product)
                .Include(s => s.Warehouse)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<StockItem?> GetByProductAndWarehouseAsync(long productId, long warehouseId)
        {
            return await _context.StockItems
                .FirstOrDefaultAsync(s => s.ProductId == productId && s.WarehouseId == warehouseId);
        }

        public async Task<List<StockItem>> GetByWarehouseAsync(long warehouseId, User user)
        {
            return await _context.StockItems
                .AsNoTracking()
                .Where(s =>
                    s.WarehouseId == warehouseId &&
                    s.OrganizationId == user.OrganizationId &&
                    s.Product.Active == true
                )
                .Include(s => s.Product)
                .OrderBy(s => s.Product.Name)
                .ToListAsync();
        }

        public async Task<List<StockItem>> GetPagedAsync(
                   User user,
                   int page,
                   int pageSize,
                   string? search)
        {
            var query = _context.StockItems
                .AsNoTracking()
                .Include(s => s.Product)
                .Include(s => s.Warehouse)
                .Where(s => s.Product.OrganizationId == user.OrganizationId);

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(s =>
                    s.Product.Name.Contains(search) ||
                    s.Product.Sku.Contains(search));
            }

            query = query.Where(s =>
                s.Quantity <= s.Product.ReorderPoint + 10);

            return await query
                .OrderBy(s => s.Product.Name)
                .ThenBy(s => s.Warehouse.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }
        public async Task<int> CountAsync(User user, string? search)
        {
            var query = _context.StockItems
                .Where(s => s.Product.OrganizationId == user.OrganizationId);

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(s =>
                    s.Product.Name.Contains(search) ||
                    s.Product.Sku.Contains(search));
            }

            query = query.Where(s =>
                s.Quantity <= s.Product.ReorderPoint + 10);

            return await query.CountAsync();
        }




    }
}
