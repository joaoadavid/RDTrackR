using RDTrackR.Domain.Entities;

namespace RDTrackR.Domain.Repositories.PurchaseOrders
{
    public interface IPurchaseOrderWriteOnlyRepository
    {
        Task AddAsync(PurchaseOrder order);
        Task UpdateAsync(PurchaseOrder order);
        Task DeleteAsync(PurchaseOrder order);
    }
}
