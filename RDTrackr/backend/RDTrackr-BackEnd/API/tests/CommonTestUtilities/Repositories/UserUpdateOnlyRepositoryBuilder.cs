using Moq;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories.Users;

namespace CommonTestUtilities.Repositories
{
    public class UserUpdateOnlyRepositoryBuilder
    {
        private readonly Mock<IUserUpdateOnlyRepository> _userUpdateOnlyRepositoryMock;

        public UserUpdateOnlyRepositoryBuilder()
        {
            _userUpdateOnlyRepositoryMock = new Mock<IUserUpdateOnlyRepository>();
        }

        public UserUpdateOnlyRepositoryBuilder Update(User user)
        {
            _userUpdateOnlyRepositoryMock
                .Setup(repository => repository.Update(It.Is<User>(u => u.Id == user.Id)))
                .Returns(Task.CompletedTask);

            return this;
        }

        public IUserUpdateOnlyRepository Build()
        {
            return _userUpdateOnlyRepositoryMock.Object;
        }

        public Mock<IUserUpdateOnlyRepository> BuildMock()
        {
            return _userUpdateOnlyRepositoryMock;
        }
    }
}
