using CommonTestUtilities.Entities;
using CommonTestUtilities.LoggedUser;
using CommonTestUtilities.Repositories;
using CommonTestUtilities.Requests;
using RDTrackR.Application.UseCases.User.Update;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;
using Shouldly;

namespace UseCases.Test.User.Update
{
    public class UpdateUserUseCaseTest
    {
        [Fact]
        public async void Success()
        {
            (var user, _) = UserBuilder.Build();

            var request = RequestUpdateUserJsonBuilder.Build();

            var useCase = CreateUseCase(user);

            Func<Task> act = async () => await useCase.Execute(request);

            await act.ShouldNotThrowAsync();
            user.Name.ShouldBe(request.Name);
            user.Email.ShouldBe(request.Email);
        }

        [Fact]
        public async Task Error_Name_Empty()
        {
            (var user, _) = UserBuilder.Build();

            var request = RequestUpdateUserJsonBuilder.Build();
            request.Name = string.Empty;

            var useCase = CreateUseCase(user);

            Func<Task> act = async () => await useCase.Execute(request);

            var exception = await act.ShouldThrowAsync<ErrorOnValidationException>();
            exception.GetErrorMessages().Count().ShouldBe(1);
            exception.GetErrorMessages().ShouldContain(ResourceMessagesException.NAME_EMPTY);

            user.Name.ShouldNotBe(request.Name);
            user.Email.ShouldNotBe(request.Email);
        }

        [Fact]
        public async Task Error_Email_Already_Registered()
        {
            (var user, _) = UserBuilder.Build();

            var request = RequestUpdateUserJsonBuilder.Build();

            var useCase = CreateUseCase(user, request.Email);

            Func<Task> act = async () => await useCase.Execute(request);

            var exception = await act.ShouldThrowAsync<ErrorOnValidationException>();
            exception.GetErrorMessages().Count().ShouldBe(1);
            exception.GetErrorMessages().ShouldContain(ResourceMessagesException.EMAIL_ALREADY_REGISTERED);

            user.Name.ShouldNotBe(request.Name);
            user.Email.ShouldNotBe(request.Email);
        }

        private UpdateUserUseCase CreateUseCase(RDTrackR.Domain.Entities.User user, string? email = null)
        {
            var unitOfWork = UnitOfWorkBuilder.Build();
            var writeOnlyRepo = UserWriteOnlyRepositoryBuilder.Build();
            var updateRepo = new UserUpdateOnlyRepositoryBuilder().Build();
            var loggedUser = LoggedUserBuilder.Build(user);

            // UM ÚNICO repositório ReadOnly para este UseCase
            var readOnlyRepoBuilder = new UserReadOnlyRepositoryBuilder()
                .GetById(user); // SEMPRE necessário

            if (!string.IsNullOrEmpty(email))
                readOnlyRepoBuilder.ExistActiveUserWithEmail(email);
            else
                readOnlyRepoBuilder.ExistActiveUserWithEmail(user.Email);

            var readOnlyRepo = readOnlyRepoBuilder.Build();

            return new UpdateUserUseCase(
                loggedUser,
                writeOnlyRepo,
                updateRepo,
                readOnlyRepo,
                unitOfWork
            );
        }

    }
}
