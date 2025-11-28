using Moq;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories.Products;

namespace CommonTestUtilities.Repositories.Products
{
    public class ProductRepositoryBuilder
    {
        private readonly Mock<IProductReadOnlyRepository> _readMock = new();
        private readonly Mock<IProductWriteOnlyRepository> _writeMock = new();

        public ProductRepositoryBuilder GetById(Product product, User user)
        {
            _readMock.Setup(r => r.GetByIdAsync(product.Id, user)).ReturnsAsync(product);
            return this;
        }

        public ProductRepositoryBuilder NotExists(long productId, User user)
        {
            _readMock.Setup(r => r.GetByIdAsync(productId, user)).ReturnsAsync((Product?)null);
            return this;
        }

        public ProductRepositoryBuilder Exists(long productId, bool exists)
        {
            _readMock.Setup(r => r.Exists(productId)).ReturnsAsync(exists);
            return this;
        }


        public ProductRepositoryBuilder Add()
        {
            _writeMock.Setup(r => r.AddAsync(It.IsAny<Product>()))
                      .Returns(Task.CompletedTask);
            return this;
        }

        public ProductRepositoryBuilder Update()
        {
            _writeMock.Setup(r => r.UpdateAsync(It.IsAny<Product>()))
                      .Returns(Task.CompletedTask);
            return this;
        }

        public IProductReadOnlyRepository BuildRead() => _readMock.Object;
        public IProductWriteOnlyRepository BuildWrite() => _writeMock.Object;
    }
}
