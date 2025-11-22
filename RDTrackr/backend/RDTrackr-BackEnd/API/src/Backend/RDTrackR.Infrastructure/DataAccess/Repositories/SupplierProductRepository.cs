using Microsoft.EntityFrameworkCore;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories.SupplierProducts;

namespace RDTrackR.Infrastructure.DataAccess.Repositories
{
    public class SupplierProductRepository :
        ISupplierProductReadOnlyRepository,
        ISupplierProductWriteOnlyRepository
    {
        private readonly RDTrackRDbContext _db;

        public SupplierProductRepository(RDTrackRDbContext db)
        {
            _db = db;
        }

        public async Task<SupplierProduct> AddAsync(SupplierProduct supplierProduct)
        {
            await _db.SupplierProducts.AddAsync(supplierProduct);
            return supplierProduct;
        }

        public async Task UpdateAsync(SupplierProduct supplierProduct)
        {
            _db.SupplierProducts.Update(supplierProduct);
        }

        public async Task DeleteAsync(long supplierId, long productId, User user)
        {
            var entity = await _db.SupplierProducts
                .Where(s => s.OrganizationId == user.OrganizationId)
                .FirstOrDefaultAsync(s =>
                    s.SupplierId == supplierId &&
                    s.ProductId == productId);

            if (entity != null)
            {
                _db.SupplierProducts.Remove(entity);
            }
        }

        public async Task<bool> ExistsAsync(long supplierId, long productId)
        {
            return await _db.SupplierProducts.AnyAsync(s =>
                s.SupplierId == supplierId &&
                s.ProductId == productId);
        }

        public async Task<SupplierProduct?> GetBySupplierAndProductAsync(long supplierId, long productId, User user)
        {
            return await _db.SupplierProducts
                .Where(s =>s.OrganizationId == user.OrganizationId)
                .Include(sp => sp.Product)
                .FirstOrDefaultAsync(s =>
                    s.SupplierId == supplierId &&
                    s.ProductId == productId);
        }

        public async Task<List<SupplierProduct>> GetProductsBySupplierAsync(long supplierId,User user)
        {
            return await _db.SupplierProducts
                .Where(s => s.OrganizationId == user.OrganizationId)
                .Include(sp => sp.Product)
                .Where(sp => sp.SupplierId == supplierId)
                .ToListAsync();
        }
    }
}
