using CommonTestUtilities.Entities;
using CommonTestUtilities.Entities.Orders;
using CommonTestUtilities.LoggedUser;
using CommonTestUtilities.Repositories;
using CommonTestUtilities.Repositories.Orders;
using RDTrackR.Application.UseCases.Orders;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Enums;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;
using Shouldly;

namespace UseCases.Test.Orders
{
    public class DeleteOrderUseCaseTest
    {
        [Fact]
        public async Task Success()
        {           
            (var user, _) = UserBuilder.Build();

            var order = OrderBuilder.Build(user);

            var repoBuilder = new OrderRepositoryBuilder()
                .WithOrder(order);

            var readRepo = repoBuilder.BuildReadOnly();
            var deleteRepo = repoBuilder.BuildDeleteOnly();
            var uow = UnitOfWorkBuilder.Build();
            var loggedUser = LoggedUserBuilder.Build(user);

            var useCase = new DeleteOrderUseCase(
                readRepo,
                deleteRepo,
                uow,
                loggedUser
            );

            var act = async () => { await useCase.Execute(order.Id); };
            await act.ShouldNotThrowAsync();
        }

        [Fact]
        public async Task Error_Order_Not_Found()
        {
            (var user, _) = UserBuilder.Build();

            var order = OrderBuilder.Build(user);
            var repoBuilder = new OrderRepositoryBuilder()
                .WithOrder(order);

            var readRepo = repoBuilder.BuildReadOnly();
            var deleteRepo = repoBuilder.BuildDeleteOnly();
            var uow = UnitOfWorkBuilder.Build();
            var loggedUser = LoggedUserBuilder.Build(user);

            var useCase = new DeleteOrderUseCase(
                readRepo,
                deleteRepo,
                uow,
                loggedUser
            );

            Func<Task> act = async () => await useCase.Execute(999);

            var ex = await act.ShouldThrowAsync<NotFoundException>();
            ex.Message.ShouldBe(ResourceMessagesException.ORDER_NOT_FOUND);
        }

        [Fact]
        public async Task Error_Order_Belongs_To_Another_Organization()
        {
            (var user, _) = UserBuilder.Build();

            // Criando um usuário de outra org
            (var anotherUser, _) = UserBuilder.Build();
            anotherUser.OrganizationId = user.OrganizationId + 999;

            var order = OrderBuilder.Build(anotherUser);

            var repoBuilder = new OrderRepositoryBuilder()
                .WithOrder(order);

            var readRepo = repoBuilder.BuildReadOnly();
            var deleteRepo = repoBuilder.BuildDeleteOnly();
            var uow = UnitOfWorkBuilder.Build();
            var loggedUser = LoggedUserBuilder.Build(user);

            var useCase = new DeleteOrderUseCase(
                readRepo,
                deleteRepo,
                uow,
                loggedUser
            );

            Func<Task> act = async () => await useCase.Execute(order.Id);

            var ex = await act.ShouldThrowAsync<NotFoundException>();
            ex.Message.ShouldBe(ResourceMessagesException.ORDER_NOT_FOUND);
        }

        [Fact]
        public async Task Error_Cannot_Delete_Paid_Order()
        {
            (var user, _) = UserBuilder.Build();

            var order = OrderBuilder.Build(user, OrderStatus.PAID);

            var repoBuilder = new OrderRepositoryBuilder()
                .WithOrder(order);

            var readRepo = repoBuilder.BuildReadOnly();
            var deleteRepo = repoBuilder.BuildDeleteOnly();
            var uow = UnitOfWorkBuilder.Build();
            var loggedUser = LoggedUserBuilder.Build(user);

            var useCase = new DeleteOrderUseCase(
                readRepo,
                deleteRepo,
                uow,
                loggedUser
            );

            Func<Task> act = async () => await useCase.Execute(order.Id);

            var ex = await act.ShouldThrowAsync<ErrorOnValidationException>();
            ex.GetErrorMessages().ShouldContain(ResourceMessagesException.ORDER_CANNOT_CANCEL_SHIPPED);

        }
    }
}
