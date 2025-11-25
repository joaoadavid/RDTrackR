using CommonTestUtilities.Entities;
using CommonTestUtilities.LoggedUser;
using CommonTestUtilities.Mapper;
using CommonTestUtilities.Repositories;
using CommonTestUtilities.Repositories.PurchaseOrders;
using CommonTestUtilities.Requests.PurchaseOrder;
using CommonTestUtilities.Services.Audit;
using RDTrackR.Application.UseCases.PurchaseOrders.Register;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;
using Shouldly;

namespace UseCases.Test.PurchaseOrder.Register
{
    public class RegisterPurchaseOrderUseCaseTest
    {
        [Fact]
        public async Task Success()
        {
            (var user, _) = UserBuilder.Build();

            var request = RequestPurchaseOrderJsonBuilder.Build();

            var useCase = CreateUseCase(user);

            var result = await useCase.Execute(request);

            result.ShouldNotBeNull();
            result.Items.Count.ShouldBe(request.Items.Count);

            for (int i = 0; i < request.Items.Count; i++)
            {
                result.Items[i].Quantity.ShouldBe(request.Items[i].Quantity);
                result.Items[i].UnitPrice.ShouldBe(request.Items[i].UnitPrice);
            }
        }

        [Fact]
        public async Task Error_PO_Items_Required()
        {
            (var user, _) = UserBuilder.Build();
            var request = RequestPurchaseOrderJsonBuilder.Build();
            request.Items = [];
            var useCase = CreateUseCase(user);

            Func<Task> act = async () => { await useCase.Execute(request); };

            var exception = await act.ShouldThrowAsync<ErrorOnValidationException>();
            exception.GetErrorMessages().ShouldContain(ResourceMessagesException.PO_ITEMS_REQUIRED);
        }

        private static RegisterPurchaseOrderUseCase CreateUseCase(
        RDTrackR.Domain.Entities.User user)
        {
            var mapper = MapperBuilder.Build();
            var loggedUser = LoggedUserBuilder.Build(user);
            var repositoryBuilder = new PurchaseOrderRepositoryBuilder().BuildWrite();
            var notification = new NotificationServiceBuilder().Build();
            var auditLog = new AuditServiceBuilder().Build();
            var unitOfWork = UnitOfWorkBuilder.Build();

            return new RegisterPurchaseOrderUseCase(mapper,notification,auditLog, repositoryBuilder, loggedUser, unitOfWork);
        }
    }
}
