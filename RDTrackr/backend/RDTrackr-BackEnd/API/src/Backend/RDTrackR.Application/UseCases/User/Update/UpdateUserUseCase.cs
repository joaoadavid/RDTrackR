using MyRecipeBook.Application.UseCases.User.Update;
using MyRecipeBook.Domain.Repositories.User;
using RDTrackR.Application.UseCases.User.Validators;
using RDTrackR.Communication.Requests.User;
using RDTrackR.Domain.Extensions;
using RDTrackR.Domain.Repositories;
using RDTrackR.Domain.Repositories.Users;
using RDTrackR.Domain.Services.LoggedUser;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;

namespace RDTrackR.Application.UseCases.User.Update
{
    public class UpdateUserUseCase : IUpdateUserUseCase
    {
        private readonly ILoggedUser _loggedUser;
        private readonly IUserWriteOnlyRepository _repository;
        private readonly IUserUpdateOnlyRepository _userUpdateOnlyRepository;
        private readonly IUserReadOnlyRepository _userReadOnlyRepository;
        private readonly IUnitOfWork _unityOfWork;

        public UpdateUserUseCase(ILoggedUser loggedUser,
            IUserWriteOnlyRepository repository,
            IUserUpdateOnlyRepository userUpdateOnlyRepository,
            IUserReadOnlyRepository userReadOnlyRepository,
            IUnitOfWork unityOfWork
            )
        {
            _loggedUser = loggedUser;
            _userUpdateOnlyRepository = userUpdateOnlyRepository;
            _userReadOnlyRepository = userReadOnlyRepository;
            _unityOfWork = unityOfWork;
        }

        public async Task Execute(RequestUpdateUserJson request)
        {
            var loggedUser = await _loggedUser.User();

            await Validate(request, loggedUser.Email);

            var user = await _userReadOnlyRepository.GetUserById(loggedUser.Id);

            user.Name = request.Name;
            user.Email = request.Email;
            user.Role = request.Role;
            user.Active = request.IsActive;

            await _userUpdateOnlyRepository.Update(user);

            await _unityOfWork.Commit();
        }

        private async Task Validate(RequestUpdateUserJson request, string currentEmail)
        {
            var validator = new UpdateUserValidator();

            var result = await validator.ValidateAsync(request);

            if (currentEmail.Equals(request.Email).IsFalse())
            {
                var userExist = await _userReadOnlyRepository.ExistsActiveUserWithEmail(request.Email);
                if (userExist)
                {
                    result.Errors.Add(
                        new FluentValidation.Results.ValidationFailure("email", ResourceMessagesException.EMAIL_ALREADY_REGISTERED));
                }
            }

            if (result.IsValid.IsFalse())
            {
                var errorMessages = result.Errors.Select(e => e.ErrorMessage).ToList();
                throw new ErrorOnValidationException(errorMessages);
            }
        }
    }
}
