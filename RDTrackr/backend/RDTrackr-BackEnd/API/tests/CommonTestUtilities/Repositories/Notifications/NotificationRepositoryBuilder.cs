using Moq;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories.Notifications;

namespace CommonTestUtilities.Repositories.Notifications
{
    public class NotificationRepositoryBuilder
    {
        private readonly Mock<INotificationRepository> _mock = new();
        private readonly List<Notification> _store = new();

        public NotificationRepositoryBuilder WithUnread(params Notification[] notifications)
        {
            _store.Clear();
            _store.AddRange(notifications);
            return this;
        }

        public INotificationRepository Build()
        {
            _mock.Setup(r => r.GetAllUnreadAsync(It.IsAny<User>()))
                .ReturnsAsync((User user) =>
                {
                    return _store
                        .Where(n => n.UserId == user.Id &&
                                    !n.Read &&
                                    n.OrganizationId == user.OrganizationId)
                        .OrderByDescending(n => n.CreatedOn)
                        .ToList();
                });

            return _mock.Object;
        }

        public NotificationRepositoryBuilder WithMarkAsReadCallback(Action<long> callback)
        {
            _mock.Setup(r => r.MarkAsReadAsync(It.IsAny<long>()))
                 .Callback(callback)
                 .Returns(Task.CompletedTask);

            return this;
        }

        public NotificationRepositoryBuilder VerifyMarkAsRead(long id)
        {
            _mock.Verify(r => r.MarkAsReadAsync(id), Times.Once);
            return this;
        }

    }
}
