using CommonTestUtilities.Entities;
using CommonTestUtilities.Entities.Products;
using CommonTestUtilities.LoggedUser;
using CommonTestUtilities.Repositories;
using CommonTestUtilities.Repositories.Products;
using CommonTestUtilities.Services.Audit;
using RDTrackR.Application.UseCases.Product.Delete;
using RDTrackR.Domain.Entities;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;
using Shouldly;

namespace UseCases.Test.Product.Delete
{
    public class DeleteProductUseCaseTest
    {
        [Fact]
        public async Task Success()
        {
            (var user, _) = UserBuilder.Build();

            var product = ProductBuilder.Build();
            product.CreatedByUserId = user.Id;

            var useCase = CreateUseCase(user, product);

            var act = async () => { await useCase.Execute(product.Id); };

            await act.ShouldNotThrowAsync();
        }


        [Fact]
        public async Task Error_Recipe_NotFound()
        {
            (var user, _) = UserBuilder.Build();

            var useCase = CreateUseCase(user);

            Func<Task> act = async () => { await useCase.Execute(id: 1000); };

            var exception = await act.ShouldThrowAsync<NotFoundException>();
            exception.GetErrorMessages().ShouldContain(ResourceMessagesException.PRODUCT_NOT_FOUND);
        }

        private static DeleteProductUseCase CreateUseCase(
        RDTrackR.Domain.Entities.User user,
        RDTrackR.Domain.Entities.Product? product = null)
        {
            var loggedUser = LoggedUserBuilder.Build(user);

            var repositoryBuilder = new ProductRepositoryBuilder();
            var repositoryWriteBuilder = new ProductRepositoryBuilder().BuildWrite();
            var unitOfWork = UnitOfWorkBuilder.Build();
            var notificationService = new NotificationServiceBuilder().Build();
            var auditService = new AuditServiceBuilder().Build();

            if (product is not null)
                repositoryBuilder.GetById(product, user);

            var repository = repositoryBuilder.BuildRead();

            return new DeleteProductUseCase(repository, repositoryWriteBuilder,notificationService,auditService, loggedUser, unitOfWork);
        }
    }
}
