namespace RDTrackR.Communication.Responses.User.Admin
{
    public class ResponseUserListItemJson
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool Active { get; set; }
        public DateTime CreatedOn { get; set; }
    }

}
