using FluentValidation;
using RDTrackR.Communication.Requests.Organization;
using RDTrackR.Exceptions;

namespace RDTrackR.Application.UseCases.Organizations
{
    public class OrganizationValidator : AbstractValidator<RequestRegisterOrganizationJson>
    {
        public OrganizationValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage(ResourceMessagesException.ORGANIZATION_NAME_EMPTY);

            RuleFor(x => x.AdminName)
                .NotEmpty().WithMessage(ResourceMessagesException.NAME_EMPTY);

            RuleFor(x => x.AdminEmail)
                .NotEmpty().EmailAddress().WithMessage(ResourceMessagesException.EMAIL_INVALID);

            RuleFor(x => x.AdminPassword)
                .MinimumLength(6).WithMessage(ResourceMessagesException.PASSWORD_MIN_LENGTH);
        }
    }

}