using CommonTestUtilities.Entities;
using CommonTestUtilities.Entities.Products;
using CommonTestUtilities.LoggedUser;
using CommonTestUtilities.Mapper;
using CommonTestUtilities.Repositories;
using CommonTestUtilities.Repositories.Orders;
using CommonTestUtilities.Repositories.Products;
using CommonTestUtilities.Requests.Orders;
using CommonTestUtilities.Services.Audit;
using RDTrackR.Application.UseCases.Orders;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;
using Shouldly;

namespace UseCases.Test.Orders
{
    public class CreateOrderUseCaseTest
    {
        [Fact]
        public async Task Success()
        {
            // Arrange
            (var user, _) = UserBuilder.Build();

            var product = ProductBuilder.Build(createdBy: user);

            // Request com item válido
            var request = RequestCreateOrderJsonBuilder.Build();
            request.Items[0].ProductId = product.Id;

            var orderRepo = new OrderRepositoryBuilder().BuildWriteOnly();

            var productRepo = new ProductRepositoryBuilder()
             .GetById(product, user)
             .Exists(product.Id, true)
             .BuildRead();                    

            var audit = new AuditServiceBuilder().Build();
            var notification = new NotificationServiceBuilder().Build();
            var loggedUser = LoggedUserBuilder.Build(user);
            var mapper = MapperBuilder.Build();
            var uow = UnitOfWorkBuilder.Build();

            var useCase = new CreateOrderUseCase(
                orderRepo,
                productRepo,
                audit,
                notification,
                loggedUser,
                uow,
                mapper
            );

            var result = await useCase.Execute(request);

            result.ShouldNotBeNull();
            result.CustomerName.ShouldBe(request.CustomerName);
            result.Items.ShouldNotBeEmpty();
            result.Items.Count.ShouldBe(request.Items.Count);

            var expectedTotal = request.Items.Sum(i => i.Quantity * i.Price);
            result.Total.ShouldBe(expectedTotal);
        }


        [Fact]
        public async Task Error_When_Product_Not_Found_On_GetById()
        {
            (var user, _) = UserBuilder.Build();

            var request = RequestCreateOrderJsonBuilder.Build();
            request.Items[0].ProductId = 99999;
            
            var product = ProductBuilder.Build();

            var orderRepo = new OrderRepositoryBuilder().BuildWriteOnly();

            var productRepo = new ProductRepositoryBuilder()
                .GetById(product, user)
                .BuildRead();

            var audit = new AuditServiceBuilder().Build();
            var notification = new NotificationServiceBuilder().Build();
            var loggedUser = LoggedUserBuilder.Build(user);
            var mapper = MapperBuilder.Build();
            var uow = UnitOfWorkBuilder.Build();

            var useCase = new CreateOrderUseCase(
                orderRepo,
                productRepo,
                audit,
                notification,
                loggedUser,
                uow,
                mapper
            );

            // Act
            var act = async () => await useCase.Execute(request);

            // Assert
            var ex = await act.ShouldThrowAsync<ErrorOnValidationException>();
            ex.GetErrorMessages().ShouldContain(ResourceMessagesException.PRODUCT_NOT_FOUND);
        }


        [Fact]
        public async Task Error_When_Product_Not_Exists_Validator()
        {
            // Arrange
            (var user, _) = UserBuilder.Build();

            var request = RequestCreateOrderJsonBuilder.Build();
            request.Items[0].ProductId = 55;

            var orderRepo = new OrderRepositoryBuilder().BuildWriteOnly();

            var productRepo = new ProductRepositoryBuilder()
                .BuildRead();

            var audit = new AuditServiceBuilder().Build();
            var notification = new NotificationServiceBuilder().Build();
            var loggedUser = LoggedUserBuilder.Build(user);
            var mapper = MapperBuilder.Build();
            var uow = UnitOfWorkBuilder.Build();

            var useCase = new CreateOrderUseCase(
                orderRepo,
                productRepo,
                audit,
                notification,
                loggedUser,
                uow,
                mapper
            );

            // Act
            var act = async () => await useCase.Execute(request);

            // Assert
            var ex = await act.ShouldThrowAsync<ErrorOnValidationException>();
            ex.GetErrorMessages().ShouldContain(ResourceMessagesException.PRODUCT_NOT_FOUND);
        }


        [Fact]
        public async Task Error_Invalid_Order()
        {
            // Arrange
            (var user, _) = UserBuilder.Build();

            var request = RequestCreateOrderJsonBuilder.Build();
            request.CustomerName = ""; // inválido

            var orderRepo = new OrderRepositoryBuilder().BuildWriteOnly();
            var productRepo = new ProductRepositoryBuilder().BuildRead();
            var audit = new AuditServiceBuilder().Build();
            var notification = new NotificationServiceBuilder().Build();
            var loggedUser = LoggedUserBuilder.Build(user);
            var mapper = MapperBuilder.Build();
            var uow = UnitOfWorkBuilder.Build();

            var useCase = new CreateOrderUseCase(
                orderRepo,
                productRepo,
                audit,
                notification,
                loggedUser,
                uow,
                mapper
            );

            // Act
            var act = async () => await useCase.Execute(request);

            // Assert
            var ex = await act.ShouldThrowAsync<ErrorOnValidationException>();
            ex.GetErrorMessages().ShouldContain(ResourceMessagesException.ORDER_INVALID_CUSTOMER_NAME);
        }
    }
}
