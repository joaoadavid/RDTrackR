using RDTrackR.Domain.Entities;

namespace RDTrackR.Domain.Repositories.Products
{
    public interface IProductReadOnlyRepository
    {
        Task<List<Product>> GetAllAsync(User user);
        Task<List<Product>> GetPagedAsync(User user, int page, int pageSize, string? search);
        Task<Product?> GetByIdAsync(long id,User user);
        //Task<int> CountAsync(User user);
        Task<int> CountAsync(User user, string? search = null);
        Task<bool> ExistsActiveProductWithSku(string sku);
        Task<bool> Exists(long id);
    }
}
