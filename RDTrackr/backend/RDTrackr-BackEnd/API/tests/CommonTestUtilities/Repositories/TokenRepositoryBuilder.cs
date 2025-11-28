using Moq;
using MyRecipeBook.Domain.Repositories.Token;
using RDTrackR.Domain.Entities;

namespace CommonTestUtilities.Repositories
{
    public class TokenRepositoryBuilder
    {
        private readonly Mock<ITokenRepository> _repository = new();
        private readonly List<RefreshToken> _tokens = new();

        public TokenRepositoryBuilder WithToken(RefreshToken token)
        {
            _tokens.Add(token);
            return this;
        }

        public ITokenRepository Build()
        {
            _repository
                .Setup(r => r.Get(It.IsAny<string>()))
                .ReturnsAsync((string refreshToken) =>
                {
                    return _tokens.FirstOrDefault(t => t.Value == refreshToken);
                });

            _repository
                .Setup(r => r.GetByTokenId(It.IsAny<string>()))
                .ReturnsAsync((string tokenId) =>
                {
                    return _tokens.FirstOrDefault(t => t.TokenId == tokenId && t.IsRevoked == false);
                });

            _repository
                .Setup(r => r.RevokeAllUserTokens(It.IsAny<long>()))
                .Returns<long>(userId =>
                {
                    foreach (var token in _tokens.Where(t => t.UserId == userId))
                        token.IsRevoked = true;

                    return Task.CompletedTask;
                });

             _repository
                .Setup(r => r.RevokeToken(It.IsAny<string>()))
                .Callback((string tokenValue) =>
                {
                    var token = _tokens.FirstOrDefault(t => t.Value == tokenValue);
                    if (token != null)
                        token.IsRevoked = true;
                })
                .Returns(Task.CompletedTask);

            return _repository.Object;
        }
    }
}
