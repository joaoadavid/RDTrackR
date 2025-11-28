using CommonTestUtilities.Entities;
using CommonTestUtilities.Entities.Products;
using CommonTestUtilities.Entities.Warehouses;
using CommonTestUtilities.LoggedUser;
using CommonTestUtilities.Mapper;
using CommonTestUtilities.Repositories;
using CommonTestUtilities.Repositories.StockItems;
using CommonTestUtilities.Requests.StockItem;
using RDTrackR.Application.UseCases.StockItems.Register;
using RDTrackR.Domain.Entities;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;
using Shouldly;

namespace UseCases.Test.StockItems
{
    public class RegisterStockItemUseCaseTest
    {
        [Fact]
        public async Task Success_Create_New_StockItem()
        {
            (var user, _) = UserBuilder.Build();

            var product = ProductBuilder.Build(1, createdBy: user);
            var warehouse = WarehouseBuilder.Build(createdBy: user, 1);

            var request = RequestRegisterStockItemJsonBuilder.Build(product.Id, warehouse.Id);

            var useCase = CreateUseCase(user, product, warehouse);

            var result = await useCase.Execute(request);

            result.ShouldNotBeNull();
            result.Quantity.ShouldBe(request.Quantity);
        }


        [Fact]
        public async Task Success_Update_Existing_StockItem()
        {
            (var user, _) = UserBuilder.Build();

            var product = ProductBuilder.Build(createdBy: user);
            var warehouse = WarehouseBuilder.Build(createdBy: user);

            var request = RequestRegisterStockItemJsonBuilder.Build();
            request.ProductId = product.Id;
            request.WarehouseId = warehouse.Id;
            request.Quantity = 10;

            var existingStock = new StockItem
            {
                Id = 10,
                ProductId = product.Id,
                WarehouseId = warehouse.Id,
                Quantity = 20,
                Product = product,
                Warehouse = warehouse
            };

            var useCase = CreateUseCase(user, product, warehouse, existingStock);

            var result = await useCase.Execute(request);

            result.ShouldNotBeNull();
            result.Quantity.ShouldBe(30);
        }


        [Fact]
        public async Task Error_When_Request_Invalid()
        {
            (var user, _) = UserBuilder.Build();



            var product = ProductBuilder.Build(createdBy: user);
            var warehouse = WarehouseBuilder.Build(createdBy: user);

            var existingStock = new StockItem
            {
                Id = 10,
                ProductId = product.Id,
                WarehouseId = warehouse.Id,
                Quantity = -20,
                Product = product,
                Warehouse = warehouse
            };

            var request = RequestRegisterStockItemJsonBuilder.Build();
            request.Quantity = existingStock.Quantity;

            var useCase = CreateUseCase(user, product, warehouse, existingStock);

            Func<Task> act = async () => await useCase.Execute(request);

            var ex = await act.ShouldThrowAsync<ErrorOnValidationException>();
            ex.GetErrorMessages().ShouldContain(ResourceMessagesException.STOCK_QUANTITY_INVALID);
        }

        private static RegisterStockItemUseCase CreateUseCase(
        RDTrackR.Domain.Entities.User user,
        RDTrackR.Domain.Entities.Product product,
        RDTrackR.Domain.Entities.Warehouse warehouse,
        StockItem? existingStock = null)
        {
            var builder = new StockItemRepositoryBuilder();

            if (existingStock != null)
            {
                builder
                    .GetByProductAndWarehouse(existingStock)
                    .GetById(existingStock)
                    .Update();
            }
            else
            {
                builder
                    .GetByProductAndWarehouseEmpty(product.Id, warehouse.Id);
            }

            builder
                .Add()                // AddAsync captura o StockItem criado pelo UseCase
                .EnableAutoGetById(); // GetById retorna EXATAMENTE esse objeto

            var readRepo = builder.BuildRead();
            var writeRepo = builder.BuildWrite();

            var loggedUser = LoggedUserBuilder.Build(user);
            var mapper = MapperBuilder.Build();
            var uow = UnitOfWorkBuilder.Build();

            return new RegisterStockItemUseCase(writeRepo, readRepo, loggedUser, uow, mapper);
        }


    }
}
