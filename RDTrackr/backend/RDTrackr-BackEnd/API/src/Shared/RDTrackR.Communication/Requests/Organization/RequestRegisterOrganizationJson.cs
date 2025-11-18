namespace RDTrackR.Communication.Requests.Organization
{
    public class RequestRegisterOrganizationJson
    {
        public string Name { get; set; } = string.Empty;
        public string AdminName { get; set; } = string.Empty;
        public string AdminEmail { get; set; } = string.Empty;
        public string AdminPassword { get; set; } = string.Empty;
    }

}
