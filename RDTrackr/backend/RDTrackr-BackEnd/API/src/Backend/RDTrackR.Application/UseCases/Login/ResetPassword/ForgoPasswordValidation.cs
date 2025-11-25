using FluentValidation;
using RDTrackR.Communication.Requests.Password;
using RDTrackR.Exceptions;

namespace RDTrackR.Application.UseCases.Login.ResetPassword
{
    public class ForgoPasswordValidation : AbstractValidator<RequestResetYourPasswordJson>
    {
        public ForgoPasswordValidation()
        {
            RuleFor(r => r.Email)
                .NotEmpty().WithMessage(ResourceMessagesException.EMAIL_REQUIRED)
                .EmailAddress().WithMessage(ResourceMessagesException.EMAIL_INVALID);

            RuleFor(r => r.Password)
                .NotEmpty().WithMessage(ResourceMessagesException.PASSWORD_REQUIRED)
                .MinimumLength(6).WithMessage(ResourceMessagesException.PASSWORD_MIN_LENGTH)
                .MaximumLength(100).WithMessage(ResourceMessagesException.PASSWORD_MAX_LENGTH);

            RuleFor(r => r.Password)
                .NotEmpty().WithMessage(ResourceMessagesException.PASSWORD_DIFFERENT_CURRENT_PASSWORD)
                .Equal(r => r.Password)
                .WithMessage(ResourceMessagesException.PASSWORDS_DO_NOT_MATCH);

            RuleFor(r => r.Code)
                .NotEmpty().WithMessage(ResourceMessagesException.CODE_REQUIRED);
        }
    }
}
