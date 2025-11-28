using RDTrackR.Domain.Entities;

namespace RDTrackR.Domain.Repositories.Orders
{
    public interface IOrderReadOnlyRepository
    {
        Task<Order?> GetById(long id);
        Task<List<Order>> GetAll(long organizationId);

        Task<List<Order>> GetPagedAsync(long organizationId, int page, int pageSize, string? status, string? search);
        Task<int> CountAsync(long organizationId, string? status, string? search);

    }

}
