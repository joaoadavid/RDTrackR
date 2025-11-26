using CommonTestUtilities.Cryptography;
using CommonTestUtilities.Entities;
using CommonTestUtilities.Organizations;
using CommonTestUtilities.Repositories;
using CommonTestUtilities.Repositories.Organizations;
using CommonTestUtilities.Requests;
using CommonTestUtilities.Tokens;
using RDTrackR.Application.UseCases.Login.DoLogin;
using RDTrackR.Communication.Requests.Login;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase.Login;
using Shouldly;

namespace UseCases.Test.Login.DoLogin
{
    public class DoLoginUseCaseTest
    {
        [Fact]
        public async Task Success()
        {
            (var user,var password) = UserBuilder.Build();
            
            var useCase = CreateUseCase(user);

            var result = await useCase.Execute(new RequestLoginJson
            {
                Email=user.Email,
                Password = password
            });

            result.ShouldNotBeNull();
            result.Tokens.ShouldNotBeNull();
            result.Name.ShouldNotBeNullOrWhiteSpace();
            result.Name.ShouldBe(user.Name);
            result.Tokens.AccessToken.ShouldNotBeNullOrWhiteSpace();
        }

        [Fact]
        public async Task Error_Invalid_User()
        {
            var request = RequestLoginJsonBuilder.Build();
            var useCase = CreateUseCase();

            Func<Task> act = async () => await useCase.Execute(request);

            var exception = await act.ShouldThrowAsync<InvalidLoginException>();
            exception.Message.ShouldBe(ResourceMessagesException.EMAIL_OR_PASSWORD_INVALID);
        }

        private static DoLoginUseCase CreateUseCase(RDTrackR.Domain.Entities.User? user = null)
        {
            var passwordEncripter = PasswordEncripterBuilder.Build();
            var userReadOnlyRepositoryBuilder = new UserReadOnlyRepositoryBuilder();
            var accessTokenGenerator = JwtTokenGeneratorBuilder.Build();
            var refreshTokenGenerator = RefreshTokenGeneratorBuilder.Build();
            var unitOfWork = UnitOfWorkBuilder.Build();
            var tokenRepository = new TokenRepositoryBuilder().Build();

            var org = OrganizationBuilder.Build(user?.OrganizationId);

            var orgRepo = new OrganizationRepositoryBuilder()
                .WithOrganization(org)
                .BuildRead();

            if (user is not null)
                userReadOnlyRepositoryBuilder.GetByEmail(user);

            return new DoLoginUseCase(
                userReadOnlyRepositoryBuilder.Build(),
                accessTokenGenerator,
                passwordEncripter,
                orgRepo,
                refreshTokenGenerator,
                tokenRepository,
                unitOfWork
            );
        }

    }
}
