using RDTrackR.Domain.Entities;

namespace RDTrackR.Domain.Repositories.Orders
{
    public interface IOrderDeleteOnlyRepository
    {
        Task Delete(Order order);
    }
}
