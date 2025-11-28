using Moq;
using RDTrackR.Domain.Repositories;

namespace CommonTestUtilities.Repositories
{
    public static class UnitOfWorkBuilder
    {
        public static IUnitOfWork Build()
        {
            var mock = new Mock<IUnitOfWork>();
            mock.Setup(u => u.Commit()).Returns(Task.CompletedTask);
            return mock.Object;
        }

        public static UnitOfWorkMock BuildWithCommitVerification()
        {
            var mock = new Mock<IUnitOfWork>();

            var wrapper = new UnitOfWorkMock(mock);

            mock.Setup(u => u.Commit())
                .Callback(() => wrapper.CommitCalled = true)
                .Returns(Task.CompletedTask);

            wrapper.Instance = mock.Object;

            return wrapper;
        }
    }

    // Wrapper usado nos testes para verificar o Commit()
    public class UnitOfWorkMock
    {
        public IUnitOfWork Instance { get; set; } = null!;

        public bool CommitCalled { get; set; } = false;

        internal Mock<IUnitOfWork> OriginalMock { get; }

        public UnitOfWorkMock(Mock<IUnitOfWork> mock)
        {
            OriginalMock = mock;
        }
    }
}
