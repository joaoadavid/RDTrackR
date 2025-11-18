using AutoMapper;
using MyRecipeBook.Domain.Repositories.Token;
using MyRecipeBook.Domain.Security.Tokens.Refresh;
using RDTrackR.Communication.Requests.Organization;
using RDTrackR.Communication.Responses.Organization;
using RDTrackR.Communication.Responses.Token;
using RDTrackR.Communication.Responses.User;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories;
using RDTrackR.Domain.Repositories.Organization;
using RDTrackR.Domain.Repositories.Users;
using RDTrackR.Domain.Security.Cryptography;
using RDTrackR.Domain.Security.Tokens;
using RDTrackR.Exceptions.ExceptionBase;

namespace RDTrackR.Application.UseCases.Organizations
{
    public class RegisterOrganizationUseCase : IRegisterOrganizationUseCase
    {
        private readonly IOrganizationWriteOnlyRepository _orgRepo;
        private readonly IUserWriteOnlyRepository _userRepo;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPasswordEncripter _passwordEncripter;
        private readonly IAccessTokenGenerator _tokenGenerator;
        private readonly IRefreshTokenGenerator _refreshTokenGenerator;
        private readonly ITokenRepository _tokenRepository;

        public RegisterOrganizationUseCase(
            IOrganizationWriteOnlyRepository orgRepo,
            IUserWriteOnlyRepository userRepo,
            IUnitOfWork unitOfWork,
            IPasswordEncripter passwordEncripter,
            IAccessTokenGenerator tokenGenerator,
            IRefreshTokenGenerator refreshTokenGenerator,
            ITokenRepository tokenRepository)
        {
            _orgRepo = orgRepo;
            _userRepo = userRepo;
            _unitOfWork = unitOfWork;
            _passwordEncripter = passwordEncripter;
            _tokenGenerator = tokenGenerator;
            _refreshTokenGenerator = refreshTokenGenerator;
            _tokenRepository = tokenRepository;
        }

        public async Task<ResponseRegisterOrganizationJson> Execute(RequestRegisterOrganizationJson request)
        {
            // 1) Criar Organização
            var org = new Organization
            {
                Name = request.Name
            };

            await _orgRepo.AddAsync(org);
            await _unitOfWork.Commit();

            // 2) Criar usuário Admin
            var admin = new RDTrackR.Domain.Entities.User
            {
                Name = request.AdminName,
                Email = request.AdminEmail,
                Password = _passwordEncripter.Encrypt(request.AdminPassword),
                Role = "Admin",
                OrganizationId = org.Id
            };

            await _userRepo.Add(admin);
            await _unitOfWork.Commit();

            // 3) Gerar tokens
            var tokenId = Guid.NewGuid().ToString();
            var accessToken = _tokenGenerator.GenerateWithTokenId(
                admin, tokenId);

            var refreshToken = new RefreshToken
            {
                Value = _refreshTokenGenerator.Generate(),
                UserId = admin.Id,
                TokenId = tokenId,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(30)
            };

            await _tokenRepository.SaveNewRefreshToken(refreshToken);
            await _unitOfWork.Commit();

            return new ResponseRegisterOrganizationJson
            {
                OrganizationId = org.Id,
                OrganizationName = org.Name,
                AdminUser = new ResponseRegisterUserJson
                {
                    Name = admin.Name,
                    Role = admin.Role,
                    OrganizationId = org.Id,
                    Tokens = new ResponseTokensJson
                    {
                        AccessToken = accessToken,
                        RefreshToken = refreshToken.Value,
                        TokenId = tokenId
                    }
                }
            };
        }
        private async Task Validate(RequestRegisterOrganizationJson request)
        {
            var validator = new OrganizationValidator();
            var result = await validator.ValidateAsync(request);

            if (!result.IsValid)
                throw new ErrorOnValidationException(
                    result.Errors.Select(e => e.ErrorMessage).Distinct().ToList()
                );
        }
    }
}
