using RDTrackR.Domain.Repositories;
using RDTrackR.Domain.Repositories.Products;
using RDTrackR.Domain.Services.LoggedUser;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;

namespace RDTrackR.Application.UseCases.Product.Delete
{
    public class DeleteProductUseCase : IDeleteProductUseCase
    {
        private readonly IProductReadOnlyRepository _readRepository;
        private readonly IProductWriteOnlyRepository _writeRepository;
        private readonly ILoggedUser _loggedUser;
        private readonly IUnitOfWork _unitOfWork;

        public DeleteProductUseCase(
            IProductReadOnlyRepository readRepository,
            IProductWriteOnlyRepository writeRepository,
            ILoggedUser loggedUser,
            IUnitOfWork unitOfWork)
        {
            _readRepository = readRepository;
            _writeRepository = writeRepository;
            _loggedUser = loggedUser;
            _unitOfWork = unitOfWork;
        }

        public async Task Execute(long id)
        {
            var loggedUser = await _loggedUser.User();
            var product = await _readRepository.GetByIdAsync(id, loggedUser);

            if (product == null)
                throw new NotFoundException(ResourceMessagesException.PRODUCT_NOT_FOUND);

            product.Active = false;
            product.UpdatedAt = DateTime.UtcNow;

            await _writeRepository.UpdateAsync(product);
            await _unitOfWork.Commit();
        }

    }
}
