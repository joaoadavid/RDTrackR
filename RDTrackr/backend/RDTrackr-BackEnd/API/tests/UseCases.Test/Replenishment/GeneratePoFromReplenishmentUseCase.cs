using CommonTestUtilities.Entities;
using CommonTestUtilities.Entities.Products;
using CommonTestUtilities.LoggedUser;
using CommonTestUtilities.PurchaseOrders;
using CommonTestUtilities.Repositories.Products;
using CommonTestUtilities.Repositories.StockItems;
using CommonTestUtilities.Requests.Replenishment;
using Moq;
using RDTrackR.Application.UseCases.Replenishment.Register;
using RDTrackR.Communication.Requests.PurchaseOrders;
using RDTrackR.Communication.Responses.PurchaseOrders;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;
using Shouldly;

namespace UseCases.Test.Replenishment
{
    public class GeneratePoFromReplenishmentUseCaseTest
    {
        [Fact]
        public async Task Success()
        {
            (var user, _) = UserBuilder.Build();

            var product = ProductBuilder.Build(createdBy: user);
            product.LastPurchasePrice = 50;

            var request = RequestGeneratePoFromReplenishmentJsonBuilder.Build();
            request.Items[0].ProductId = product.Id;

            var productRepo = new ProductRepositoryBuilder()
                .GetById(product, user)
                .BuildRead();

            var stockRepo = new StockItemRepositoryBuilder().BuildRead();

            var poResponse = new ResponsePurchaseOrderJson
            {
                Id = 99,
                WarehouseId = request.WarehouseId,
            };

            var createPo = new RegisterPurchaseOrderUseCaseBuilder()
                .Execute(poResponse)
                .BuildMock();

            var loggedUser = LoggedUserBuilder.Build(user);

            var useCase = new GeneratePoFromReplenishmentUseCase(
                createPo.Object,
                productRepo,
                stockRepo,
                loggedUser
            );

            // Act
            var result = await useCase.Execute(request);

            // Assert
            result.ShouldNotBeNull();
            result.Id.ShouldBe(poResponse.Id);
            result.WarehouseId.ShouldBe(request.WarehouseId);

            createPo.Verify(p => p.Execute(It.IsAny<RequestCreatePurchaseOrderJson>()), Times.Once);
        }

        [Fact]
        public async Task Error_Product_Not_Found()
        {
            (var user, _) = UserBuilder.Build();

            var request = RequestGeneratePoFromReplenishmentJsonBuilder.Build();
            request.Items[0].ProductId = 99999;

            var productRepo = new ProductRepositoryBuilder().BuildRead();
            var stockRepo = new StockItemRepositoryBuilder().BuildRead();

            var poUseCase = new RegisterPurchaseOrderUseCaseBuilder().Build();

            var loggedUser = LoggedUserBuilder.Build(user);

            var useCase = new GeneratePoFromReplenishmentUseCase(
                poUseCase,
                productRepo,
                stockRepo,
                loggedUser
            );

            var act = async () => await useCase.Execute(request);

            var ex = await act.ShouldThrowAsync<ErrorOnValidationException>();
            ex.GetErrorMessages().ShouldContain(ResourceMessagesException.PRODUCT_NOT_FOUND);
        }

        [Fact]
        public async Task Error_Invalid_Request()
        {
            (var user, _) = UserBuilder.Build();

            var request = RequestGeneratePoFromReplenishmentJsonBuilder.Build();
            request.Items.Clear(); // invalid

            var productRepo = new ProductRepositoryBuilder().BuildRead();
            var stockRepo = new StockItemRepositoryBuilder().BuildRead();

            var mockPo = new RegisterPurchaseOrderUseCaseBuilder().Build();

            var loggedUser = LoggedUserBuilder.Build(user);

            var useCase = new GeneratePoFromReplenishmentUseCase(
                mockPo,
                productRepo,
                stockRepo,
                loggedUser
            );

            var act = async () => await useCase.Execute(request);

            var ex = await act.ShouldThrowAsync<ErrorOnValidationException>();
            ex.GetErrorMessages().ShouldContain(ResourceMessagesException.REPLENISHMENT_ITEMS_REQUIRED);
        }
    }
}