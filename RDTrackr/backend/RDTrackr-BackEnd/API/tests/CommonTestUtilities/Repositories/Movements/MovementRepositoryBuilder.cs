using Moq;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Enums;
using RDTrackR.Domain.Repositories.Movements;

namespace CommonTestUtilities.Repositories.Movements
{
    public class MovementRepositoryBuilder
    {
        private readonly Mock<IMovementReadOnlyRepository> _readMock = new();
        private readonly Mock<IMovementWriteOnlyRepository> _writeMock = new();
        private readonly List<Movement> _store = new();

        public MovementRepositoryBuilder()
        {
            // Simula AddAsync salvando o movimento
            _writeMock
                .Setup(r => r.AddAsync(It.IsAny<Movement>()))
                .Callback((Movement m) =>
                {
                    // Simula ID gerado pelo banco
                    m.Id = _store.Count + 1;
                    _store.Add(m);
                })
                .Returns(Task.CompletedTask);

            // Simula GetByIdAsync lendo do store
            _readMock
                .Setup(r => r.GetByIdAsync(It.IsAny<long>()))
                .ReturnsAsync((long id) => _store.FirstOrDefault(x => x.Id == id));
        }

        public MovementRepositoryBuilder GetById(Movement movement)
        {
            _readMock.Setup(r => r.GetByIdAsync(movement.Id)).ReturnsAsync(movement);
            return this;
        }

        public MovementRepositoryBuilder List(List<Movement> list, User user)
        {
            _readMock.Setup(r => r.GetAllAsync(user)).ReturnsAsync(list);
            return this;
        }

        public MovementRepositoryBuilder Filter(long? warehouseId, MovementType? type, DateTime? start, DateTime? end, List<Movement> result, User user)
        {
            _readMock.Setup(r => r.GetFilteredAsync(warehouseId, type, start, end,user)).ReturnsAsync(result);
            return this;
        }

        public MovementRepositoryBuilder GetByType(MovementType type, List<Movement> result)
        {
            _readMock.Setup(r => r.GetByTypeAsync(type.ToString())).ReturnsAsync(result);
            return this;
        }

        public MovementRepositoryBuilder Count(int count,User user)
        {
            _readMock.Setup(r => r.CountAsync(user)).ReturnsAsync(count);
            return this;
        }

        public MovementRepositoryBuilder Add()
        {
            _writeMock.Setup(r => r.AddAsync(It.IsAny<Movement>()))
                .Returns(Task.CompletedTask);
            return this;
        }

        public IMovementReadOnlyRepository BuildReadOnly() => _readMock.Object;
        public IMovementWriteOnlyRepository BuildWriteOnly() => _writeMock.Object;
    }
}
