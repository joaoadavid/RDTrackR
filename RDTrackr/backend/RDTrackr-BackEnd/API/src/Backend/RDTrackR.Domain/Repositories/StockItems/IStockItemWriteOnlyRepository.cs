using RDTrackR.Domain.Entities;

namespace RDTrackR.Domain.Repositories.StockItems
{
    public interface IStockItemWriteOnlyRepository
    {
        Task AddAsync(StockItem stockItem);
        Task UpdateAsync(StockItem stockItem);
        Task DeleteAsync(StockItem item);
    }
}
