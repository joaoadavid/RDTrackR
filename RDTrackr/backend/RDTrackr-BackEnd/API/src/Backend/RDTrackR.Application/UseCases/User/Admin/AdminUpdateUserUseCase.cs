using FluentValidation;
using RDTrackR.Application.UseCases.Users.Validators;
using RDTrackR.Communication.Requests.User;
using RDTrackR.Domain.Repositories;
using RDTrackR.Domain.Repositories.Users;
using RDTrackR.Domain.Security.Cryptography;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;

namespace RDTrackR.Application.UseCases.User.Admin
{
    public class AdminUpdateUserUseCase : IAdminUpdateUserUseCase
    {
        private readonly IUserReadOnlyRepository _readRepository;
        private readonly IUserUpdateOnlyRepository _updateRepository;
        private readonly IPasswordEncripter _passwordEncripter;
        private readonly IUnitOfWork _unitOfWork;

        public AdminUpdateUserUseCase(
            IUserReadOnlyRepository readRepository,
            IUserUpdateOnlyRepository updateRepository,
            IPasswordEncripter passwordEncripter,
            IUnitOfWork unitOfWork)
        {
            _readRepository = readRepository;
            _updateRepository = updateRepository;
            _passwordEncripter = passwordEncripter;
            _unitOfWork = unitOfWork;
        }

        public async Task Execute(long id, RequestAdminUpdateUserJson request)
        {
            await Validate(id, request);

            var user = await _readRepository.GetUserById(id)
                ?? throw new NotFoundException(ResourceMessagesException.USER_NOT_FOUND);

            user.Name = request.Name;
            user.Email = request.Email;
            user.Active = request.Active;
            user.Role = request.Role;

            if (!string.IsNullOrWhiteSpace(request.NewPassword))
            {
                user.Password = _passwordEncripter.Encrypt(request.NewPassword);
            }

            await _updateRepository.Update(user);
            await _unitOfWork.Commit();
        }

        private async Task Validate(long id, RequestAdminUpdateUserJson request)
        {
            var validator = new AdminUpdateUserValidator();
            var result = await validator.ValidateAsync(request);

            var emailExists = await _readRepository.ExistsAnotherUserWithEmail(id, request.Email);
            if (emailExists)
            {
                result.Errors.Add(new FluentValidation.Results.ValidationFailure(
                    nameof(request.Email),
                    ResourceMessagesException.EMAIL_ALREADY_REGISTERED));
            }

            if (!string.IsNullOrWhiteSpace(request.NewPassword))
            {
                if (request.NewPassword.Length < 6)
                    result.Errors.Add(new FluentValidation.Results.ValidationFailure(
                        nameof(request.NewPassword),
                        ResourceMessagesException.PASSWORD_REQUIRED));
            }

            if (!result.IsValid)
            {
                throw new ErrorOnValidationException(
                    result.Errors.Select(e => e.ErrorMessage).Distinct().ToList()
                );
            }
        }
    }
}
