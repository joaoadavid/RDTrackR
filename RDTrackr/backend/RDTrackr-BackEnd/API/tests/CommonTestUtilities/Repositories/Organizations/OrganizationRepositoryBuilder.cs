using Moq;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories.Organization;

namespace CommonTestUtilities.Repositories.Organizations
{
    public class OrganizationRepositoryBuilder
    {
        private readonly Mock<IOrganizationReadOnlyRepository> _readMock = new();
        private readonly Mock<IOrganizationWriteOnlyRepository> _writeMock = new();

        private readonly List<Organization> _store = new();

        public OrganizationRepositoryBuilder()
        {
            // Simula insert no banco
            _writeMock
                .Setup(r => r.AddAsync(It.IsAny<Organization>()))
                .Callback((Organization o) =>
                {
                    if (o.Id == 0)
                        o.Id = _store.Count + 1;

                    _store.Add(o);
                })
                .Returns(Task.CompletedTask);

            // GetById básico
            _readMock
                .Setup(r => r.GetByIdAsync(It.IsAny<long>()))
                .ReturnsAsync((long id) =>
                    _store.FirstOrDefault(x => x.Id == id)
                );
        }

        public OrganizationRepositoryBuilder WithOrganization(Organization org)
        {
            _store.Add(org);

            _readMock.Setup(r => r.GetByIdAsync(org.Id))
                     .ReturnsAsync(org);

            _readMock.Setup(r => r.ExistsAsync(org.Id))
                     .ReturnsAsync(true);

            return this;
        }

        public OrganizationRepositoryBuilder List(List<Organization> list)
        {
            _store.AddRange(list);

            _readMock.Setup(r => r.GetAllAsync())
                     .ReturnsAsync(list);

            foreach (var org in list)
            {
                _readMock.Setup(r => r.GetByIdAsync(org.Id))
                         .ReturnsAsync(org);

                _readMock.Setup(r => r.ExistsAsync(org.Id))
                         .ReturnsAsync(true);
            }

            return this;
        }

        public OrganizationRepositoryBuilder Exists(long id, bool exists = true)
        {
            _readMock.Setup(r => r.ExistsAsync(id))
                     .ReturnsAsync(exists);

            return this;
        }

        public OrganizationRepositoryBuilder Add()
        {
            _writeMock.Setup(r => r.AddAsync(It.IsAny<Organization>()))
                .Returns(Task.CompletedTask);

            return this;
        }

        public IOrganizationReadOnlyRepository BuildRead() => _readMock.Object;
        public IOrganizationWriteOnlyRepository BuildWrite() => _writeMock.Object;
    }
}
