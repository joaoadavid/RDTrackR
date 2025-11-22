using RDTrackR.Domain.Entities;

namespace RDTrackR.Domain.Repositories.SupplierProducts
{
    public interface ISupplierProductWriteOnlyRepository
    {
        Task<SupplierProduct> AddAsync(SupplierProduct supplierProduct);
        Task UpdateAsync(SupplierProduct supplierProduct);
        Task DeleteAsync(long supplierId, long productId, User user);
    }
}
