using FluentAssertions;
using RDTrackR.Application.UseCases.Organizations;
using RDTrackR.Communication.Requests.Organization;
using RDTrackR.Exceptions;
using Shouldly;

namespace Validators.Test.Organization
{
    public class OrganizationValidatorTest
    {
        private static RequestRegisterOrganizationJson BuildValidRequest()
        {
            return new RequestRegisterOrganizationJson
            {
                Name = "Minha Organização",
                AdminName = "Admin",
                AdminEmail = "admin@teste.com",
                AdminPassword = "123456"
            };
        }

        [Fact]
        public void Success()
        {
            var validator = new OrganizationValidator();
            var request = BuildValidRequest();

            var result = validator.Validate(request);

            result.IsValid.ShouldBeTrue();
            result.Errors.ShouldBeEmpty();
        }

        [Fact]
        public void Error_Organization_Name_Empty()
        {
            var validator = new OrganizationValidator();
            var request = BuildValidRequest();
            request.Name = string.Empty;

            var result = validator.Validate(request);

            result.IsValid.ShouldBeFalse();
            result.Errors.Should().ContainSingle(e =>
                e.ErrorMessage == ResourceMessagesException.ORGANIZATION_NAME_EMPTY);
        }

        [Fact]
        public void Error_Admin_Name_Empty()
        {
            var validator = new OrganizationValidator();
            var request = BuildValidRequest();
            request.AdminName = string.Empty;

            var result = validator.Validate(request);

            result.IsValid.ShouldBeFalse();
            result.Errors.Should().ContainSingle(e =>
                e.ErrorMessage == ResourceMessagesException.NAME_EMPTY);
        }

        [Fact]
        public void Error_Admin_Email_Empty()
        {
            var validator = new OrganizationValidator();
            var request = BuildValidRequest();
            request.AdminEmail = string.Empty;

            var result = validator.Validate(request);

            result.IsValid.ShouldBeFalse();
            result.Errors.Should().ContainSingle(e =>
                e.ErrorMessage == ResourceMessagesException.EMAIL_INVALID);
        }

        [Fact]
        public void Error_Admin_Email_Invalid()
        {
            var validator = new OrganizationValidator();
            var request = BuildValidRequest();
            request.AdminEmail = "emailinvalido";

            var result = validator.Validate(request);

            result.IsValid.ShouldBeFalse();
            result.Errors.Should().ContainSingle(e =>
                e.ErrorMessage == ResourceMessagesException.EMAIL_INVALID);
        }

        [Fact]
        public void Error_Admin_Password_Shorter_Than_6()
        {
            var validator = new OrganizationValidator();
            var request = BuildValidRequest();
            request.AdminPassword = "123";

            var result = validator.Validate(request);

            result.IsValid.ShouldBeFalse();
            result.Errors.Should().ContainSingle(e =>
                e.ErrorMessage == ResourceMessagesException.PASSWORD_MIN_LENGTH);
        }
    }
}
