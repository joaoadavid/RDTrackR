using CommonTestUtilities.Entities;
using CommonTestUtilities.Entities.Products;
using CommonTestUtilities.Entities.StockItems;
using CommonTestUtilities.Entities.Warehouses;
using CommonTestUtilities.LoggedUser;
using CommonTestUtilities.Mapper;
using CommonTestUtilities.Repositories.StockItems;
using RDTrackR.Application.UseCases.StockItems.GetAll;
using RDTrackR.Domain.Entities;
using Shouldly;

namespace UseCases.Test.StockItems
{
    public class GetAllStockItemsUseCaseTest
    {
        [Fact]
        public async Task Success()
        {
            (var user, _) = UserBuilder.Build();

            var product = ProductBuilder.Build(createdBy: user);
            var warehouse = WarehouseBuilder.Build(createdBy: user);

            var stockItem = StockItemBuilder.Build(product, warehouse, qty: 42);

            var repo = new StockItemRepositoryBuilder()
                .GetAll(new List<StockItem> { stockItem }, user)
                .BuildRead();

            var loggedUser = LoggedUserBuilder.Build(user);
            var mapper = MapperBuilder.Build();

            var useCase = new GetAllStockItemsUseCase(repo, loggedUser, mapper);

            var result = await useCase.Execute();

            result.ShouldNotBeNull();
            result.Count.ShouldBe(1);

            var dto = result.First();
            dto.ProductName.ShouldBe(product.Name);
            dto.WarehouseName.ShouldBe(warehouse.Name);
            dto.Quantity.ShouldBe(42);
        }

        [Fact]
        public async Task Success_EmptyList()
        {
            (var user, _) = UserBuilder.Build();

            var repo = new StockItemRepositoryBuilder()
                .GetAll(new List<StockItem>(), user)
                .BuildRead();

            var loggedUser = LoggedUserBuilder.Build(user);
            var mapper = MapperBuilder.Build();

            var useCase = new GetAllStockItemsUseCase(repo, loggedUser, mapper);

            var result = await useCase.Execute();

            result.ShouldNotBeNull();
            result.ShouldBeEmpty();
        }
        
        [Fact]
        public async Task Success_MultipleItems()
        {
            (var user, _) = UserBuilder.Build();

            var product1 = ProductBuilder.Build(createdBy: user);
            var product2 = ProductBuilder.Build(createdBy: user);

            var warehouse1 = WarehouseBuilder.Build(createdBy: user);
            var warehouse2 = WarehouseBuilder.Build(createdBy: user);

            var stock1 = StockItemBuilder.Build(product1, warehouse1, qty: 5);
            var stock2 = StockItemBuilder.Build(product2, warehouse2, qty: 15);

            var repo = new StockItemRepositoryBuilder()
                .GetAll(new List<StockItem> { stock1, stock2 }, user)
                .BuildRead();

            var loggedUser = LoggedUserBuilder.Build(user);
            var mapper = MapperBuilder.Build();

            var useCase = new GetAllStockItemsUseCase(repo, loggedUser, mapper);

            var result = await useCase.Execute();

            result.Count.ShouldBe(2);
            result.Any(r => r.ProductName == product1.Name && r.Quantity == 5).ShouldBeTrue();
            result.Any(r => r.ProductName == product2.Name && r.Quantity == 15).ShouldBeTrue();
        }
    }
}