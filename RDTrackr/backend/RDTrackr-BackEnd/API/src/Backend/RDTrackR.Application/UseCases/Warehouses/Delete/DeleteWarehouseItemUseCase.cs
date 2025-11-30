using RDTrackR.Domain.Repositories;
using RDTrackR.Domain.Repositories.StockItems;
using RDTrackR.Domain.Services.LoggedUser;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;

namespace RDTrackR.Application.UseCases.Warehouses.Delete
{
    public class DeleteWarehouseItemUseCase : IDeleteWarehouseItemUseCase
    {
        private readonly IStockItemReadOnlyRepository _readRepo;
        private readonly IStockItemWriteOnlyRepository _writeRepo;
        private readonly ILoggedUser _loggedUser;
        private readonly IUnitOfWork _uow;

        public DeleteWarehouseItemUseCase(
            IStockItemReadOnlyRepository readRepo,
            IStockItemWriteOnlyRepository writeRepo,
            ILoggedUser loggedUser,
            IUnitOfWork uow)
        {
            _readRepo = readRepo;
            _writeRepo = writeRepo;
            _loggedUser = loggedUser;
            _uow = uow;
        }

        public async Task Execute(long itemId)
        {
            var user = await _loggedUser.User();

            var item = await _readRepo.GetByIdAsync(itemId);

            if (item == null)
                throw new NotFoundException(ResourceMessagesException.PRODUCT_NOT_FOUND);

            if (item.OrganizationId != user.OrganizationId)
                throw new ForbiddenException(ResourceMessagesException.NO_TOKEN);

            await _writeRepo.DeleteAsync(item);
            await _uow.Commit();
        }
    }
}
