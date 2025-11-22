using RDTrackR.Application.UseCases.Movements.Register;
using RDTrackR.Communication.Requests.Movements;
using RDTrackR.Communication.Requests.Orders;
using RDTrackR.Domain.Repositories.Orders;
using RDTrackR.Domain.Repositories;
using RDTrackR.Domain.Services.LoggedUser;
using RDTrackR.Exceptions.ExceptionBase;
using RDTrackR.Communication.Enums;

namespace RDTrackR.Application.UseCases.Orders
{
    public class UpdateOrderStatusUseCase : IUpdateOrderStatusUseCase
    {
        private readonly IOrderReadOnlyRepository _readRepo;
        private readonly IOrderWriteOnlyRepository _writeRepo;
        private readonly IRegisterMovementUseCase _movement;
        private readonly ILoggedUser _loggedUser;
        private readonly IUnitOfWork _uow;

        public UpdateOrderStatusUseCase(
            IOrderReadOnlyRepository readRepo,
            IOrderWriteOnlyRepository writeRepo,
            IRegisterMovementUseCase movement,
            ILoggedUser loggedUser,
            IUnitOfWork uow)
        {
            _readRepo = readRepo;
            _writeRepo = writeRepo;
            _movement = movement;
            _loggedUser = loggedUser;
            _uow = uow;
        }

        public async Task Execute(long id, RequestUpdateOrderStatusJson request)
        {
            var user = await _loggedUser.User();

            var order = await _readRepo.GetById(id);

            if (order == null || order.OrganizationId != user.OrganizationId)
                throw new NotFoundException("Order not found");

            // FLUXO PRINCIPAL
            if (request.Status == OrderStatus.PAID &&
                order.Status == (Domain.Enums.OrderStatus)OrderStatus.PENDING)
            {
                foreach (var item in order.Items)
                {
                    await _movement.Execute(new RequestRegisterMovementJson
                    {
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        Type = MovementType.OUTBOUND,
                        Reference = order.OrderNumber,
                        WarehouseId = 1
                    });
                }
            }

            if (request.Status == OrderStatus.CANCELLED &&
                order.Status == (Domain.Enums.OrderStatus)OrderStatus.PAID)
            {
                foreach (var item in order.Items)
                {
                    await _movement.Execute(new RequestRegisterMovementJson
                    {
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        Type = MovementType.INBOUND,
                        Reference = "CANCEL-" + order.OrderNumber,
                        WarehouseId = 1
                    });
                }
            }

            order.Status = (Domain.Enums.OrderStatus)request.Status;

            await _writeRepo.Update(order);
            await _uow.Commit();
        }
    }

}
