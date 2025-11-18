using RDTrackR.Domain.Entities;

namespace RDTrackR.Domain.Repositories.StockItems
{
    public interface IStockItemReadOnlyRepository
    {
        Task<List<StockItem>> GetAllAsync(User user);
        Task<StockItem?> GetByIdAsync(long id);
        Task<StockItem?> GetByProductAndWarehouseAsync(long productId, long warehouseId);
        Task<List<StockItem>> GetReplenishmentCandidatesAsync(User user);
    }
}
