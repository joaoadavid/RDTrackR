using System.Net;

namespace RDTrackR.Exceptions.ExceptionBase
{
    public class ForbiddenException : RDTrackRException
    {
        public ForbiddenException(string message) : base(message)
        {
        }

        public override IList<string> GetErrorMessages() => [Message];

        public override HttpStatusCode GetStatusCode() => HttpStatusCode.Forbidden;
    }
}
