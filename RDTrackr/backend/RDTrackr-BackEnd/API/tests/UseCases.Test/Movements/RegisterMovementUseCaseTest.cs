using CommonTestUtilities.Entities;
using CommonTestUtilities.Entities.Products;
using CommonTestUtilities.Entities.Warehouses;
using CommonTestUtilities.LoggedUser;
using CommonTestUtilities.Mapper;
using CommonTestUtilities.Repositories;
using CommonTestUtilities.Repositories.Movements;
using CommonTestUtilities.Repositories.Products;
using CommonTestUtilities.Repositories.StockItems;
using CommonTestUtilities.Repositories.Warehouses;
using CommonTestUtilities.Requests.Movements;
using CommonTestUtilities.Services.Audit;
using RDTrackR.Application.UseCases.Movements.Register;
using RDTrackR.Domain.Entities;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;
using Shouldly;

namespace UseCases.Test.Movements
{
    public class RegisterMovementUseCaseTest
    {
        [Fact]
        public async Task Success()
        {
            (var user, _) = UserBuilder.Build();

            var product = ProductBuilder.Build(10, user);
            var warehouse = WarehouseBuilder.Build(user, 20);

            var request = RequestRegisterMovementJsonBuilder.Build();
            request.ProductId = product.Id;
            request.WarehouseId = warehouse.Id;

            var useCase = CreateUseCase(user, product, warehouse);

            var result = await useCase.Execute(request);

            result.ShouldNotBeNull();
            result.Reference.ShouldBe(request.Reference);
            result.Quantity.ShouldBe(request.Quantity);
        }


        [Fact]
        public async Task Error_Quantity_Must_Be_Greater_Than_Zero()
        {
            (var user, _) = UserBuilder.Build();

            var product = ProductBuilder.Build(createdBy: user);
            var warehouse = WarehouseBuilder.Build(createdBy: user);

            var request = RequestRegisterMovementJsonBuilder.Build(quantity: 0);
            request.ProductId = product.Id;
            request.WarehouseId = warehouse.Id;

            var useCase = CreateUseCase(user, product, warehouse);

            Func<Task> act = async () => await useCase.Execute(request);

            var ex = await act.ShouldThrowAsync<ErrorOnValidationException>();
            ex.GetErrorMessages().ShouldContain(ResourceMessagesException.MOVEMENT_QUANTITY_INVALID);
        }


        private static RegisterMovementUseCase CreateUseCase(
         RDTrackR.Domain.Entities.User user,
         RDTrackR.Domain.Entities.Product product,
         RDTrackR.Domain.Entities.Warehouse warehouse)
        {
            var movementRepoBuilder = new MovementRepositoryBuilder()
            .WithProduct(product)
            .WithWarehouse(warehouse);

            var movementWrite = movementRepoBuilder.BuildWriteOnly();
            var movementRead = movementRepoBuilder.BuildReadOnly();


            var stockItemReadRepository = new StockItemRepositoryBuilder().BuildRead();
            var stockItemWriteRepository = new StockItemRepositoryBuilder().BuildWrite();

            var productRepository = new ProductRepositoryBuilder()
                .GetById(product, user)
                .BuildRead();

            var warehouseRepository = new WarehouseRepositoryBuilder()
                .GetById(warehouse, user)
                .BuildRead();

            var warehouseWriteRepository = new WarehouseRepositoryBuilder()
                .GetById(warehouse, user)
                .BuildWrite();

            var notificationService = new NotificationServiceBuilder().Build();
            var auditService = new AuditServiceBuilder().Build();

            var mapper = MapperBuilder.Build();
            var unitOfWork = UnitOfWorkBuilder.Build();
            var loggedUser = LoggedUserBuilder.Build(user);

            return new RegisterMovementUseCase(
                movementWrite,
                movementRead,
                notificationService,
                auditService,
                stockItemReadRepository,
                stockItemWriteRepository,
                productRepository,
                warehouseRepository,
                warehouseWriteRepository,
                loggedUser,
                unitOfWork,
                mapper
            );
        }


    }
}
