using RDTrackR.Communication.Responses.Token;

namespace RDTrackR.Communication.Responses.User
{
    public class ResponseRegisterUserJson
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string OrganizationName { get; set; } = string.Empty;
        public long OrganizationId { get; set; }

        public ResponseTokensJson Tokens { get; set; } = default!;
    }
}
