namespace RDTrackR.Communication.Requests.User
{
    public class RequestRegisterUserJson
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;

        public long OrganizationId { get; set; }
        public string Role { get; set; } = "User";
    }

}
