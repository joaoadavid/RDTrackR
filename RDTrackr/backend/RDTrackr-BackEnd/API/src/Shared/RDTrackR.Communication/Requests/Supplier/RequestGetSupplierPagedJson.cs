namespace RDTrackR.Communication.Requests.Supplier
{
    public class RequestGetSuppliersPagedJson
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? Search { get; set; }
    }
}
