using Moq;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories.Suppliers;

namespace CommonTestUtilities.Repositories.Suppliers
{
    public class SupplierRepositoryBuilder
    {
        private readonly Mock<ISupplierReadOnlyRepository> _read = new();
        private readonly Mock<ISupplierWriteOnlyRepository> _write = new();

        private readonly List<Supplier> _store = new();
        private readonly List<SupplierProduct> _supplierProducts = new();

        public SupplierRepositoryBuilder()
        {
            // Fake AddAsync
            _write.Setup(w => w.AddAsync(It.IsAny<Supplier>()))
                .Callback((Supplier s) =>
                {
                    s.Id = _store.Count + 1;
                    _store.Add(s);
                })
                .Returns(Task.CompletedTask);

            _write.Setup(w => w.AddSupplierProduct(It.IsAny<SupplierProduct>()))
                .Callback((SupplierProduct sp) =>
                {
                    sp.Id = _supplierProducts.Count + 1;
                    _supplierProducts.Add(sp);
                })
                .Returns(Task.CompletedTask);

            // Fake DeleteAsync
            _write.Setup(w => w.DeleteAsync(It.IsAny<Supplier>()))
                  .Callback((Supplier s) => _store.Remove(s))
                  .Returns(Task.CompletedTask);

            // Fake UpdateAsync
            _write.Setup(w => w.UpdateAsync(It.IsAny<Supplier>()))
                  .Callback((Supplier s) =>
                  {
                      var idx = _store.FindIndex(x => x.Id == s.Id);
                      if (idx >= 0)
                          _store[idx] = s;
                  })
                  .Returns(Task.CompletedTask);

            // Default GetAll
            _read.Setup(r => r.GetAllAsync())
                 .ReturnsAsync(() => _store.ToList());

            // Default GetSupplierProducts
            _read.Setup(r => r.GetSupplierProducts(It.IsAny<long>()))
                .ReturnsAsync((long supplierId) =>
                    _supplierProducts.Where(x => x.SupplierId == supplierId).ToList()
                );

            // Default GetById
            _read.Setup(r => r.GetByIdAsync(It.IsAny<long>(), It.IsAny<User>()))
                 .ReturnsAsync((long id, User user) =>
                     _store.FirstOrDefault(x => x.Id == id && x.CreatedByUserId == user.Id)
                 );

            // Default ExistsWithEmail
            _read.Setup(r => r.ExistsWithEmail(It.IsAny<string>()))
                 .ReturnsAsync((string email) =>
                     _store.Any(s => s.Email == email));

            // Default ExistsSupplierWithEmail
            _read.Setup(r => r.ExistsSupplierWithEmail(It.IsAny<string>(), It.IsAny<long>()))
                 .ReturnsAsync((string email, long id) =>
                     _store.Any(s => s.Email == email && s.Id != id));

            // NEW → Paged
            _read.Setup(r => r.GetPagedAsync(
                It.IsAny<int>(),
                It.IsAny<int>(),
                It.IsAny<string?>()))
            .ReturnsAsync((int page, int pageSize, string search) =>
            {
                var query = _store.AsQueryable();

                if (!string.IsNullOrWhiteSpace(search))
                {
                    query = query.Where(s =>
                        s.Name.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                        s.Contact.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                        s.Email.Contains(search, StringComparison.OrdinalIgnoreCase));
                }

                return query
                    .OrderBy(s => s.Name)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();
            });

            // NEW → Count
            _read.Setup(r => r.CountAsync(It.IsAny<string?>()))
            .ReturnsAsync((string search) =>
            {
                var query = _store.AsQueryable();

                if (!string.IsNullOrWhiteSpace(search))
                {
                    query = query.Where(s =>
                        s.Name.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                        s.Contact.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                        s.Email.Contains(search, StringComparison.OrdinalIgnoreCase));
                }

                return query.Count();
            });
        }

        public SupplierRepositoryBuilder WithList(List<Supplier> suppliers)
        {
            var clonedList = suppliers.ToList(); 

            _store.AddRange(clonedList);

            _read.Setup(r => r.GetAllAsync())
                 .ReturnsAsync(clonedList);

            return this;
        }


        public SupplierRepositoryBuilder GetById(User user, Supplier? supplier)
        {
            _read.Setup(r => r.GetByIdAsync(It.IsAny<long>(), user))
                .ReturnsAsync(supplier);
            return this;
        }

        public SupplierRepositoryBuilder ExistsForUser(Supplier supplier)
        {
            _read.Setup(r => r.GetByIdAsync(
                    supplier.Id,
                    It.Is<User>(u => u.Id == supplier.CreatedByUserId)))
                .ReturnsAsync(supplier);

            return this;
        }

        public SupplierRepositoryBuilder NotExistsForUser(long id, User user)
        {
            _read.Setup(r => r.GetByIdAsync(id, user))
                 .ReturnsAsync((Supplier?)null);
            return this;
        }

        public SupplierRepositoryBuilder ExistsWithEmail(string email)
        {
            _read.Setup(r => r.ExistsWithEmail(email)).ReturnsAsync(true);
            return this;
        }

        public SupplierRepositoryBuilder ExistsSupplierWithEmail(string email, long id)
        {
            _read.Setup(r => r.ExistsSupplierWithEmail(email, id)).ReturnsAsync(true);
            return this;
        }

        public SupplierRepositoryBuilder Add() => this;
        public SupplierRepositoryBuilder Update() => this;
        public SupplierRepositoryBuilder Delete() => this;

        public ISupplierReadOnlyRepository BuildRead() => _read.Object;
        public ISupplierWriteOnlyRepository BuildWrite() => _write.Object;
    }
}
