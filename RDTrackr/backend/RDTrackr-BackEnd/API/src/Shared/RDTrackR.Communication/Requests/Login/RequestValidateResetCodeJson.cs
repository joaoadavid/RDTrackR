namespace RDTrackR.Communication.Requests.Login
{
    public class RequestValidateResetCodeJson
    {
        public string Email { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
    }
}
