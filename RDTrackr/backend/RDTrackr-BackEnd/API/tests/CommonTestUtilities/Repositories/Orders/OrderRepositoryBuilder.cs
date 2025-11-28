using Moq;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories.Orders;

namespace CommonTestUtilities.Repositories.Orders
{
    public class OrderRepositoryBuilder
    {
        private readonly Mock<IOrderWriteOnlyRepository> _writeMock = new();
        private readonly Mock<IOrderReadOnlyRepository> _readMock = new();
        private readonly Mock<IOrderDeleteOnlyRepository> _deleteMock = new();

        private readonly List<Order> _store = new();

        public OrderRepositoryBuilder()
        {
            _writeMock
                .Setup(r => r.Add(It.IsAny<Order>()))
                .Callback((Order order) =>
                {
                    order.Id = _store.Count + 1;

                    _store.Add(order);
                })
                .Returns(Task.CompletedTask);

            _deleteMock
                .Setup(r => r.Delete(It.IsAny<Order>()))
                .Callback((Order order) =>
                {
                    _store.Remove(order);
                })
                .Returns(Task.CompletedTask);

            _writeMock
                .Setup(r => r.Update(It.IsAny<Order>()))
                .Callback((Order order) =>
                {
                    var idx = _store.FindIndex(o => o.Id == order.Id);
                    if (idx >= 0)
                        _store[idx] = order;
                })
                .Returns(Task.CompletedTask);

            _readMock
                .Setup(r => r.GetById(It.IsAny<long>()))
                .ReturnsAsync((long id) =>
                {
                    return _store.FirstOrDefault(o => o.Id == id);
                });
            _readMock
                .Setup(r => r.GetAll(It.IsAny<long>()))
                .ReturnsAsync((long orgId) =>
                {
                    return _store
                        .Where(o => o.OrganizationId == orgId)
                        .ToList();
                });
        }

        public OrderRepositoryBuilder WithOrders(IEnumerable<Order> orders)
        {
            _store.AddRange(orders);
            return this;
        }

        public OrderRepositoryBuilder WithOrder(Order order)
        {
            _store.Add(order);
            return this;
        }

        public OrderRepositoryBuilder WithGetById(long id, Order order)
        {
            _readMock.Setup(r => r.GetById(id)).ReturnsAsync(order);
            return this;
        }

        public OrderRepositoryBuilder WithGetAll(long organizationId, List<Order> orders)
        {
            _readMock.Setup(r => r.GetAll(organizationId)).ReturnsAsync(orders);
            return this;
        }

        public IOrderWriteOnlyRepository BuildWriteOnly() => _writeMock.Object;
        public IOrderReadOnlyRepository BuildReadOnly() => _readMock.Object;
        public IOrderDeleteOnlyRepository BuildDeleteOnly() => _deleteMock.Object;
    }
}
