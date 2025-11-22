using RDTrackR.Domain.Entities;

namespace RDTrackR.Domain.Repositories.Orders
{
    public interface IOrderReadOnlyRepository
    {
        Task<Order?> GetById(long id);
        Task<List<Order>> GetAll(long organizationId);
    }

}
