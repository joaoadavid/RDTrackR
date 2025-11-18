using Microsoft.EntityFrameworkCore;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Security.Tokens;
using RDTrackR.Domain.Services.LoggedUser;
using RDTrackR.Infrastructure.DataAccess;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace RDTrackR.Infrastructure.Services.LoggedUser
{
    public class LoggedUser : ILoggedUser
    {
        private readonly RDTrackRDbContext _dbContext;
        private readonly ITokenProvider _tokenProvider;
        public LoggedUser(RDTrackRDbContext dbContext, ITokenProvider tokenProvider)
        {
            _dbContext = dbContext;
            _tokenProvider = tokenProvider;
        }
        public async Task<User> User()
        {
            var token = _tokenProvider.Value();

            var tokenHandler = new JwtSecurityTokenHandler();

            var jwtSecurityToken = tokenHandler.ReadJwtToken(token);

            var identifier = jwtSecurityToken.Claims.First(claim => claim.Type == ClaimTypes.Sid).Value;

             var userIdentifier = Guid.Parse(identifier);

            return await _dbContext.Users
                .AsNoTracking()
                .FirstAsync(user => user.UserIdentifier == userIdentifier && user.Active);
        }
    }
}
