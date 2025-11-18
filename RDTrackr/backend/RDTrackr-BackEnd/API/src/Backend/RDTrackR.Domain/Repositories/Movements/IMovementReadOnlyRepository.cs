using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Enums;

namespace RDTrackR.Domain.Repositories.Movements
{
    public interface IMovementReadOnlyRepository
    {
        Task<List<Movement>> GetAllAsync(User user);
        Task<Movement?> GetByIdAsync(long id);
        Task<int> CountAsync(User user);
        Task<List<Movement>> GetByTypeAsync(string type);
        Task<List<Movement>> GetFilteredAsync(long? warehouseId, MovementType? type, DateTime? startDate, DateTime? endDate, User user);
    }
}
