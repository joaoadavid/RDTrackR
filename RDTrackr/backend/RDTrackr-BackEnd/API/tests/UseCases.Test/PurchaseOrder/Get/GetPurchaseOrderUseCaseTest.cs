using CommonTestUtilities.Entities;
using CommonTestUtilities.LoggedUser;
using CommonTestUtilities.Mapper;
using CommonTestUtilities.PurchaseOrders;
using CommonTestUtilities.Repositories.PurchaseOrders;
using RDTrackR.Application.UseCases.PurchaseOrders.GetAll;
using RDTrackR.Communication.Requests.PurchaseOrders;
using Shouldly;

namespace UseCases.Test.PurchaseOrder.Get
{
    public class GetPurchaseOrderUseCaseTest
    {
        [Fact]
        public async Task Success()
        {
            var (user, _) = UserBuilder.Build();

            var order = PurchaseOrderBuilder.Build(createdByUserId: user.Id);

            var repository = new PurchaseOrderRepositoryBuilder()
                .WithList(user, new List<RDTrackR.Domain.Entities.PurchaseOrder> { order });

            var mapper = MapperBuilder.Build();
            var loggedUser = LoggedUserBuilder.Build(user);

            var useCase = new GetPurchaseOrdersUseCase(
                repository.BuildRead(),
                loggedUser,
                mapper
            );

            var request = new RequestGetPurchaseOrdersPagedJson
            {
                Page = 1,
                PageSize = 10,
                Search = null,
                Status = null
            };

            // Act
            var result = await useCase.Execute(request);

            // Assert
            result.ShouldNotBeNull();
            result.Total.ShouldBe(1);

            result.Items.Count.ShouldBe(1);
            result.Items[0].Id.ShouldBe(order.Id);
            result.Items[0].Status.ShouldBe(order.Status.ToString());
        }
    }
}
