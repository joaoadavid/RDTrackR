using MyRecipeBook.Domain.Repositories.Token;
using MyRecipeBook.Domain.Security.Tokens.Refresh;
using RDTrackR.Communication.Requests.Token;
using RDTrackR.Communication.Responses.Token;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories;
using RDTrackR.Domain.Security.Tokens;
using RDTrackR.Domain.ValueObjects;
using RDTrackR.Exceptions.ExceptionBase.Token;

namespace MyRecipeBook.Application.UseCases.Token
{
    public class UseRefreshTokenUseCase : IUseRefreshTokenUseCase
    {
        private readonly ITokenRepository _tokenRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAccessTokenGenerator _accessTokenGenerator;
        private readonly IRefreshTokenGenerator _refreshTokenGenerator;

        public UseRefreshTokenUseCase(
            ITokenRepository tokenRepository,
            IUnitOfWork unitOfWork,
            IAccessTokenGenerator accessTokenGenerator,
            IRefreshTokenGenerator refreshTokenGenerator)
        {
            _tokenRepository = tokenRepository;
            _unitOfWork = unitOfWork;
            _accessTokenGenerator = accessTokenGenerator;
            _refreshTokenGenerator = refreshTokenGenerator;
        }

        public async Task<ResponseTokensJson> Execute(RequestNewTokenJson request)
        {

            var refreshToken = await _tokenRepository.Get(request.RefreshToken);

            if (refreshToken is null || refreshToken.IsRevoked)
                throw new RefreshTokenExpiredException();

            if (refreshToken.IsRevoked)
                throw new RefreshTokenExpiredException();

            if (refreshToken is null)
                throw new RefreshTokenNotFoundException();

            var refreshTokenInvalidUntil = refreshToken.CreatedOn.AddDays(MyRecipeBookRuleConstants.REFRESH_TOKEN_EXPIRATION_DAYS);
            if (DateTime.Compare(refreshTokenInvalidUntil, DateTime.UtcNow) < 0)
                throw new RefreshTokenExpiredException();

            if (!string.IsNullOrEmpty(request.TokenId) && refreshToken.TokenId != request.TokenId)
                throw new RefreshTokenExpiredException();

            var newTokenId = Guid.NewGuid().ToString();

            var newRefreshToken = new RefreshToken
            {
                Value = _refreshTokenGenerator.Generate(),
                UserId = refreshToken.UserId,
                TokenId = newTokenId,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(MyRecipeBookRuleConstants.REFRESH_TOKEN_EXPIRATION_DAYS)
            };

            await _tokenRepository.SaveNewRefreshToken(newRefreshToken);
            await _unitOfWork.Commit();

            var newAccessToken = _accessTokenGenerator.GenerateWithTokenId(refreshToken.User, newTokenId);

            return new ResponseTokensJson
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken.Value
            };
        }
    }
}
