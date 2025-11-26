using Moq;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories.PurchaseOrders;

namespace CommonTestUtilities.Repositories.PurchaseOrders
{
    public class PurchaseOrderRepositoryBuilder
    {
        private readonly Mock<IPurchaseOrderReadOnlyRepository> _readMock = new();
        private readonly Mock<IPurchaseOrderWriteOnlyRepository> _writeMock = new();

        private readonly List<PurchaseOrder> _store = new();

        private Supplier? _supplier;
        private User? _user;
        private List<PurchaseOrderItem>? _items;

        public PurchaseOrderRepositoryBuilder()
        {
            _writeMock
                .Setup(r => r.AddAsync(It.IsAny<PurchaseOrder>()))
                .Callback((PurchaseOrder po) =>
                {
                    po.Id = _store.Count + 1;

                    if (_supplier != null)
                        po.Supplier = _supplier;

                    if (_items != null)
                        po.Items = _items;

                    if (_user != null)
                        po.CreatedBy = _user;

                    _store.Add(po);
                })
                .Returns(Task.CompletedTask);

            _readMock
                .Setup(r => r.GetByIdAsync(It.IsAny<long>(), It.IsAny<User>()))
                .ReturnsAsync((long id, User u) =>
                    _store.FirstOrDefault(x => x.Id == id && x.CreatedByUserId == u.Id)
                );

            _readMock
                .Setup(r => r.Get(It.IsAny<User>()))
                .ReturnsAsync((User u) =>
                    _store.Where(x => x.CreatedByUserId == u.Id).ToList()
                );

            _readMock
                .Setup(r => r.GetPagedAsync(
                    It.IsAny<User>(),
                    It.IsAny<int>(),
                    It.IsAny<int>(),
                    It.IsAny<string?>(),
                    It.IsAny<string?>()))
                .ReturnsAsync((User u, int page, int pageSize, string status, string search) =>
                {
                    var query = _store.Where(x => x.CreatedByUserId == u.Id).AsQueryable();

                    if (!string.IsNullOrWhiteSpace(status) && status != "all")
                        query = query.Where(x => x.Status.ToString() == status);

                    if (!string.IsNullOrWhiteSpace(search))
                    {
                        query = query.Where(x =>
                            x.Number.Contains(search) ||
                            (x.Supplier != null && x.Supplier.Name.Contains(search))
                        );
                    }

                    return query
                        .OrderByDescending(x => x.CreatedAt)
                        .Skip((page - 1) * pageSize)
                        .Take(pageSize)
                        .ToList();
                });

            _readMock
                .Setup(r => r.CountAsync(
                    It.IsAny<User>(),
                    It.IsAny<string?>(),
                    It.IsAny<string?>()))
                .ReturnsAsync((User u, string status, string search) =>
                {
                    var query = _store.Where(x => x.CreatedByUserId == u.Id).AsQueryable();

                    if (!string.IsNullOrWhiteSpace(status) && status != "all")
                        query = query.Where(x => x.Status.ToString() == status);

                    if (!string.IsNullOrWhiteSpace(search))
                    {
                        query = query.Where(x =>
                            x.Number.Contains(search) ||
                            (x.Supplier != null && x.Supplier.Name.Contains(search))
                        );
                    }

                    return query.Count();
                });
        }

        public PurchaseOrderRepositoryBuilder GetById(PurchaseOrder order, User user)
        {
            order.CreatedByUserId = user.Id;
            order.CreatedBy = user;

            _store.Add(order);

            _readMock
                .Setup(r => r.GetByIdAsync(order.Id, user))
                .ReturnsAsync(order);

            return this;
        }

        public PurchaseOrderRepositoryBuilder GetAll(PurchaseOrder[] orders, User user)
        {
            foreach (var o in orders)
            {
                o.CreatedByUserId = user.Id;
                o.CreatedBy = user;
                _store.Add(o);
            }

            _readMock.Setup(r => r.Get(user))
                     .ReturnsAsync(orders.ToList());

            return this;
        }

        public PurchaseOrderRepositoryBuilder Add()
        {
            _writeMock.Setup(r => r.AddAsync(It.IsAny<PurchaseOrder>()))
                      .Returns(Task.CompletedTask);
            return this;
        }

        public PurchaseOrderRepositoryBuilder Update()
        {
            _writeMock.Setup(r => r.UpdateAsync(It.IsAny<PurchaseOrder>()))
                      .Returns(Task.CompletedTask);
            return this;
        }

        public PurchaseOrderRepositoryBuilder Delete()
        {
            _writeMock.Setup(r => r.DeleteAsync(It.IsAny<PurchaseOrder>()))
                      .Returns(Task.CompletedTask);
            return this;
        }

        // 🔥 NOVO (sem quebrar o antigo)
        public PurchaseOrderRepositoryBuilder WithSupplier(Supplier supplier)
        {
            _supplier = supplier;
            return this;
        }

        public PurchaseOrderRepositoryBuilder WithUser(User user)
        {
            _user = user;
            return this;
        }

        public PurchaseOrderRepositoryBuilder WithItems(List<PurchaseOrderItem> items)
        {
            _items = items;
            return this;
        }

        public PurchaseOrderRepositoryBuilder WithList(User user, List<PurchaseOrder> orders)
        {
            foreach (var o in orders)
            {
                o.CreatedBy = user;
                o.CreatedByUserId = user.Id;
            }

            _store.AddRange(orders);

            _readMock
                .Setup(r => r.Get(user))
                .ReturnsAsync(orders);

            return this;
        }

        public IPurchaseOrderReadOnlyRepository BuildRead() => _readMock.Object;
        public IPurchaseOrderWriteOnlyRepository BuildWrite() => _writeMock.Object;
    }
}
