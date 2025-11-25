using RDTrackR.Communication.Requests.Login;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Extensions;
using RDTrackR.Domain.Repositories.Password;
using RDTrackR.Domain.Repositories.Users;
using RDTrackR.Domain.ValueObjects;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;

namespace RDTrackR.Application.UseCases.Login.ResetPassword
{
    public class ValidateResetCodeUseCase : IValidateResetCodeUseCase
    {
        private readonly IUserReadOnlyRepository _repository;
        private readonly ICodeToPerformActionRepository _codeRepository;

        public ValidateResetCodeUseCase(IUserReadOnlyRepository repository, ICodeToPerformActionRepository codeRepository)
        {
            _repository = repository;
            _codeRepository = codeRepository;
        }

        public async Task Execute(RequestValidateResetCodeJson request)
        {
            var code = await _codeRepository.GetByCode(request.Code);

            if (code is null)
                throw new ErrorOnValidationException([ResourceMessagesException.CODE_INVALID]);

            var user = await _repository.GetUserById(code.UserId);

            Validate(user!, code, request);
        }

        private static void Validate(Domain.Entities.User user, CodeToPerformAction code, RequestValidateResetCodeJson request)
        {
            if (user is null)
                throw new ErrorOnValidationException([ResourceMessagesException.USER_WITHOU_PERMISSION_ACCESS_RESOURCE]);

            if (user.Email.Equals(request.Email).IsFalse())
                throw new ErrorOnValidationException([ResourceMessagesException.EMAIL_INVALID]);

            if (DateTime.Compare(code.CreatedOn.AddHours(MyRecipeBookRuleConstants.PASSWORD_RESET_CODE_VALIDITY_HOURS), DateTime.UtcNow) <= 0)
                throw new ErrorOnValidationException([ResourceMessagesException.CODE_INVALID]);

        }
    }
}
