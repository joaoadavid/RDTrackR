using Microsoft.AspNetCore.SignalR;
using Moq;
using RDTrackR.Domain.Context;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories.Notifications;
using RDTrackR.Domain.Services.LoggedUser;
using RDTrackR.Infrastructure.Hubs;

public class NotificationServiceBuilder
{
    private readonly Mock<INotificationRepository> _repo = new();
    private readonly Mock<ILoggedUser> _loggedUser = new();
    private readonly Mock<IUserContext> _userContext = new();
    private readonly Mock<IHubContext<NotificationHub>> _hub = new();
    private readonly Mock<IHubClients> _hubClients = new();
    private readonly Mock<IClientProxy> _clientProxy = new();

    private readonly List<Notification> _store = new();
    private long _userId = 1;

    public NotificationServiceBuilder WithUserId(long userId)
    {
        _userId = userId;
        return this;
    }

    public NotificationService Build()
    {
        _loggedUser
            .Setup(x => x.User())
            .ReturnsAsync(new User
            {
                Id = _userId,
                Name = "Test User",
                Email = "test@test.com",
                OrganizationId = 1
            });

        _userContext
            .Setup(x => x.UserId)
            .Returns(_userId);

        _repo
            .Setup(r => r.AddAsync(It.IsAny<Notification>()))
            .Callback((Notification n) =>
            {
                n.Id = _store.Count + 1;
                _store.Add(n);
            })
            .Returns(Task.CompletedTask);

        // ACEITA QUALQUER GUID/STRING
        _hubClients
            .Setup(x => x.User(It.IsAny<string>()))
            .Returns(_clientProxy.Object);

        // MOCKA O Clients corretamente
        _hub
            .Setup(x => x.Clients)
            .Returns(_hubClients.Object);

        // MOCKA O MÉTODO QUE O SIGNALR USA INTERNAMENTE
        _clientProxy
            .Setup(x => x.SendCoreAsync(
                It.IsAny<string>(),
                It.IsAny<object[]>(),
                default
            ))
            .Returns(Task.CompletedTask);

        return new NotificationService(
            _repo.Object,
            _loggedUser.Object,
            _userContext.Object,
            _hub.Object
        );
    }

    public List<Notification> Store => _store;
    public Mock<IClientProxy> ClientProxyMock => _clientProxy;
    public Mock<INotificationRepository> RepoMock => _repo;
}
