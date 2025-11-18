using AutoMapper;
using MyRecipeBook.Application.UseCases.User.Register;
using MyRecipeBook.Domain.Repositories.Token;
using MyRecipeBook.Domain.Security.Tokens.Refresh;
using RDTrackR.Application.UseCases.User.Validators;
using RDTrackR.Communication.Requests.User;
using RDTrackR.Communication.Responses.Token;
using RDTrackR.Communication.Responses.User;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Extensions;
using RDTrackR.Domain.Repositories;
using RDTrackR.Domain.Repositories.Users;
using RDTrackR.Domain.Security.Cryptography;
using RDTrackR.Domain.Security.Tokens;
using RDTrackR.Domain.ValueObjects;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;

namespace RDTrackR.Application.UseCases.User.Register
{
    public class RegisterUserUseCase : IRegisterUserUseCase
    {
        private readonly IUserWriteOnlyRepository _writeOnlyRepository;
        private readonly IUserReadOnlyRepository _readOnlyRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IAccessTokenGenerator _accessTokenGenerator;
        private readonly IPasswordEncripter _passwordEncripter;
        private readonly ITokenRepository _tokenRepository;
        private readonly IRefreshTokenGenerator _refreshTokenGenerator;

        public RegisterUserUseCase(
            IUserWriteOnlyRepository writeOnlyRepository,
            IUserReadOnlyRepository readOnlyRepository,
            IUnitOfWork unitOfWork,
            IPasswordEncripter passwordEncripter,
            IAccessTokenGenerator accessTokenGenerator,
            IMapper mapper,
            ITokenRepository tokenRepository,
            IRefreshTokenGenerator refreshTokenGenerator)
        {
            _writeOnlyRepository = writeOnlyRepository;
            _readOnlyRepository = readOnlyRepository;
            _mapper = mapper;
            _passwordEncripter = passwordEncripter;
            _unitOfWork = unitOfWork;
            _accessTokenGenerator = accessTokenGenerator;
            _refreshTokenGenerator = refreshTokenGenerator;
            _tokenRepository = tokenRepository;
        }

        public async Task<ResponseRegisterUserJson> Execute(RequestRegisterUserJson request)
        {
            await Validate(request);

            var user = _mapper.Map<Domain.Entities.User>(request);
            user.Password = _passwordEncripter.Encrypt(request.Password);
            user.OrganizationId = request.OrganizationId;

            await _writeOnlyRepository.Add(user);
            await _unitOfWork.Commit();

            var tokenId = Guid.NewGuid().ToString();

            var accessToken = _accessTokenGenerator.GenerateWithTokenId(user, tokenId);

            var refreshToken = await CreateAndSaveRefreshToken(user, tokenId);

            return new ResponseRegisterUserJson
            {
                Name = user.Name,
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
            var refreshToken = new RefreshToken
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

        private async Task Validate(RequestRegisterUserJson request)
        {
            var validator = new RegisterUserValidator();
            var result = await validator.ValidateAsync(request);

            var emailExist = await _readOnlyRepository.ExistsActiveUserWithEmail(request.Email);
            if (emailExist)
                result.Errors.Add(new FluentValidation.Results.ValidationFailure(string.Empty, ResourceMessagesException.EMAIL_ALREADY_REGISTERED));

            if (result.IsValid.IsFalse())
            {
                var errorMessages = result.Errors.Select(e => e.ErrorMessage).ToList();
                throw new ErrorOnValidationException(errorMessages);
            }
        }
    }
}
