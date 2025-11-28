using CommonTestUtilities.Repositories.Notifications;
using CommonTestUtilities.Repositories;
using RDTrackR.Application.UseCases.Notifications;
using Shouldly;

namespace UseCases.Test.Notifications
{
    public class MarkNotificationAsReadUseCaseTest
    {
        [Fact]
        public async Task Success_Marks_Notification_As_Read()
        {
            long receivedId = 0;

            var repo = new NotificationRepositoryBuilder()
                .WithMarkAsReadCallback(id => receivedId = id)
                .Build();

            var uow = UnitOfWorkBuilder.BuildWithCommitVerification();

            var useCase = new MarkNotificationAsReadUseCase(repo, uow.Instance);

            const long notificationId = 10;

            await useCase.Execute(notificationId);

            receivedId.ShouldBe(notificationId);
            uow.CommitCalled.ShouldBeTrue();
        }

        [Fact]
        public async Task Should_Call_Repository_And_Commit()
        {
            var repoBuilder = new NotificationRepositoryBuilder();
            var repo = repoBuilder.Build();

            var uow = UnitOfWorkBuilder.BuildWithCommitVerification();

            var useCase = new MarkNotificationAsReadUseCase(repo, uow.Instance);

            long id = 5;

            await useCase.Execute(id);

            repoBuilder.VerifyMarkAsRead(id);
            uow.CommitCalled.ShouldBeTrue();
        }
    }
}
