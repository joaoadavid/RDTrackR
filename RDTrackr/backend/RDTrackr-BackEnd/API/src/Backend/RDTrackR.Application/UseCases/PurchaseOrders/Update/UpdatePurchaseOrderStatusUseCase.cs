using RDTrackR.Application.UseCases.Movements.Register;
using RDTrackR.Application.UseCases.PurchaseOrders.Update;
using RDTrackR.Communication.Requests.Movements;
using RDTrackR.Communication.Requests.PurchaseOrders;
using RDTrackR.Domain.Enums;
using RDTrackR.Domain.Repositories;
using RDTrackR.Domain.Repositories.Products;
using RDTrackR.Domain.Repositories.PurchaseOrders;
using RDTrackR.Domain.Services.LoggedUser;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;

public class UpdatePurchaseOrderStatusUseCase : IUpdatePurchaseOrderStatusUseCase
{
    private readonly IPurchaseOrderReadOnlyRepository _readRepository;
    private readonly IPurchaseOrderWriteOnlyRepository _writeRepository;
    private readonly IProductWriteOnlyRepository _productRepository;
    private readonly IRegisterMovementUseCase _movement;
    private readonly ILoggedUser _loggedUser;
    private readonly IUnitOfWork _unitOfWork;

    public UpdatePurchaseOrderStatusUseCase(
        IPurchaseOrderReadOnlyRepository readRepository,
        IPurchaseOrderWriteOnlyRepository writeRepository,
        IProductWriteOnlyRepository productRepository,
        IRegisterMovementUseCase movement,
        ILoggedUser loggedUser,
        IUnitOfWork unitOfWork)
    {
        _readRepository = readRepository;
        _writeRepository = writeRepository;
        _productRepository = productRepository;
        _movement = movement;
        _loggedUser = loggedUser;
        _unitOfWork = unitOfWork;
    }

    public async Task Execute(long id, RequestUpdatePurchaseOrderStatusJson request)
    {
        var loggedUser = await _loggedUser.User();
        var order = await _readRepository.GetByIdAsync(id, loggedUser)
            ?? throw new NotFoundException(ResourceMessagesException.PURCHASE_ORDER_NOT_FOUND);

        if (!Enum.TryParse<PurchaseOrderStatus>(request.Status, out var newStatus))
            throw new ErrorOnValidationException([ResourceMessagesException.ORDER_STATUS_INVALID_TRANSITION]);

        if (newStatus == PurchaseOrderStatus.RECEIVED &&
            order.Status != PurchaseOrderStatus.APPROVED)
            throw new ErrorOnValidationException([ResourceMessagesException.ORDER_STATUS_INVALID_TRANSITION]);

        order.Status = newStatus;

        await _writeRepository.UpdateAsync(order);

        if (newStatus == PurchaseOrderStatus.RECEIVED)
        {
            foreach (var item in order.Items)
            {
                item.Product.LastPurchasePrice = item.UnitPrice;
                item.Product.UpdatedAt = DateTime.UtcNow;

                await _productRepository.UpdateAsync(item.Product);

                await _movement.RegisterMovementInternal(new RequestRegisterMovementJson
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    WarehouseId = order.WarehouseId,
                    Type = RDTrackR.Communication.Enums.MovementType.INBOUND,
                    Reference = $"PO-{order.Number}"
                }, loggedUser);
            }
        }

        await _unitOfWork.Commit();
    }
}
