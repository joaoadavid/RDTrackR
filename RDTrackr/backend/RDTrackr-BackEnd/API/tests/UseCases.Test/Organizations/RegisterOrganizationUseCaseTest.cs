using CommonTestUtilities.Repositories;
using Moq;
using MyRecipeBook.Domain.Repositories.Token;
using MyRecipeBook.Domain.Security.Tokens.Refresh;
using RDTrackR.Application.UseCases.Organizations;
using RDTrackR.Communication.Requests.Organization;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories.Organization;
using RDTrackR.Domain.Repositories.Users;
using RDTrackR.Domain.Security.Cryptography;
using RDTrackR.Domain.Security.Tokens;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;
using Shouldly;
using System;

namespace UseCases.Test.Organizations
{
    public class RegisterOrganizationUseCaseTest
    {
        [Fact]
        public async Task Success()
        {

            var orgRepo = new Mock<IOrganizationWriteOnlyRepository>();
            var userRepo = new Mock<IUserWriteOnlyRepository>();
            var tokenRepo = new Mock<ITokenRepository>();
            var password = "encrypted-pass";
            var encrypter = new Mock<IPasswordEncripter>();
            encrypter.Setup(e => e.Encrypt(It.IsAny<string>())).Returns(password);

            var accessToken = "jwt-token";
            var accessGenerator = new Mock<IAccessTokenGenerator>();
            accessGenerator.Setup(g => g.GenerateWithTokenId(It.IsAny<RDTrackR.Domain.Entities.User>(), It.IsAny<string>()))
                .Returns(accessToken);

            var refreshString = "refresh-123";
            var refreshGenerator = new Mock<IRefreshTokenGenerator>();
            refreshGenerator.Setup(g => g.Generate()).Returns(refreshString);

            var uow = UnitOfWorkBuilder.BuildWithCommitVerification();

            var request = new RequestRegisterOrganizationJson
            {
                Name = "Org A",
                AdminName = "Admin",
                AdminEmail = "admin@org.com",
                AdminPassword = "123456"
            };

            var useCase = new RegisterOrganizationUseCase(
                orgRepo.Object,
                userRepo.Object,
                uow.Instance,
                encrypter.Object,
                accessGenerator.Object,
                refreshGenerator.Object,
                tokenRepo.Object
            );

            var result = await useCase.Execute(request);

            orgRepo.Verify(r => r.AddAsync(It.IsAny<Organization>()), Times.Once);
            
            userRepo.Verify(r => r.Add(It.Is<RDTrackR.Domain.Entities.User>(u =>
                u.Name == request.AdminName &&
                u.Email == request.AdminEmail &&
                u.Password == password &&
                u.Role == "Admin"
            )), Times.Once);

            tokenRepo.Verify(r => r.SaveNewRefreshToken(It.IsAny<RefreshToken>()), Times.Once);

            uow.CommitCalled.ShouldBeTrue();

            result.OrganizationName.ShouldBe("Org A");
            result.AdminUser.Name.ShouldBe(request.AdminName);
            result.AdminUser.Tokens.AccessToken.ShouldBe(accessToken);
            result.AdminUser.Tokens.RefreshToken.ShouldBe(refreshString);
        }

        [Fact]
        public async Task Error_Name_Empty()
        {
            var useCase = new RegisterOrganizationUseCase(
                new Mock<IOrganizationWriteOnlyRepository>().Object,
                new Mock<IUserWriteOnlyRepository>().Object,
                UnitOfWorkBuilder.Build(),
                new Mock<IPasswordEncripter>().Object,
                new Mock<IAccessTokenGenerator>().Object,
                new Mock<IRefreshTokenGenerator>().Object,
                new Mock<ITokenRepository>().Object
            );

            var request = new RequestRegisterOrganizationJson
            {
                Name = "",
                AdminName = "Admin",
                AdminEmail = "email@email.com",
                AdminPassword = "123456"
            };

            Func<Task> act = () => useCase.Execute(request);

            var ex = await act.ShouldThrowAsync<ErrorOnValidationException>();
            ex.GetErrorMessages().ShouldContain(ResourceMessagesException.ORGANIZATION_NAME_EMPTY);
        }

        [Fact]
        public async Task Error_Password_Invalid()
        {
            var useCase = new RegisterOrganizationUseCase(
                new Mock<IOrganizationWriteOnlyRepository>().Object,
                new Mock<IUserWriteOnlyRepository>().Object,
                UnitOfWorkBuilder.Build(),
                new Mock<IPasswordEncripter>().Object,
                new Mock<IAccessTokenGenerator>().Object,
                new Mock<IRefreshTokenGenerator>().Object,
                new Mock<ITokenRepository>().Object
            );

            var request = new RequestRegisterOrganizationJson
            {
                Name = "Organization",
                AdminName = "Admin",
                AdminEmail = "email@email.com",
                AdminPassword = ""
            };

            Func<Task> act = () => useCase.Execute(request);

            var ex = await act.ShouldThrowAsync<ErrorOnValidationException>();
            ex.GetErrorMessages().ShouldContain(ResourceMessagesException.PASSWORD_MIN_LENGTH);
        }

        [Fact]
        public async Task Error_Email_Invalid()
        {
            var useCase = new RegisterOrganizationUseCase(
                new Mock<IOrganizationWriteOnlyRepository>().Object,
                new Mock<IUserWriteOnlyRepository>().Object,
                UnitOfWorkBuilder.Build(),
                new Mock<IPasswordEncripter>().Object,
                new Mock<IAccessTokenGenerator>().Object,
                new Mock<IRefreshTokenGenerator>().Object,
                new Mock<ITokenRepository>().Object
            );

            var request = new RequestRegisterOrganizationJson
            {
                Name = "Organization Teste",
                AdminName = "Admin",
                AdminEmail = "email",
                AdminPassword = "1234567"
            };

            Func<Task> act = () => useCase.Execute(request);

            var ex = await act.ShouldThrowAsync<ErrorOnValidationException>();
            ex.GetErrorMessages().ShouldContain(ResourceMessagesException.EMAIL_INVALID);
        }
    }
}
