using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using RDTrackR.Communication.Responses.Error;
using RDTrackR.Domain.Repositories.Users;
using RDTrackR.Domain.Security.Tokens;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;
using System.Security.Claims;

namespace RDTrackR.API.Filters
{
    public class AuthenticatedUserFilter : IAsyncAuthorizationFilter
    {
        private readonly IAccessTokenValidator _accessTokenValidator;
        private readonly IUserReadOnlyRepository _repository;
        private readonly string _requiredRoles;
        public AuthenticatedUserFilter(IAccessTokenValidator accessTokenValidator, IUserReadOnlyRepository repository, string roles)
        {
            _accessTokenValidator = accessTokenValidator;
            _repository = repository;
            _requiredRoles = roles;
        }
       
        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            try
            {
                var token = TokenOnRequest(context);

                var userIdentifier = _accessTokenValidator.ValidateAndGetUserIdentifier(token);
                var user = await _repository.GetByIdentifier(userIdentifier);

                if (user == null)
                {
                    throw new UnauthorizedException("User not found");
                }

                var claims = new List<Claim>
                {
                    new Claim("sub", user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Name ?? ""),
                    new Claim(ClaimTypes.Role, user.Role),
                    new Claim("orgId", user.OrganizationId.ToString())
                };


                var identity = new ClaimsIdentity(claims, "Bearer");
                context.HttpContext.User = new ClaimsPrincipal(identity);

                if (!string.IsNullOrWhiteSpace(_requiredRoles))
                {
                    var allowed = _requiredRoles.Split(',').Select(r => r.Trim()).ToList();
                    var userRole = user.Role;

                    if (!allowed.Any(r =>
                            r.Equals(userRole, StringComparison.OrdinalIgnoreCase)))
                    {
                        throw new UnauthorizedException(ResourceMessagesException.USER_WITHOU_PERMISSION_ACCESS_RESOURCE);
                    }

                }
            }
            catch (Exception)
            {
                context.Result = new UnauthorizedObjectResult(
                    new ResponseErrorJson(ResourceMessagesException.NO_TOKEN)
                );
            }
        }
        private static string TokenOnRequest(AuthorizationFilterContext context)
        {
            var authentication = context.HttpContext.Request.Headers.Authorization.ToString();
            if (string.IsNullOrEmpty(authentication))
            {
                throw new UnauthorizedException(ResourceMessagesException.NO_TOKEN);
            }

            return authentication["Bearer ".Length..].Trim();
        }
    }
}

