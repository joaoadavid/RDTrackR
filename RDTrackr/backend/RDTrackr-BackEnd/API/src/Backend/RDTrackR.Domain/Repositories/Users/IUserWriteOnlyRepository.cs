using RDTrackR.Domain.Entities;

namespace RDTrackR.Domain.Repositories.Users
{
    public interface IUserWriteOnlyRepository
    {
        public Task Add(User user);
        public Task Delete(long userId);
    }
}
