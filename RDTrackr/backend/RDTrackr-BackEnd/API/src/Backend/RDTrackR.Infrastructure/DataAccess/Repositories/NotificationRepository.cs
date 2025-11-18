namespace RDTrackR.Infrastructure.DataAccess.Repositories
{
    using global::RDTrackR.Domain.Entities;
    using global::RDTrackR.Domain.Repositories.Notifications;
    using Microsoft.EntityFrameworkCore;

    namespace RDTrackR.Infrastructure.DataAccess.Repositories
    {
        public class NotificationRepository : INotificationRepository
        {
            private readonly RDTrackRDbContext _context;

            public NotificationRepository(RDTrackRDbContext context)
            {
                _context = context;
            }

            public async Task AddAsync(Notification notification)
            {
                await _context.Notifications.AddAsync(notification);
            }

            public async Task<List<Notification>> GetAllUnreadAsync(User user)
            {
                return await _context.Notifications
                    .Where(n => n.UserId == user.Id && !n.Read && n.OrganizationId == user.OrganizationId)
                    .AsNoTracking()
                    .OrderByDescending(n => n.CreatedAt)
                    .ToListAsync();
            }


            public async Task MarkAsReadAsync(long notificationId)
            {
                var notification = await _context.Notifications.FindAsync(notificationId);
                if (notification is not null)
                {
                    notification.Read = true;
                }
            }
        }
    }

}
