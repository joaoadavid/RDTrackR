using RDTrackR.Domain.Repositories;
using RDTrackR.Domain.Repositories.Orders;
using RDTrackR.Domain.Services.LoggedUser;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;

namespace RDTrackR.Application.UseCases.Orders
{
    public class DeleteOrderUseCase : IDeleteOrderUseCase
    {
        private readonly IOrderReadOnlyRepository _readRepo;
        private readonly IOrderDeleteOnlyRepository _deleteRepo;
        private readonly IUnitOfWork _uow;
        private readonly ILoggedUser _loggedUser;

        public DeleteOrderUseCase(
            IOrderReadOnlyRepository readRepo,
            IOrderDeleteOnlyRepository deleteRepo,
            IUnitOfWork uow,
            ILoggedUser loggedUser)
        {
            _readRepo = readRepo;
            _deleteRepo = deleteRepo;
            _uow = uow;
            _loggedUser = loggedUser;
        }

        public async Task Execute(long orderId)
        {
            var user = await _loggedUser.User();

            var order = await _readRepo.GetById(orderId);

            if (order == null || order.OrganizationId != user.OrganizationId)
                throw new NotFoundException(ResourceMessagesException.ORDER_NOT_FOUND);

            if (order.Status == Domain.Enums.OrderStatus.PAID)
                throw new ErrorOnValidationException([ResourceMessagesException.ORDER_CANNOT_CANCEL_SHIPPED]);

            await _deleteRepo.Delete(order);
            await _uow.Commit();
        }
    }
}
