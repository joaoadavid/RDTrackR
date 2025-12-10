using Microsoft.EntityFrameworkCore;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories.Suppliers;

namespace RDTrackR.Infrastructure.DataAccess.Repositories
{
    public class SupplierRepository : ISupplierReadOnlyRepository, ISupplierWriteOnlyRepository
    {
        private readonly RDTrackRDbContext _context;

        public SupplierRepository(RDTrackRDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Supplier supplier)
            => await _context.Suppliers.AddAsync(supplier);
        public async Task AddSupplierProduct(SupplierProduct supplier)
           => await _context.SupplierProducts.AddAsync(supplier);

        public async Task<List<Supplier>> GetAllAsync()
            => await _context.Suppliers.Include(s => s.CreatedBy).AsNoTracking().ToListAsync();

        public async Task<Supplier?> GetByIdAsync(long id, User user)
        {
            return await _context.Suppliers
                .Include(s => s.CreatedBy)
                .FirstOrDefaultAsync(s => s.Id == id && s.CreatedByUserId == user.Id);
        }

        public async Task<List<SupplierProduct>> GetSupplierProducts(long supplierId)
        {
            return await _context.SupplierProducts
                .AsNoTracking()
                .Include(sp => sp.Product)
                .Where(sp => sp.SupplierId == supplierId)
                .ToListAsync();
        }

        public async Task<List<Supplier>> GetPagedAsync(User user,int page, int pageSize, string? search)
        {
            var query = _context.Suppliers
                .Where(s=> s.OrganizationId == user.OrganizationId && s.Active == true)
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(s =>
                    s.Name.Contains(search) ||
                    s.Contact.Contains(search) ||
                    s.Email.Contains(search));
            }

            return await query
                .OrderBy(s => s.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(s => s.CreatedBy)
                .ToListAsync();
        }

        public async Task<int> CountAsync(string? search)
        {
            var query = _context.Suppliers.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(s =>
                    s.Name.Contains(search) ||
                    s.Contact.Contains(search) ||
                    s.Email.Contains(search));

            return await query.CountAsync();
        }



        public Task UpdateAsync(Supplier supplier)
        {
            _context.Suppliers.Update(supplier);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(Supplier supplier)
        {
            _context.Suppliers.Remove(supplier);
            return Task.CompletedTask;
        }

        public async Task<bool> ExistsWithEmail(string email) => await _context.Suppliers.AnyAsync(supplier => supplier.Email.Equals(email));

        public async Task<bool> ExistsSupplierWithEmail(string email, long id) =>
            await _context.Suppliers.AnyAsync(s => s.Email == email && s.Id != id);
       
    }

}
