using RDTrackR.Application.UseCases.Movements.Register;
using RDTrackR.Communication.Requests.Movements;
using RDTrackR.Communication.Requests.Orders;
using RDTrackR.Domain.Repositories.Orders;
using RDTrackR.Domain.Repositories;
using RDTrackR.Domain.Services.LoggedUser;
using RDTrackR.Exceptions.ExceptionBase;
using RDTrackR.Communication.Enums;
using RDTrackR.Domain.Services.Audit;
using RDTrackR.Domain.Services.Notification;
using RDTrackR.Exceptions;

namespace RDTrackR.Application.UseCases.Orders
{
    public class UpdateOrderStatusUseCase : IUpdateOrderStatusUseCase
    {
        private readonly IOrderReadOnlyRepository _readRepo;
        private readonly IOrderWriteOnlyRepository _writeRepo;
        private readonly INotificationService _notificationService;
        private readonly IAuditService _auditService;
        private readonly IRegisterMovementUseCase _movement;
        private readonly ILoggedUser _loggedUser;
        private readonly IUnitOfWork _uow;

        public UpdateOrderStatusUseCase(
            IOrderReadOnlyRepository readRepo,
            IOrderWriteOnlyRepository writeRepo,
            INotificationService notificationService,
            IAuditService auditService,
            IRegisterMovementUseCase movement,
            ILoggedUser loggedUser,
            IUnitOfWork uow)
        {
            _readRepo = readRepo;
            _writeRepo = writeRepo;
            _notificationService = notificationService;
            _auditService = auditService;
            _movement = movement;
            _loggedUser = loggedUser;
            _uow = uow;
        }

        public async Task Execute(long id, RequestUpdateOrderStatusJson request)
        {
            var user = await _loggedUser.User();

            var order = await _readRepo.GetById(id);

            if (order == null || order.OrganizationId != user.OrganizationId)
                throw new NotFoundException(ResourceMessagesException.ORDER_NOT_FOUND);

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

                    await _notificationService.Notify($"Novo status de pedido #{order.Status}");
                    await _auditService.Log(Domain.Enums.AuditActionType.CREATE, $"Order Status {order.Status} foi alterado {user.Name}");
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

                    await _notificationService.Notify($"Novo status de pedido #{order.Status}");
                    await _auditService.Log(Domain.Enums.AuditActionType.CREATE, $"Order Status {order.Status} foi alterado {user.Name}");
                }
            }

            order.Status = (Domain.Enums.OrderStatus)request.Status;

            await _writeRepo.Update(order);
            await _uow.Commit();
        }
    }

}
