using RDTrackR.Domain.Entities;

namespace RDTrackR.Domain.Repositories.Warehouses
{
    public interface IWarehouseReadOnlyRepository
    {
        Task<List<Warehouse>> GetAllAsync(User user);

        Task<int> CountAsync(User user);
        Task<Warehouse?> GetByIdAsync(long id, User user);
        
    }
}
