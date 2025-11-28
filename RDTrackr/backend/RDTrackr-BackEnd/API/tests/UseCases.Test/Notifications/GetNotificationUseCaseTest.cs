using CommonTestUtilities.Entities;
using CommonTestUtilities.LoggedUser;
using CommonTestUtilities.Repositories.Notifications;
using CommonTestUtilities.Mapper;
using RDTrackR.Application.UseCases.Notifications;
using RDTrackR.Communication.Responses.Notifications;
using RDTrackR.Domain.Entities;
using Shouldly;

namespace UseCases.Test.Notifications
{
    public class GetNotificationUseCaseTest
    {
        [Fact]
        public async Task Success_Returns_Unread_Notifications()
        {
            (var user, _) = UserBuilder.Build();
            var loggedUser = LoggedUserBuilder.Build(user);

            var notifications = new[]
            {
                new Notification
                {
                    Id = 1,
                    Message = "Pedido aprovado",
                    UserId = user.Id,
                    Read = false,
                    OrganizationId = user.OrganizationId,
                    CreatedOn = DateTime.UtcNow.AddMinutes(-1)
                },
                new Notification
                {
                    Id = 2,
                    Message = "Estoque baixo",
                    UserId = user.Id,
                    Read = false,
                    OrganizationId = user.OrganizationId,
                    CreatedOn = DateTime.UtcNow.AddMinutes(-2)
                }
            };

            var repo = new NotificationRepositoryBuilder()
                .WithUnread(notifications)
                .Build();

            var mapper = MapperBuilder.Build();

            var useCase = new GetNotificationUseCase(repo, loggedUser, mapper);

            var result = await useCase.Execute();

            result.ShouldNotBeNull();
            result.Count.ShouldBe(2);

            result[0].Id.ShouldBe(1);
            result[0].Message.ShouldBe("Pedido aprovado");
        }

        [Fact]
        public async Task Return_Empty_When_No_Unread()
        {
            (var user, _) = UserBuilder.Build();
            var loggedUser = LoggedUserBuilder.Build(user);

            var repo = new NotificationRepositoryBuilder()
                .WithUnread()
                .Build();

            var mapper = MapperBuilder.Build();

            var useCase = new GetNotificationUseCase(repo, loggedUser, mapper);

            var result = await useCase.Execute();

            result.ShouldBeEmpty();
        }

        [Fact]
        public async Task Should_Not_Return_Read_Notifications()
        {
            (var user, _) = UserBuilder.Build();
            var loggedUser = LoggedUserBuilder.Build(user);

            var notifications = new[]
            {
                new Notification
                {
                    Id = 1,
                    Message = "Mensagem 1",
                    UserId = user.Id,
                    Read = true,
                    OrganizationId = user.OrganizationId,
                    CreatedOn = DateTime.UtcNow
                }
            };

            var repo = new NotificationRepositoryBuilder()
                .WithUnread(notifications)
                .Build();

            var mapper = MapperBuilder.Build();

            var useCase = new GetNotificationUseCase(repo, loggedUser, mapper);

            var result = await useCase.Execute();

            result.ShouldBeEmpty();
        }

        [Fact]
        public async Task Should_Filter_By_Organization()
        {
            (var user, _) = UserBuilder.Build();
            var loggedUser = LoggedUserBuilder.Build(user);

            var notifications = new[]
            {
                new Notification
                {
                    Id = 1,
                    Message = "Mensagem válida",
                    UserId = user.Id,
                    OrganizationId = user.OrganizationId,
                    Read = false,
                    CreatedOn = DateTime.UtcNow
                },
                new Notification
                {
                    Id = 2,
                    Message = "Outra org",
                    UserId = user.Id,
                    OrganizationId = user.OrganizationId + 999,
                    Read = false,
                    CreatedOn = DateTime.UtcNow
                }
            };

            var repo = new NotificationRepositoryBuilder()
                .WithUnread(notifications)
                .Build();

            var mapper = MapperBuilder.Build();

            var useCase = new GetNotificationUseCase(repo, loggedUser, mapper);

            var result = await useCase.Execute();

            result.Count.ShouldBe(1);
            result[0].Id.ShouldBe(1);
        }
    }
}
