using Moq;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories.Warehouses;

namespace CommonTestUtilities.Repositories.Warehouses
{
    public class WarehouseRepositoryBuilder
    {
        private readonly Mock<IWarehouseReadOnlyRepository> _read = new();
        private readonly Mock<IWarehouseWriteOnlyRepository> _write = new();

        public WarehouseRepositoryBuilder GetById(Warehouse warehouse, User user)
        {
            _read.Setup(r => r.GetByIdAsync(warehouse.Id,user)).ReturnsAsync(warehouse);
            return this;
        }

        public WarehouseRepositoryBuilder NotExists(long id, User user)
        {
            _read.Setup(r => r.GetByIdAsync(id, user)).ReturnsAsync((Warehouse?)null);
            return this;
        }

        public WarehouseRepositoryBuilder Add()
        {
            _write.Setup(r => r.AddAsync(It.IsAny<Warehouse>()))
                .Returns(Task.CompletedTask);
            return this;
        }

        public WarehouseRepositoryBuilder Update()
        {
            _write.Setup(r => r.UpdateAsync(It.IsAny<Warehouse>()))
                .Returns(Task.CompletedTask);
            return this;
        }

        public WarehouseRepositoryBuilder Delete()
        {
            _write.Setup(r => r.DeleteAsync(It.IsAny<Warehouse>()))
                .Returns(Task.CompletedTask);
            return this;
        }

        public WarehouseRepositoryBuilder WithList(User user,List<Warehouse> warehouses)
        {
            _read.Setup(r => r.GetAllAsync(user)).ReturnsAsync(warehouses);
            return this;
        }


        public IWarehouseReadOnlyRepository BuildRead() => _read.Object;
        public IWarehouseWriteOnlyRepository BuildWrite() => _write.Object;
    }
}
