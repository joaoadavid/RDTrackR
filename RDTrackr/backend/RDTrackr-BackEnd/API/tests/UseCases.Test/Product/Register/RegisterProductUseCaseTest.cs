using CommonTestUtilities.Entities;
using CommonTestUtilities.LoggedUser;
using CommonTestUtilities.Mapper;
using CommonTestUtilities.Repositories;
using CommonTestUtilities.Repositories.Products;
using CommonTestUtilities.Requests;
using CommonTestUtilities.Services.Audit;
using RDTrackR.Application.UseCases.Products.Register;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;
using Shouldly;

namespace UseCases.Test.Product.Register
{
    public class RegisterProductUseCaseTest
    {
        [Fact]
        public async Task Success_Without_Image()
        {
            (var user, _) = UserBuilder.Build();

            var request = RequestProductJsonBuilder.Build();

            var useCase = CreateUseCase(user);

            var result = await useCase.Execute(request);

            result.ShouldNotBeNull();
            result.Name.ShouldNotBeNullOrWhiteSpace();
            result.Category.ShouldBe(request.Category);
        }

        [Fact]
        public async Task Error_Name_Empty()
        {
            (var user, _) = UserBuilder.Build();

            var request = RequestProductJsonBuilder.Build();
            request.Name = string.Empty;

            var useCase = CreateUseCase(user);

            Func<Task> act = async () => { await useCase.Execute(request); };

            var errors = await act.ShouldThrowAsync<ErrorOnValidationException>();
            errors.GetErrorMessages().ShouldContain(ResourceMessagesException.PRODUCT_NAME_REQUIRED);

        }

        [Fact]
        public async Task Error_Category_Empty()
        {
            (var user, _) = UserBuilder.Build();

            var request = RequestProductJsonBuilder.Build();
            request.Category = string.Empty;
            var useCase = CreateUseCase(user);

            var act = async () => { await useCase.Execute(request); };

            var errors = await act.ShouldThrowAsync<ErrorOnValidationException>();
            errors.GetErrorMessages().Count().ShouldBe(1);
            errors.GetErrorMessages().ShouldContain(ResourceMessagesException.PRODUCT_CATEGORY_REQUIRED);
        }

        private static RegisterProductUseCase CreateUseCase(RDTrackR.Domain.Entities.User user)
        {
            var mapper = MapperBuilder.Build();
            var unitOfWork = UnitOfWorkBuilder.Build();
            var loggedUser = LoggedUserBuilder.Build(user);
            var auditLog = new AuditServiceBuilder().Build();
            var repositoryWrite = new ProductRepositoryBuilder().BuildWrite();
            var repositoryRead = new ProductRepositoryBuilder().BuildRead();            

            return new RegisterProductUseCase(repositoryWrite,repositoryRead,loggedUser,unitOfWork,auditLog, mapper);
        }
    }
}
