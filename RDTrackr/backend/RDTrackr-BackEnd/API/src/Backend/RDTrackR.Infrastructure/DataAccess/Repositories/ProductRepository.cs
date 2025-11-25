using Microsoft.EntityFrameworkCore;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories.Products;

namespace RDTrackR.Infrastructure.DataAccess.Repositories
{
    public class ProductRepository : IProductReadOnlyRepository, IProductWriteOnlyRepository
    {
        private readonly RDTrackRDbContext _context;

        public ProductRepository(RDTrackRDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Product product)
        {
            await _context.Products.AddAsync(product);
        }

        public async Task UpdateAsync(Product product)
        {
            _context.Products.Update(product);
            await Task.CompletedTask;
        }

        public async Task DeleteAsync(Product product)
        {
            _context.Products.Remove(product);
            await Task.CompletedTask;
        }

        public async Task<List<Product>> GetAllAsync(User user)
        {
            return await _context.Products
                .AsNoTracking()
                .Where(p => p.OrganizationId == user.OrganizationId && p.Active == true)
                .Include(p => p.CreatedBy)
                .Include(p => p.StockItems)
                .ToListAsync();
        }

        public async Task<List<Product>> GetPagedAsync(User user, int page, int pageSize, string? search)
        {
            var query = _context.Products
                .Where(p => p.OrganizationId == user.OrganizationId && p.Active == true)
                .Include(p => p.CreatedBy)
                .Include(p => p.StockItems)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(p => p.Name.Contains(search));

            return await query
                .OrderBy(p => p.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<int> CountAsync(User user, string? search = null)
        {
            var query = _context.Products
                .Where(p => p.OrganizationId == user.OrganizationId && p.Active == true);

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(p => p.Name.Contains(search));

            return await query.CountAsync();
        }


        //public async Task<int> CountAsync(User user)
        //{
        //    return await _context.Products.Where(p=>p.OrganizationId == user.OrganizationId).CountAsync();
        //}

        public async Task<Product?> GetByIdAsync(long id,User user)
        {
            return await _context.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id && p.OrganizationId == user.OrganizationId);
        }

        public async Task<bool> ExistsActiveProductWithSku(string sku)
        {
            return await _context.Products.AsNoTracking().AnyAsync(p => p.Sku == sku && p.Active);
        }

        public async Task<bool> Exists(long id)
        {
            return await _context.Products.AsNoTracking().AnyAsync(p => p.Id == id && p.Active);
        }
    }
}
