using RDTrackR.Domain.Entities;

namespace RDTrackR.Domain.Repositories.Notifications
{
    public interface INotificationRepository
    {
        Task AddAsync(Notification notification);
        Task<List<Notification>> GetAllUnreadAsync(User user);
        Task MarkAsReadAsync(long notificationId);
    }
}
