namespace RDTrackR.Communication.Requests.Movements
{
    public class RequestGetMovementsPagedJson : RequestGetMovementsJson
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
