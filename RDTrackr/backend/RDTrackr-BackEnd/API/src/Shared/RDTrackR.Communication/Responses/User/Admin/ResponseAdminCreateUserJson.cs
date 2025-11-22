namespace RDTrackR.Communication.Responses.User.Admin
{
    public class ResponseAdminCreateUserJson
    {
        public long Id { get; set; }
        public string Name { get; set; } = "";
        public string Email { get; set; } = "";
        public string Role { get; set; } = "user";
        public bool Active { get; set; }
    }
}
