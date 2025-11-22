using MyRecipeBook.Domain.Repositories.User;
using RDTrackR.Communication.Requests.Password;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Extensions;
using RDTrackR.Domain.Repositories;
using RDTrackR.Domain.Repositories.Password;
using RDTrackR.Domain.Repositories.Users;
using RDTrackR.Domain.Security.Cryptography;
using RDTrackR.Domain.ValueObjects;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;

namespace RDTrackR.Application.UseCases.Login.ResetPassword
{
    public class ResetPasswordUseCase : IResetPasswordUseCase
    {
        private readonly IUserReadOnlyRepository _repository;
        private readonly IUserUpdateOnlyRepository _userUpdateOnlyRepository;
        private readonly IPasswordEncripter _cryptography;
        private readonly ICodeToPerformActionRepository _codeRepository;
        private readonly IUnitOfWork _unitOfWork;
        public ResetPasswordUseCase(IUserReadOnlyRepository repository,
            IUserUpdateOnlyRepository userUpdateOnlyRepository,
            IPasswordEncripter cryptography,
            ICodeToPerformActionRepository codeRepository,
            IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _userUpdateOnlyRepository = userUpdateOnlyRepository;
            _cryptography = cryptography;
            _codeRepository = codeRepository;
            _unitOfWork = unitOfWork;
        }
        public async Task Execute(RequestResetYourPasswordJson request)
        {
            var code = await _codeRepository.GetByCode(request.Code);

            if (code is null)
                throw new ErrorOnValidationException([ResourceMessagesException.CODE_INVALID]);

            var user = await _repository.GetUserById(code.UserId);

            Validate(user, code, request);

            user.Password = _cryptography.Encrypt(request.Password);

            await _userUpdateOnlyRepository.Update(user);

            _codeRepository.DeleteAllUserCodes(user);

            await _unitOfWork.Commit();
        }

        private static void Validate(Domain.Entities.User user, CodeToPerformAction code, RequestResetYourPasswordJson request)
        {
            if (user is null)
                throw new ErrorOnValidationException([ResourceMessagesException.USER_WITHOU_PERMISSION_ACCESS_RESOURCE]);

            if (user.Email.Equals(request.Email).IsFalse())
                throw new ErrorOnValidationException([ResourceMessagesException.EMAIL_INVALID]);

            var validation = new ForgoPasswordValidation().Validate(request);

            if (DateTime.Compare(code.CreatedOn.AddHours(MyRecipeBookRuleConstants.PASSWORD_RESET_CODE_VALIDITY_HOURS), DateTime.UtcNow) <= 0)
                throw new ErrorOnValidationException([ResourceMessagesException.CODE_INVALID]);

            if (validation.IsValid.IsFalse())
                throw new ErrorOnValidationException(validation.Errors.Select(code => code.ErrorMessage).ToList());
        }
    }
}
