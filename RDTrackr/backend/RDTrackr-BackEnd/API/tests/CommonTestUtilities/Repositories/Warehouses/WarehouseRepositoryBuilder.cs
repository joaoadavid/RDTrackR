using Moq;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories.Warehouses;

namespace CommonTestUtilities.Repositories.Warehouses
{
    public class WarehouseRepositoryBuilder
    {
        private readonly Mock<IWarehouseReadOnlyRepository> _readMock = new();
        private readonly Mock<IWarehouseWriteOnlyRepository> _writeMock = new();

        private readonly List<Warehouse> _store = new();

        private User? _user;

        public WarehouseRepositoryBuilder()
        {
            _writeMock
                .Setup(r => r.AddAsync(It.IsAny<Warehouse>()))
                .Callback((Warehouse w) =>
                {
                    w.Id = _store.Count + 1;

                    if (_user != null)
                    {
                        w.CreatedBy = _user;
                        w.CreatedByUserId = _user.Id;
                    }

                    _store.Add(w);
                })
                .Returns(Task.CompletedTask);

            _writeMock
                .Setup(r => r.UpdateAsync(It.IsAny<Warehouse>()))
                .Callback((Warehouse w) =>
                {
                    var index = _store.FindIndex(x => x.Id == w.Id);
                    if (index >= 0)
                        _store[index] = w;
                })
                .Returns(Task.CompletedTask);

            _writeMock
                .Setup(r => r.DeleteAsync(It.IsAny<Warehouse>()))
                .Callback((Warehouse w) =>
                {
                    _store.RemoveAll(x => x.Id == w.Id);
                })
                .Returns(Task.CompletedTask);

            _readMock
                .Setup(r => r.GetByIdAsync(It.IsAny<long>(), It.IsAny<User>()))
                .ReturnsAsync((long id, User user) =>
                    _store.FirstOrDefault(x => x.Id == id && x.CreatedByUserId == user.Id)
                );

            _readMock
                .Setup(r => r.GetAllAsync(It.IsAny<User>()))
                .ReturnsAsync((User user) =>
                    _store.Where(x => x.CreatedByUserId == user.Id).ToList()
                );
            
            _readMock
                .Setup(r => r.GetPagedAsync(
                    It.IsAny<User>(),
                    It.IsAny<int>(),
                    It.IsAny<int>(),
                    It.IsAny<string?>()))
                .ReturnsAsync((User user, int page, int pageSize, string search) =>
                {
                    var query = _store
                        .Where(x => x.CreatedByUserId == user.Id)
                        .AsQueryable();

                    if (!string.IsNullOrWhiteSpace(search))
                        query = query.Where(x =>
                            x.Name.Contains(search)
                        );

                    return query
                        .OrderByDescending(x => x.CreatedOn)
                        .Skip((page - 1) * pageSize)
                        .Take(pageSize)
                        .ToList();
                });

            _readMock
                .Setup(r => r.CountAsync(
                    It.IsAny<User>(),
                    It.IsAny<string?>()))
                .ReturnsAsync((User user, string search) =>
                {
                    var query = _store.Where(x => x.CreatedByUserId == user.Id).AsQueryable();

                    if (!string.IsNullOrWhiteSpace(search))
                        query = query.Where(x => x.Name.Contains(search));

                    return query.Count();
                });
        }
        public WarehouseRepositoryBuilder WithUser(User user)
        {
            _user = user;
            return this;
        }

        public WarehouseRepositoryBuilder CountAsync(int count)
        {
            _readMock
                .Setup(r => r.CountAsync(It.IsAny<User>(), It.IsAny<string?>()))
                .ReturnsAsync(count);

            return this;
        }

        public WarehouseRepositoryBuilder CountAsync(User user, string? search, int count)
        {
            _readMock
                .Setup(r => r.CountAsync(
                    It.Is<User>(u => u.Id == user.Id && u.OrganizationId == user.OrganizationId),
                    It.Is<string?>(s => s == search)
                ))
                .ReturnsAsync(count);

            return this;
        }


        public WarehouseRepositoryBuilder WithList(User user, List<Warehouse> warehouses)
        {
            foreach (var w in warehouses)
            {
                w.CreatedBy = user;
                w.CreatedByUserId = user.Id;
            }

            _store.AddRange(warehouses);

            return this;
        }

        public WarehouseRepositoryBuilder GetById(Warehouse w, User user)
        {
            w.CreatedBy = user;
            w.CreatedByUserId = user.Id;

            _store.Add(w);

            _readMock
                .Setup(r => r.GetByIdAsync(w.Id, user))
                .ReturnsAsync(w);

            return this;
        }

        public WarehouseRepositoryBuilder NotExists(long id, User user)
        {
            _readMock
                .Setup(r => r.GetByIdAsync(id, user))
                .ReturnsAsync((Warehouse?)null);

            return this;
        }

        public IWarehouseReadOnlyRepository BuildRead() => _readMock.Object;
        public IWarehouseWriteOnlyRepository BuildWrite() => _writeMock.Object;
    }
}
