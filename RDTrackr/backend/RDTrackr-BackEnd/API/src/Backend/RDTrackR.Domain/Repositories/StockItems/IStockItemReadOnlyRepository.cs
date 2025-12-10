using RDTrackR.Domain.Entities;

namespace RDTrackR.Domain.Repositories.StockItems
{
    public interface IStockItemReadOnlyRepository
    {
        Task<List<StockItem>> GetAllAsync(User user);
        Task<List<StockItem>> GetPagedAsync(User user, int page, int pageSize, string? search);
        Task<int> CountAsync(User user, string? search);
        Task<StockItem?> GetByIdAsync(long id);
        Task<StockItem?> GetByProductAndWarehouseAsync(long productId, long warehouseId);
        Task<List<StockItem>> GetReplenishmentCandidatesAsync(User user);
        Task<List<StockItem>> GetByWarehouseAsync(long warehouseId, User user);
        Task<int> SumQuantityByWarehouseAsync(long warehouseId);
    }
}
