using Moq;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories.StockItems;

namespace CommonTestUtilities.Repositories.StockItems
{
    public class StockItemRepositoryBuilder
    {
        private readonly Mock<IStockItemReadOnlyRepository> _readMock = new();
        private readonly Mock<IStockItemWriteOnlyRepository> _writeMock = new();
        private StockItem? _lastInserted;

        // =====================================================================
        // READ METHODS
        // =====================================================================

        public StockItemRepositoryBuilder GetById(StockItem item)
        {
            _readMock
                .Setup(r => r.GetByIdAsync(item.Id))
                .ReturnsAsync(item);

            return this;
        }

        public StockItemRepositoryBuilder GetByIdEmpty(long id)
        {
            _readMock
                .Setup(r => r.GetByIdAsync(id))
                .ReturnsAsync((StockItem?)null);

            return this;
        }

        public StockItemRepositoryBuilder GetAll(List<StockItem> items, User user)
        {
            _readMock
                .Setup(r => r.GetAllAsync(user))
                .ReturnsAsync(items);

            return this;
        }

        public StockItemRepositoryBuilder GetReplenishmentCandidates(
            List<StockItem> items,
            User user)
        {
            _readMock
                .Setup(r => r.GetReplenishmentCandidatesAsync(user))
                .ReturnsAsync(items);

            return this;
        }

        public StockItemRepositoryBuilder GetByProductAndWarehouse(StockItem item)
        {
            _readMock
                .Setup(r =>
                    r.GetByProductAndWarehouseAsync(item.ProductId, item.WarehouseId)
                )
                .ReturnsAsync(item);

            return this;
        }

        public StockItemRepositoryBuilder EnableAutoGetById()
        {
            _readMock
                .Setup(r => r.GetByIdAsync(It.IsAny<long>()))
                .ReturnsAsync((long id) =>
                {
                    if (_lastInserted != null && _lastInserted.Id == id)
                        return _lastInserted;

                    return null;
                });

            return this;
        }


        public StockItemRepositoryBuilder GetByProductAndWarehouseEmpty(long productId, long warehouseId)
        {
            _readMock
                .Setup(r =>
                    r.GetByProductAndWarehouseAsync(productId, warehouseId)
                )
                .ReturnsAsync((StockItem?)null);

            return this;
        }

        public StockItemRepositoryBuilder GetByWarehouse(
            List<StockItem> items,
            long warehouseId,
            User user)
        {
            _readMock
                .Setup(r => r.GetByWarehouseAsync(warehouseId, user))
                .ReturnsAsync(items);

            return this;
        }

        public StockItemRepositoryBuilder GetPaged(
            List<StockItem> items,
            User user,
            string? search = null
        )
        {
            _readMock
                .Setup(r => r.GetPagedAsync(user,
                                            It.IsAny<int>(),      // qualquer page
                                            It.IsAny<int>(),      // qualquer pageSize
                                            search))
                .ReturnsAsync(items);

            return this;
        }
        public StockItemRepositoryBuilder GetPaged(
            List<StockItem> items,
            User user,
            int page,
            int pageSize,
            string? search = null
        )
        {
            _readMock
                .Setup(r => r.GetPagedAsync(user, page, pageSize, search))
                .ReturnsAsync(items);

            return this;
        }


        public StockItemRepositoryBuilder Count(
            int total,
            User user,
            string? search = null)
        {
            _readMock
                .Setup(r => r.CountAsync(user, search))
                .ReturnsAsync(total);

            return this;
        }

        // =====================================================================
        // WRITE METHODS
        // =====================================================================


        public StockItemRepositoryBuilder Add()
        {
            _writeMock
                .Setup(r => r.AddAsync(It.IsAny<StockItem>()))
                .Callback<StockItem>(s =>
                {
                    s.Id = 1;
                    _lastInserted = s;
                })
                .Returns(Task.CompletedTask);

            return this;
        }


        public StockItemRepositoryBuilder Update()
        {
            _writeMock
                .Setup(r => r.UpdateAsync(It.IsAny<StockItem>()))
                .Returns(Task.CompletedTask);

            return this;
        }

        public IStockItemReadOnlyRepository BuildRead() => _readMock.Object;
        public IStockItemWriteOnlyRepository BuildWrite() => _writeMock.Object;

        public Mock<IStockItemReadOnlyRepository> BuildReadMock() => _readMock;
        public Mock<IStockItemWriteOnlyRepository> BuildWriteMock() => _writeMock;
    }
}
