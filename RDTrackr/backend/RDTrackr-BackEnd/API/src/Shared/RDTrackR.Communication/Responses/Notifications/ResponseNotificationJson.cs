namespace RDTrackR.Communication.Responses.Notifications
{
    public class ResponseNotificationJson
    {
        public long Id { get; set; }
        public string Message { get; set; } = "";
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
