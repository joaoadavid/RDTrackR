using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace RDTrackR.Infrastructure.Services.Notifications
{

    public class CustomUserIdProvider : IUserIdProvider
    {
        public string? GetUserId(HubConnectionContext connection)
        {
            return connection.User?.FindFirst(ClaimTypes.Sid)?.Value;
        }
    }


}
