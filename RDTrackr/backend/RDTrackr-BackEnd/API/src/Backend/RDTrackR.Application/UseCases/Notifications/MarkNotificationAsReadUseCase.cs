using RDTrackR.Domain.Context;
using RDTrackR.Domain.Repositories.Notifications;

namespace RDTrackR.Application.UseCases.Notifications
{
    public class MarkNotificationAsReadUseCase : IMarkNotificationAsReadUseCase
    {
        private readonly INotificationRepository _repo;
        private readonly IUserContext _user;

        public MarkNotificationAsReadUseCase(INotificationRepository repo, IUserContext user)
        {
            _repo = repo;
            _user = user;
        }

        public async Task Execute(long id)
        {
            await _repo.MarkAsReadAsync(id);
        }
    }

}
