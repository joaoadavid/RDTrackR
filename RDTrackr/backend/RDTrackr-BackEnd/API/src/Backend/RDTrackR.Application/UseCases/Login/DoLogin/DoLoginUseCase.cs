using MyRecipeBook.Domain.Repositories.Token;
using MyRecipeBook.Domain.Security.Tokens.Refresh;
using RDTrackR.Communication.Requests.Login;
using RDTrackR.Communication.Responses.Token;
using RDTrackR.Communication.Responses.User;
using RDTrackR.Domain.Extensions;
using RDTrackR.Domain.Repositories;
using RDTrackR.Domain.Repositories.Organization;
using RDTrackR.Domain.Repositories.Users;
using RDTrackR.Domain.Security.Cryptography;
using RDTrackR.Domain.Security.Tokens;
using RDTrackR.Domain.ValueObjects;
using RDTrackR.Exceptions.ExceptionBase.Login;

namespace RDTrackR.Application.UseCases.Login.DoLogin
{
    public class DoLoginUseCase : IDoLoginUseCase
    {
        private readonly IUserReadOnlyRepository _repository;
        private readonly IPasswordEncripter _passwordEncripter;
        private readonly IOrganizationReadOnlyRepository _organizationRepository;
        private readonly IAccessTokenGenerator _accessTokenGenerator;
        private readonly IRefreshTokenGenerator _refreshTokenGenerator;
        private readonly ITokenRepository _tokenRepository;
        private readonly IUnitOfWork _unitOfWork;

        public DoLoginUseCase(
            IUserReadOnlyRepository repository,
            IAccessTokenGenerator accessTokenGenerator,
            IPasswordEncripter passwordEncripter,
            IOrganizationReadOnlyRepository organizationRepository,
            IRefreshTokenGenerator refreshTokenGenerator,
            ITokenRepository tokenRepository,
            IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _passwordEncripter = passwordEncripter;
            _organizationRepository = organizationRepository;
            _accessTokenGenerator = accessTokenGenerator;
            _refreshTokenGenerator = refreshTokenGenerator;
            _tokenRepository = tokenRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<ResponseRegisterUserJson> Execute(RequestLoginJson request)
        {
            var user = await _repository.GetByEmail(request.Email);
            var organization = await _organizationRepository.GetByIdAsync(user.OrganizationId);

            if (user is null || _passwordEncripter.IsValid(request.Password, user.Password).IsFalse())
                throw new InvalidLoginException();

            await _tokenRepository.RevokeAllUserTokens(user.Id);

            var tokenId = Guid.NewGuid().ToString();

            var accessToken = _accessTokenGenerator.GenerateWithTokenId(user, tokenId);

            var refreshToken = await CreateAndSaveRefreshToken(user, tokenId);

            return new ResponseRegisterUserJson
            {
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                OrganizationId = user.OrganizationId,
                OrganizationName = organization!.Name,
                Tokens = new ResponseTokensJson
                {
                    AccessToken = accessToken,
                    RefreshToken = refreshToken,
                    TokenId = tokenId
                }
            };
        }

        private async Task<string> CreateAndSaveRefreshToken(Domain.Entities.User user, string tokenId)
        {
            var refreshToken = new Domain.Entities.RefreshToken
            {
                Value = _refreshTokenGenerator.Generate(),
                UserId = user.Id,
                TokenId = tokenId,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(MyRecipeBookRuleConstants.REFRESH_TOKEN_EXPIRATION_DAYS),
                IsRevoked = false
            };

            await _tokenRepository.SaveNewRefreshToken(refreshToken);
            await _unitOfWork.Commit();

            return refreshToken.Value;
        }
    }
}
