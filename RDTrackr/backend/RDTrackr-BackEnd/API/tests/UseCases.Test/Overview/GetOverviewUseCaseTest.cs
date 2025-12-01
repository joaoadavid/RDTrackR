using CommonTestUtilities.Entities;
using CommonTestUtilities.LoggedUser;
using CommonTestUtilities.Repositories.Products;
using CommonTestUtilities.Repositories.Warehouses;
using CommonTestUtilities.Repositories.Movements;
using CommonTestUtilities.Repositories.StockItems;
using RDTrackR.Application.UseCases.Overview.Get;
using RDTrackR.Communication.Responses.Overview;
using RDTrackR.Domain.Entities;
using Shouldly;
using Moq;
using RDTrackR.Domain.Services.LoggedUser;

namespace UseCases.Test.Overview
{
    public class GetOverviewUseCaseTest
    {
        [Fact]
        public async Task Success()
        {
            // Arrange
            var (user, _) = UserBuilder.Build();

            var loggedUser = LoggedUserBuilder.Build(user);

            var productRepo = new ProductRepositoryBuilder()
                .CountAsync(10) // TotalProducts
                .BuildRead();

            var warehouseRepo = new WarehouseRepositoryBuilder()
                .CountAsync(3) // TotalWarehouses
                .BuildRead();

            var movementRepo = new MovementRepositoryBuilder()
                .CountAsync(25) // TotalMovements
                .BuildReadOnly();

            var stockItems = new List<StockItem>
            {
                new StockItem { Quantity = 10 },
                new StockItem { Quantity = 5 }
            };

            var stockRepo = new StockItemRepositoryBuilder()
                .GetAll(stockItems) 
                .BuildRead();

            var useCase = new GetOverviewUseCase(
                loggedUser,
                productRepo,
                warehouseRepo,
                movementRepo,
                stockRepo
            );

            // Act
            var result = await useCase.Execute();

            // Assert
            result.ShouldNotBeNull();
            result.TotalProducts.ShouldBe(10);
            result.TotalWarehouses.ShouldBe(3);
            result.TotalMovements.ShouldBe(25);
            result.TotalStockItems.ShouldBe(2);
            result.TotalInventoryQuantity.ShouldBe(15);
        }

        [Fact]
        public async Task Success_EmptyStockItems()
        {
            // Arrange
            var (user, _) = UserBuilder.Build();

            var loggedUser = LoggedUserBuilder.Build(user);

            var productRepo = new ProductRepositoryBuilder()
                .CountAsync(0)
                .BuildRead();

            var warehouseRepo = new WarehouseRepositoryBuilder()
                .CountAsync(0)
                .BuildRead();

            var movementRepo = new MovementRepositoryBuilder()
                .CountAsync(0)
                .BuildReadOnly();

            var stockRepo = new StockItemRepositoryBuilder()
                .GetAll(new List<StockItem>())
                .BuildRead();

            var useCase = new GetOverviewUseCase(
                loggedUser,
                productRepo,
                warehouseRepo,
                movementRepo,
                stockRepo
            );

            // Act
            var result = await useCase.Execute();

            // Assert
            result.ShouldNotBeNull();
            result.TotalProducts.ShouldBe(0);
            result.TotalWarehouses.ShouldBe(0);
            result.TotalMovements.ShouldBe(0);
            result.TotalStockItems.ShouldBe(0);
            result.TotalInventoryQuantity.ShouldBe(0);
        }

        [Fact]
        public async Task Error_LoggedUserThrowsException()
        {
            // Arrange: LoggedUser lançando exceção
            var loggedUser = new Mock<ILoggedUser>();
            loggedUser.Setup(u => u.User())
                      .ThrowsAsync(new Exception("User fetch failed"));

            var productRepo = new ProductRepositoryBuilder()
                .CountAsync(0)
                .BuildRead();

            var warehouseRepo = new WarehouseRepositoryBuilder()
                .CountAsync(0)
                .BuildRead();

            var movementRepo = new MovementRepositoryBuilder()
                .CountAsync(0)
                .BuildReadOnly();

            var stockRepo = new StockItemRepositoryBuilder()
                .GetAll(new List<StockItem>())
                .BuildRead();

            var useCase = new GetOverviewUseCase(
                loggedUser.Object,
                productRepo,
                warehouseRepo,
                movementRepo,
                stockRepo
            );

            // Act
            Func<Task> act = async () => await useCase.Execute();

            // Assert
            await act.ShouldThrowAsync<Exception>();
        }
    }
}
