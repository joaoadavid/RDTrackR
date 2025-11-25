using Microsoft.AspNetCore.SignalR;
using RDTrackR.Domain.Context;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories.Notifications;
using RDTrackR.Domain.Services.LoggedUser;
using RDTrackR.Domain.Services.Notification;
using RDTrackR.Infrastructure.Hubs;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _repo;
    private readonly ILoggedUser _loggedUser;
    private readonly IUserContext _user;
    private readonly IHubContext<NotificationHub> _hub;

    public NotificationService(
        INotificationRepository repo,
        ILoggedUser loggedUser,
        IUserContext user,
        IHubContext<NotificationHub> hub)
    {
        _repo = repo;
        _loggedUser = loggedUser;
        _user = user;
        _hub = hub;
    }

    public async Task Notify(string message, long? targetUserId = null)
    {
        var loggedUser = await _loggedUser.User();
        var userId = targetUserId ?? _user.UserId;

        if (userId <= 0)
            throw new InvalidOperationException("UserId inválido para envio de notificação.");

        var notification = new Notification
        {
            UserId = userId,
            Message = message,
            Read = false,
            OrganizationId = loggedUser.OrganizationId,
            CreatedOn = DateTime.UtcNow
        };

        await _repo.AddAsync(notification);
       
        await _hub.Clients.User(userId.ToString())
            .SendAsync("ReceiveNotification", new
            {
                id = notification.Id,
                message = notification.Message,
                createdAt = notification.CreatedOn,
                read = notification.Read
            });
    }
}
