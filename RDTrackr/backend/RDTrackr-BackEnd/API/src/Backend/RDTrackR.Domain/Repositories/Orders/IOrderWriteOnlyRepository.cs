using RDTrackR.Domain.Entities;

namespace RDTrackR.Domain.Repositories.Orders
{
    public interface IOrderWriteOnlyRepository
    {
        Task Add(Order order);
        Task Update(Order order);
    }

}
