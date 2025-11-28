using Microsoft.EntityFrameworkCore;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Enums;
using RDTrackR.Domain.Repositories.PurchaseOrders;

namespace RDTrackR.Infrastructure.DataAccess.Repositories
{
    public class PurchaseOrderRepository :
        IPurchaseOrderWriteOnlyRepository, IPurchaseOrderReadOnlyRepository
    {
        private readonly RDTrackRDbContext _context;

        public PurchaseOrderRepository(RDTrackRDbContext context) => _context = context;

        public async Task AddAsync(PurchaseOrder order) =>
            await _context.PurchaseOrders.AddAsync(order);

        public async Task<List<PurchaseOrder>> Get(User user) =>
            await _context.PurchaseOrders
                .Include(p => p.Supplier)
                .Include(p => p.CreatedBy)
                .Include(p => p.Items).ThenInclude(i => i.Product)
                .Where(p => p.CreatedByUserId == user.Id)
                .AsNoTracking()
                .ToListAsync();


        public Task UpdateAsync(PurchaseOrder order)
        {
            _context.PurchaseOrders.Update(order);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(PurchaseOrder order)
        {
            _context.PurchaseOrders.Remove(order);
            return Task.CompletedTask;
        }

        public async Task<PurchaseOrder?> GetByIdAsync(long id, User user)
        {
            return await _context.PurchaseOrders
                .Include(p => p.Supplier)
                .Include(p => p.Items).ThenInclude(i => i.Product)
                .Include(p => p.CreatedBy)
                .Where(p=>p.CreatedByUserId == user.Id)
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<List<PurchaseOrder>> GetRecentAsync(int days)
        {
            var since = DateTime.UtcNow.AddDays(-days);

            return await _context.PurchaseOrders
                .Include(p => p.Supplier)
                .Include(p => p.Items)
                .Where(p => p.CreatedOn >= since)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<List<PurchaseOrder>> GetPagedAsync(
        User user,
        int page,
        int pageSize,
        string? status,
        string? search)
        {
            var query = _context.PurchaseOrders
                .Include(p => p.Supplier)
                .Include(p => p.Warehouse)
                .Include(p => p.CreatedBy)
                .Include(p => p.Items).ThenInclude(i => i.Product)
                .Where(p => p.CreatedByUserId == user.Id)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status) && status != "all")
                query = query.Where(p => p.Status.ToString() == status);

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(p =>
                    p.Number.Contains(search) ||
                    p.Supplier.Name.Contains(search)
                );
            }

            return await query
                .OrderByDescending(p => p.CreatedOn)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<int> CountAsync(
        User user,
        string? status,
        string? search)
        {
            var query = _context.PurchaseOrders
                .Where(p => p.CreatedByUserId == user.Id);

            if (!string.IsNullOrWhiteSpace(status) && status != "all")
                query = query.Where(p => p.Status.ToString() == status);

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(p =>
                    p.Number.Contains(search) ||
                    p.Supplier.Name.Contains(search)
                );

            return await query.CountAsync();
        }



        public async Task<decimal> GetTotalPurchasedLast30Days()
        {
            var since = DateTime.UtcNow.AddDays(-30);

            return await _context.PurchaseOrderItems
                .Where(i => i.PurchaseOrder.CreatedOn >= since)
                .SumAsync(i => i.Quantity * i.UnitPrice);
        }

        public async Task<int> GetPendingCount()
        {
            return await _context.PurchaseOrders
                .Where(p => p.Status == PurchaseOrderStatus.DRAFT)
                .CountAsync();
        }

        public async Task<int> GetCancelCount()
        {
            return await _context.PurchaseOrders
                .Where(p => p.Status == PurchaseOrderStatus.CANCELLED)
                .CountAsync();
        }

        public async Task<List<SupplierPurchaseSummary>> GetTopSuppliers(int topN)
        {
            return await _context.PurchaseOrderItems
                .GroupBy(i => new { i.PurchaseOrder.SupplierId, i.PurchaseOrder.Supplier.Name })
                .Select(g => new SupplierPurchaseSummary
                {
                    SupplierName = g.Key.Name,
                    TotalPurchased = g.Sum(i => i.Quantity * i.UnitPrice)
                })
                .OrderByDescending(x => x.TotalPurchased)
                .Take(topN)
                .ToListAsync();
        }

    }
}
