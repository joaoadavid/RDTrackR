using RDTrackR.Domain.Entities;

namespace RDTrackR.Domain.Repositories.Users
{
    public interface IUserUpdateOnlyRepository
    {
        Task Update(User user);
    }
}
