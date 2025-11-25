using RDTrackR.Domain.Entities;

namespace RDTrackR.Domain.Repositories.Warehouses
{
    public interface IWarehouseReadOnlyRepository
    {
        Task<List<Warehouse>> GetAllAsync(User user);
        Task<List<Warehouse>> GetPagedAsync(User user,int page,int pageSize,string? search);
        Task<int> CountAsync(User user, string? search = null);
        Task<Warehouse?> GetByIdAsync(long id, User user);
        
    }
}
