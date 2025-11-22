using RDTrackR.Domain.Entities;

namespace RDTrackR.Domain.Repositories.SupplierProducts
{
    public interface ISupplierProductReadOnlyRepository
    {
        Task<SupplierProduct?> GetBySupplierAndProductAsync(long supplierId, long productId, User user);
        Task<List<SupplierProduct>> GetProductsBySupplierAsync(long supplierId, User user);
        Task<bool> ExistsAsync(long supplierId, long productId);
    }
}
