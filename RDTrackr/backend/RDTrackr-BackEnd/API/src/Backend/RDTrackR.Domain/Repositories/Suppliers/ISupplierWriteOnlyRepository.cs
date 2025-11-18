using RDTrackR.Domain.Entities;

namespace RDTrackR.Domain.Repositories.Suppliers
{
    public interface ISupplierWriteOnlyRepository
    {
        Task AddAsync(Supplier supplier);
        Task UpdateAsync(Supplier supplier);
        Task DeleteAsync(Supplier supplier);
        Task AddSupplierProduct(SupplierProduct supplier);



    }
}
