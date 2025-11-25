using RDTrackR.Domain.Entities;

namespace RDTrackR.Domain.Repositories.PurchaseOrders
{
    public interface IPurchaseOrderReadOnlyRepository
    {
        public Task<List<PurchaseOrder>> Get(User user);
        Task<PurchaseOrder?> GetByIdAsync(long id,User user);
        Task<List<PurchaseOrder>> GetRecentAsync(int days);
        Task<decimal> GetTotalPurchasedLast30Days();
        Task<List<PurchaseOrder>> GetPagedAsync(User user,int page,int pageSize,string? status,string? search);
        Task<int> CountAsync(User user,string? status,string? search);
        Task<int> GetPendingCount();
        Task<int> GetCancelCount();
        Task<List<SupplierPurchaseSummary>> GetTopSuppliers(int topN);
    }
}
