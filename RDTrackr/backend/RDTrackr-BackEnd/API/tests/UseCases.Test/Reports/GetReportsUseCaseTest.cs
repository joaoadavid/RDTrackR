using CommonTestUtilities.Mapper;
using CommonTestUtilities.Repositories.PurchaseOrders;
using CommonTestUtilities.Repositories.Reports;
using Moq;
using RDTrackR.Application.UseCases.Reports;
using RDTrackR.Communication.Responses.Reports;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories.PurchaseOrders;
using Shouldly;

namespace UseCases.Test.Reports
{
    public class GetReportsUseCaseTest
    {
        [Fact]
        public async Task Success()
        {            
            var mapper = MapperBuilder.Build();

            var recentOrders = new List<RDTrackR.Domain.Entities.PurchaseOrder>
            {
                new RDTrackR.Domain.Entities.PurchaseOrder { Id = 1, Number = "PO001" },
                new RDTrackR.Domain.Entities.PurchaseOrder { Id = 2, Number = "PO002" }
            };

            var topSuppliers = new List<SupplierPurchaseSummary>
            {
                new SupplierPurchaseSummary { SupplierName = "Supplier A", TotalPurchased = 500 },
                new SupplierPurchaseSummary { SupplierName = "Supplier B", TotalPurchased = 300 }
            };

            var repo = new ReportsRepositoryBuilder()
                .GetRecent(recentOrders)
                .GetTotal(1500)
                .GetPending(2)
                .GetCancel(1)
                .GetTopSuppliers(topSuppliers)
                .Build();

            var useCase = new GetReportsUseCase(repo, mapper);

            var result = await useCase.Execute();

            result.ShouldNotBeNull();
            result.TotalPurchaseOrders.ShouldBe(2);
            result.TotalValuePurchased.ShouldBe(1500);
            result.PendingPurchaseOrders.ShouldBe(2);
            result.CancelPurchaseOrders.ShouldBe(1);

            result.RecentOrders.Count.ShouldBe(2);
            result.TopSuppliers.Count.ShouldBe(2);
            result.TopSuppliers[0].SupplierName.ShouldBe("Supplier A");
        }

        [Fact]
        public async Task Success_EmptyLists()
        {
            var mapper = MapperBuilder.Build();

            var repo = new ReportsRepositoryBuilder()
                .GetRecent(new List<RDTrackR.Domain.Entities.PurchaseOrder>())
                .GetTotal(0)
                .GetPending(0)
                .GetCancel(0)
                .GetTopSuppliers(new List<SupplierPurchaseSummary>())
                .Build();

            var useCase = new GetReportsUseCase(repo, mapper);

            var result = await useCase.Execute();

            result.TotalPurchaseOrders.ShouldBe(0);
            result.RecentOrders.ShouldBeEmpty();
            result.TopSuppliers.ShouldBeEmpty();
        }

        [Fact]
        public async Task Error_RepositoryThrowsException()
        {
            var mapper = MapperBuilder.Build();

            var repoMock = new Mock<IPurchaseOrderReadOnlyRepository>();
            repoMock.Setup(r => r.GetRecentAsync(It.IsAny<int>()))
                    .ThrowsAsync(new Exception("Repo failed"));

            var useCase = new GetReportsUseCase(repoMock.Object, mapper);

            Func<Task> act = async () => await useCase.Execute();

            await act.ShouldThrowAsync<Exception>();
        }
    }
}
