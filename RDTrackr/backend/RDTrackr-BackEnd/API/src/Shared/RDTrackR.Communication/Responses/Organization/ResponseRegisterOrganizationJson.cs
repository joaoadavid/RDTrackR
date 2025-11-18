using RDTrackR.Communication.Responses.User;

namespace RDTrackR.Communication.Responses.Organization
{
    public class ResponseRegisterOrganizationJson
    {
        public long OrganizationId { get; set; }
        public string OrganizationName { get; set; } = string.Empty;

        public ResponseRegisterUserJson AdminUser { get; set; } = null!;
    }
}
