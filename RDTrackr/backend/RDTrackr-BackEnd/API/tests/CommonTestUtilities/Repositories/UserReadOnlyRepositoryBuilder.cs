using Moq;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories.Users;

namespace CommonTestUtilities.Repositories
{
    public class UserReadOnlyRepositoryBuilder
    {
        private readonly Mock<IUserReadOnlyRepository> _userReadOnlyRepositoryMock;
        public UserReadOnlyRepositoryBuilder()
        {
                _userReadOnlyRepositoryMock = new Mock<IUserReadOnlyRepository>();
        }

        public void ExistActiveUserWithEmail(string email)
        {
            _userReadOnlyRepositoryMock.Setup(repository => repository.ExistsActiveUserWithEmail(email)).ReturnsAsync(true);
        }

        public void GetByEmail(User user)
        {
            _userReadOnlyRepositoryMock.Setup(
                repository => repository.GetByEmail(user.Email)).ReturnsAsync(user);
        }

        public UserReadOnlyRepositoryBuilder GetById(User user)
        {
            _userReadOnlyRepositoryMock.Setup(
                repository => repository.GetUserById(user.Id))
                .ReturnsAsync(user);
            return this;
        }

        public IUserReadOnlyRepository Build()
        {
            return _userReadOnlyRepositoryMock.Object;
        }
    }
}
