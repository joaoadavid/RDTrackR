using RDTrackR.Domain.Repositories.SupplierProducts;
using RDTrackR.Domain.Repositories;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;
using RDTrackR.Domain.Services.LoggedUser;

namespace RDTrackR.Application.UseCases.Suppliers.DeleteSupplierProduct
{
    public class DeleteSupplierProductUseCase : IDeleteSupplierProductUseCase
    {
        private readonly ILoggedUser _loggedUser;
        private readonly ISupplierProductWriteOnlyRepository _repository;
        private readonly ISupplierProductReadOnlyRepository _readRepository;
        private readonly IUnitOfWork _unitOfWork;

        public DeleteSupplierProductUseCase(
            ILoggedUser loggedUser,
            ISupplierProductWriteOnlyRepository repository,
            ISupplierProductReadOnlyRepository readRepository,
            IUnitOfWork unitOfWork)
        {
            _loggedUser = loggedUser;
            _repository = repository;
            _readRepository = readRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task Execute(long supplierId, long productId)
        {
            var user = await _loggedUser.User();
            var exists = await _readRepository.ExistsAsync(supplierId, productId);

            if (!exists)
                throw new ErrorOnValidationException([ResourceMessagesException.SUPPLIER_PRODUCT_NOT_FOUND]);

            await _repository.DeleteAsync(supplierId, productId, user);
            await _unitOfWork.Commit();
        }
    }
}
