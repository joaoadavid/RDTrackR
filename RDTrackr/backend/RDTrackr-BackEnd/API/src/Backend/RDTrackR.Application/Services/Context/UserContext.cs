using Microsoft.AspNetCore.Http;
using RDTrackR.Domain.Context;
using System.Security.Claims;

namespace RDTrackR.Application.Services.Context
{
    public class UserContext : IUserContext
    {
        private readonly IHttpContextAccessor _http;

        public UserContext(IHttpContextAccessor http)
        {
            _http = http;
        }

        public long UserId => long.Parse(_http.HttpContext!.User.FindFirst("sub")!.Value);

        public string UserName =>
            _http.HttpContext!.User.FindFirst(ClaimTypes.Name)!.Value;

        public string Role =>
            _http.HttpContext!.User.FindFirst(ClaimTypes.Role)!.Value;

        public long OrganizationId => long.Parse(_http.HttpContext!.User.FindFirst("orgId")!.Value);
    }
}
