using CommonTestUtilities.Entities;
using CommonTestUtilities.Entities.Products;
using CommonTestUtilities.LoggedUser;
using CommonTestUtilities.Mapper;
using CommonTestUtilities.Repositories;
using CommonTestUtilities.Repositories.Products;
using CommonTestUtilities.Requests;
using CommonTestUtilities.Services.Audit;
using RDTrackR.Application.UseCases.Product.Update;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;
using Shouldly;

namespace UseCases.Test.Product.Update
{
    public class UpdateProductUseCaseTest
    {
        [Fact]
        public async Task Success()
        {
            (var user, _) = UserBuilder.Build();

            var request = RequestProductJsonBuilder.Build();
            var product = ProductBuilder.Build();

            var useCase = CreateUseCase(user,product);

            Func<Task> act = async () => await useCase.Execute(product.Id, request);

            await act.ShouldNotThrowAsync();
        }

        [Fact]
        public async Task Error_Product_NotFound()
        {
            (var user, _) = UserBuilder.Build();

            var request = RequestProductJsonBuilder.Build();
            var product = ProductBuilder.Build();

            var useCase = CreateUseCase(user,product);

            Func<Task> act = async () => await useCase.Execute(id: 1000, request);

            var exception = await act.ShouldThrowAsync<NotFoundException>();
            exception.GetErrorMessages().ShouldContain(ResourceMessagesException.PRODUCT_NOT_FOUND);
        }

        private static UpdateProductUseCase CreateUseCase(RDTrackR.Domain.Entities.User user,
        RDTrackR.Domain.Entities.Product product)
        {
            var mapper = MapperBuilder.Build();
            var unitOfWork = UnitOfWorkBuilder.Build();
            var loggedUser = LoggedUserBuilder.Build(user);
            var auditLog = new AuditServiceBuilder().Build();
            var repositoryWrite = new ProductRepositoryBuilder().BuildWrite();
            var repositoryRead = new ProductRepositoryBuilder().GetById(product, user).BuildRead();

            return new UpdateProductUseCase(repositoryRead, repositoryWrite, loggedUser, unitOfWork, mapper);
        }
    }
}
