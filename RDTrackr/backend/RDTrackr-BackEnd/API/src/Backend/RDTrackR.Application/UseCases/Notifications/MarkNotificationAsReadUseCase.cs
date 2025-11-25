using RDTrackR.Domain.Context;
using RDTrackR.Domain.Repositories;
using RDTrackR.Domain.Repositories.Notifications;

namespace RDTrackR.Application.UseCases.Notifications
{
    public class MarkNotificationAsReadUseCase : IMarkNotificationAsReadUseCase
    {
        private readonly INotificationRepository _repo;
        private readonly IUnitOfWork _unitOfWork;

        public MarkNotificationAsReadUseCase(INotificationRepository repo, IUnitOfWork unitOfWork)
        {
            _repo = repo;
            _unitOfWork = unitOfWork;
        }

        public async Task Execute(long id)
        {
            await _repo.MarkAsReadAsync(id);
            await _unitOfWork.Commit();
        }
    }

}
