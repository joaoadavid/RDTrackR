using Microsoft.AspNetCore.Mvc;
using RDTrackR.API.Filters;

namespace RDTrackR.API.Attributes
{
    public class AuthenticatedUserAttribute : TypeFilterAttribute
    {
        public AuthenticatedUserAttribute(string roles = "")
            : base(typeof(AuthenticatedUserFilter))
        {
            Arguments = new object[] { roles };
        }
    }
}
