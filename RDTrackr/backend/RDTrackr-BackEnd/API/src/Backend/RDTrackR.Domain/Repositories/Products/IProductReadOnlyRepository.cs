using RDTrackR.Domain.Entities;

namespace RDTrackR.Domain.Repositories.Products
{
    public interface IProductReadOnlyRepository
    {
        Task<List<Product>> GetAllAsync(User user);
        Task<Product?> GetByIdAsync(long id,User user);
        Task<int> CountAsync(User user);
        Task<bool> ExistsActiveProductWithSku(string sku);
        Task<bool> Exists(long id);
    }
}
