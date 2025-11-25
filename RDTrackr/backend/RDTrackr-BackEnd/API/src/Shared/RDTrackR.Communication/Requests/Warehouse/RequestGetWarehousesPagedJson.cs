namespace RDTrackR.Communication.Requests.Warehouse
{
    public class RequestGetWarehousesPagedJson
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? Search { get; set; }
    }
}
