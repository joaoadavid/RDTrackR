using RDTrackR.Domain.Entities;

namespace RDTrackR.Domain.Repositories.Users
{
    public interface IUserReadOnlyRepository
    {
        public Task<bool> ExistsActiveUserWithEmail(string email);
        public Task<bool> ExistActiveUserWithIdenfier(Guid userIdentifier);
        Task<User> GetByEmail(string email);
        Task<User?> GetUserById(long id);
        Task<List<User>> GetAllAsync(User user);
        Task<bool> ExistsAnotherUserWithEmail(long id, string email);
        Task<User?> GetByIdentifier(Guid identifier);
    }
}
