using CommonTestUtilities.Repositories;
using RDTrackR.Application.UseCases.Login.Logout;
using RDTrackR.Domain.Entities;
using RDTrackR.Exceptions.ExceptionBase.Token;
using Shouldly;

namespace UseCases.Test.Login.Logout
{
    public class LogoutUseCaseTest
    {
        [Fact]
        public async Task Success()
        {
            var token = new RefreshToken
            {
                TokenId = "abc",
                Value = "refresh-123",
                UserId = 1,
                IsRevoked = false
            };

            var repo = new TokenRepositoryBuilder()
                .WithToken(token)
                .Build();

            var uow = UnitOfWorkBuilder.Build();

            var useCase = new LogoutUseCase(repo, uow);

            await useCase.Execute("refresh-123");

            token.IsRevoked.ShouldBeTrue();
        }

        [Fact]
        public async Task Error_Token_Not_Found()
        {
            var repo = new TokenRepositoryBuilder().Build();
            var uow = UnitOfWorkBuilder.Build();

            var useCase = new LogoutUseCase(repo, uow);

            Func<Task> act = () => useCase.Execute("invalid");

            var ex = await act.ShouldThrowAsync<RefreshTokenNotFoundException>();
            ex.ShouldNotBeNull();
        }
    }
}
