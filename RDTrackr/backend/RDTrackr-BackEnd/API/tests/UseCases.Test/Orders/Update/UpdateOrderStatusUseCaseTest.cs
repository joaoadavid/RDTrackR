using CommonTestUtilities.Entities;
using CommonTestUtilities.Entities.Orders;
using CommonTestUtilities.LoggedUser;
using CommonTestUtilities.Repositories;
using CommonTestUtilities.Repositories.Orders;
using CommonTestUtilities.Services.Audit;
using Moq;
using RDTrackR.Application.UseCases.Movements.Register;
using RDTrackR.Application.UseCases.Orders;
using RDTrackR.Communication.Enums;
using RDTrackR.Communication.Requests.Orders;
using RDTrackR.Domain.Entities;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;
using Shouldly;

namespace UseCases.Test.Orders.Update
{
    public class UpdateOrderStatusUseCaseTest
    {
        [Fact]
        public async Task Success_Pending_To_Paid()
        {
            (var user, _) = UserBuilder.Build();

            var order = OrderBuilder.Build(user, RDTrackR.Domain.Enums.OrderStatus.PENDING);
            order.Items.Add(OrderItemBuilder.Build(user, 10));
            
            var request = new RequestUpdateOrderStatusJson { Status = RDTrackR.Communication.Enums.OrderStatus.PAID };

            var useCase = CreateUseCase(user, order);
            await useCase.Execute(order.Id, request);

            order.Status.ShouldBe(RDTrackR.Domain.Enums.OrderStatus.PAID);
        }


        [Fact]
        public async Task Success_Paid_To_Cancelled()
        {
            (var user, _) = UserBuilder.Build();

            var order = OrderBuilder.Build(user, RDTrackR.Domain.Enums.OrderStatus.PAID);

            order.Items.Add(OrderItemBuilder.Build(user, 10));    

            var request = new RequestUpdateOrderStatusJson
            {
                Status = RDTrackR.Communication.Enums.OrderStatus.CANCELLED
            };

            var useCase = CreateUseCase(user, order);

            await useCase.Execute(order.Id, request);

            order.Status.ShouldBe(RDTrackR.Domain.Enums.OrderStatus.CANCELLED);
        }


        [Fact]
        public async Task Error_Order_Not_Found()
        {
            (var user, _) = UserBuilder.Build();
            var order = OrderBuilder.Build(user, RDTrackR.Domain.Enums.OrderStatus.PAID);

            var request = new RequestUpdateOrderStatusJson { Status = (RDTrackR.Communication.Enums.OrderStatus)order.Status };

            var useCase = CreateUseCase(user, order);

            Func<Task> act = async () => await useCase.Execute(999, request);

            var ex = await act.ShouldThrowAsync<NotFoundException>();
            ex.Message.ShouldBe(ResourceMessagesException.ORDER_NOT_FOUND);
        }


        [Fact]
        public async Task Error_Order_Other_Organization()
        {
            (var user, _) = UserBuilder.Build();
            (var other, _) = UserBuilder.Build();

            other.OrganizationId = user.OrganizationId + 100;

            var order = OrderBuilder.Build(other);

            var request = new RequestUpdateOrderStatusJson { Status = OrderStatus.PAID };

            var useCase = CreateUseCase(user, order);

            Func<Task> act = async () => await useCase.Execute(order.Id, request);

            var ex = await act.ShouldThrowAsync<NotFoundException>();
            ex.Message.ShouldBe(ResourceMessagesException.ORDER_NOT_FOUND);
        }


        [Fact]
        public async Task No_Changes_When_Status_Is_Same()
        {
            (var user, _) = UserBuilder.Build();

            var order = OrderBuilder.Build(user, RDTrackR.Domain.Enums.OrderStatus.PENDING);          

            var request = new RequestUpdateOrderStatusJson { Status = (RDTrackR.Communication.Enums.OrderStatus)order.Status };
            
            var useCase = CreateUseCase(user, order);

            await useCase.Execute(order.Id, request);

            order.Status.ShouldBe(RDTrackR.Domain.Enums.OrderStatus.PENDING);
        }

        private static UpdateOrderStatusUseCase CreateUseCase(RDTrackR.Domain.Entities.User user, Order order)
        {
            var readRepo = new OrderRepositoryBuilder()
                .WithOrder(order)
                .BuildReadOnly();

            var writeRepo = new OrderRepositoryBuilder()
                .WithOrder(order)
                .BuildWriteOnly();

            var notification = new NotificationServiceBuilder().Build();
            var audit = new AuditServiceBuilder().Build();
            var movement = new Mock<IRegisterMovementUseCase>();
            var loggedUser = LoggedUserBuilder.Build(user);

            var uow = UnitOfWorkBuilder.Build();

            return new UpdateOrderStatusUseCase(
                readRepo,
                writeRepo,
                notification,
                audit,
                movement.Object,
                loggedUser,
                uow
            );
        }
    }
}
