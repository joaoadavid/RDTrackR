using CommonTestUtilities.Entities;
using CommonTestUtilities.Entities.Products;
using CommonTestUtilities.Entities.StockItems;
using CommonTestUtilities.Entities.Warehouses;
using CommonTestUtilities.LoggedUser;
using CommonTestUtilities.Repositories.StockItems;
using RDTrackR.Application.UseCases.Replenishment.GetAll;
using RDTrackR.Communication.Requests.Replenishment;
using RDTrackR.Domain.Entities;
using Shouldly;

namespace UseCases.Test.Replenishment
{
    public class GetReplenishmentItemsUseCaseTest
    {
        [Fact]
        public async Task Success()
        {
            (var user, _) = UserBuilder.Build();

            var product = ProductBuilder.Build(createdBy: user);
            product.ReorderPoint = 30;
            product.DailyConsumption = 5;
            product.InitialStockLevel = 100;
            product.LeadTimeDays = 7;
            product.LastPurchasePrice = 12;
            product.Criticality = RDTrackR.Domain.Enums.ItemCriticality.Medium;

            var warehouse = WarehouseBuilder.Build(createdBy: user);

            var stockItem = StockItemBuilder.Build(product, warehouse, qty: 20);

            var items = new List<StockItem> { stockItem };

            var request = new RequestGetReplenishmentPagedJson
            {
                Page = 1,
                PageSize = 10,
                Search = null
            };

            var repo = new StockItemRepositoryBuilder()
                .GetPaged(items, user)
                .Count(1, user)
                .BuildRead();

            var loggedUser = LoggedUserBuilder.Build(user);

            var useCase = new GetReplenishmentItemsUseCase(loggedUser, repo);

            var result = await useCase.Execute(request);

            result.ShouldNotBeNull();
            result.Items.Count.ShouldBe(1);
            result.Total.ShouldBe(1);

            var dto = result.Items.First();

            dto.ProductId.ShouldBe(product.Id);
            dto.Sku.ShouldBe(product.Sku);
            dto.Name.ShouldBe(product.Name);
            dto.Uom.ShouldBe(product.UoM);
            dto.CurrentStock.ShouldBe(20);
            dto.ReorderPoint.ShouldBe(product.ReorderPoint);
            dto.UnitPrice.ShouldBe(product.LastPurchasePrice);

            dto.WarehouseId.ShouldBe(warehouse.Id);
            dto.WarehouseName.ShouldBe(warehouse.Name);

            dto.IsCritical.ShouldBeTrue();

            dto.SuggestedQty.ShouldBeGreaterThan(0);
        }

        [Fact]
        public async Task Success_With_Search()
        {
            (var user, _) = UserBuilder.Build();

            var product = ProductBuilder.Build(createdBy: user);
            var warehouse = WarehouseBuilder.Build(createdBy: user);
            var stockItem = StockItemBuilder.Build(product, warehouse);

            var repo = new StockItemRepositoryBuilder()
            .GetPaged(new List<StockItem> { stockItem }, user, page: 1, pageSize: 10, search: "abc")
            .Count(1, user, search: "abc")
            .BuildRead();


            var loggedUser = LoggedUserBuilder.Build(user);

            var request = new RequestGetReplenishmentPagedJson
            {
                Page = 1,
                PageSize = 10,
                Search = "abc"
            };

            var useCase = new GetReplenishmentItemsUseCase(loggedUser, repo);

            var result = await useCase.Execute(request);

            result.Items.Count.ShouldBe(1);
        }
    }
}
