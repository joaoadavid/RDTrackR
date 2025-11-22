using CommonTestUtilities.ChangePassword;
using CommonTestUtilities.Cryptography;
using CommonTestUtilities.Entities;
using CommonTestUtilities.LoggedUser;
using CommonTestUtilities.Repositories;
using RDTrackR.Application.UseCases.User.ChangePassword;
using RDTrackR.Communication.Requests.Password;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;
using Shouldly;

namespace UseCases.Test.User.ChangePassword
{
    public class ChangePasswordUseCaseTest
    {
        [Fact]
        public async void Success()
        {
            (var user, var password) = UserBuilder.Build();

            var request = RequestChangePasswordJsonBuilder.Build();
            request.Password = password;

            var useCase = CreateUseCase(user);

            Func<Task> act = async () => await useCase.Execute(request);

            await act.ShouldNotThrowAsync();
        }

        [Fact]
        public async Task Error_NewPassword_Empty()
        {
            (var user, var password) = UserBuilder.Build();

            var request = new RequestChangePasswordJson
            {
                Password = password,
                NewPassword = string.Empty
            };

            var useCase = CreateUseCase(user);

            Func<Task> act = async () => { await useCase.Execute(request); };

            var exception = await act.ShouldThrowAsync<ErrorOnValidationException>();
            exception.GetErrorMessages().Count().ShouldBe(1);
            exception.GetErrorMessages().ShouldContain(ResourceMessagesException.PASSWORD_EMPTY);
        }

        [Fact]
        public async Task Error_CurrentPassword_Different()
        {
            (var user, var password) = UserBuilder.Build();

            var request = RequestChangePasswordJsonBuilder.Build();

            var useCase = CreateUseCase(user);

            Func<Task> act = async () => await useCase.Execute(request);

            var exception = await act.ShouldThrowAsync<ErrorOnValidationException>();
            exception.GetErrorMessages().Count().ShouldBe(1);
            exception.GetErrorMessages().ShouldContain(ResourceMessagesException.PASSWORD_DIFFERENT_CURRENT_PASSWORD);
        }

        private ChangePasswordUseCase CreateUseCase(RDTrackR.Domain.Entities.User user)
        {
            var unitOfWork = UnitOfWorkBuilder.Build();

            var userReadOnlyRepository = new UserReadOnlyRepositoryBuilder()
                .GetById(user)
                .Build();

            var userUpdateOnlyRepository = new UserUpdateOnlyRepositoryBuilder()
                .Build();

            var loggedUser = LoggedUserBuilder.Build(user);

            var passwordEncripter = PasswordEncripterBuilder.Build();

            return new ChangePasswordUseCase(
                loggedUser,
                userReadOnlyRepository,
                userUpdateOnlyRepository,
                passwordEncripter,
                unitOfWork
            );
        }

    }
}
