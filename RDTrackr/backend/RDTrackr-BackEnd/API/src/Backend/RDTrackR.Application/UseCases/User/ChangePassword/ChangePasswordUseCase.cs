using MyRecipeBook.Application.UseCases.User.ChangePassword;
using MyRecipeBook.Domain.Repositories.User;
using RDTrackR.Communication.Requests.Password;
using RDTrackR.Domain.Extensions;
using RDTrackR.Domain.Repositories;
using RDTrackR.Domain.Repositories.Users;
using RDTrackR.Domain.Security.Cryptography;
using RDTrackR.Domain.Services.LoggedUser;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;

namespace RDTrackR.Application.UseCases.User.ChangePassword
{
    public class ChangePasswordUseCase : IChangePasswordUseCase
    {
        private readonly ILoggedUser _loggedUser;
        private readonly IUserReadOnlyRepository _readRepository;
        private readonly IUserUpdateOnlyRepository _repository;
        private readonly IPasswordEncripter _passwordEncripter;
        private readonly IUnitOfWork _unityOfWork;

        public ChangePasswordUseCase(ILoggedUser loggedUser,
            IUserReadOnlyRepository readRepository,
            IUserUpdateOnlyRepository repository,
            IPasswordEncripter passwordEncripter,
            IUnitOfWork unityOfWork
            )
        {
            _loggedUser = loggedUser;
            _repository = repository;
            _readRepository = readRepository;
            _passwordEncripter = passwordEncripter;
            _unityOfWork = unityOfWork;
        }

        public async Task Execute(RequestChangePasswordJson request)
        {
            var loggedUser = await _loggedUser.User();

            Validate(request, loggedUser);

            var user = await _readRepository.GetUserById(loggedUser.Id);

            user.Password = _passwordEncripter.Encrypt(request.NewPassword);

            await _repository.Update(user);

            await _unityOfWork.Commit();
        }

        private void Validate(RequestChangePasswordJson request, Domain.Entities.User loggedUser)
        {
            var result = new ChangePasswordValidator().Validate(request);

            if (_passwordEncripter.IsValid(request.Password, loggedUser.Password).IsFalse())
                result.Errors.Add(
                    new FluentValidation.Results.ValidationFailure(string.Empty, ResourceMessagesException.PASSWORD_DIFFERENT_CURRENT_PASSWORD));

            if (result.IsValid.IsFalse())
                throw new ErrorOnValidationException(result.Errors.Select(erro => erro.ErrorMessage).ToList());

        }

    }
}
