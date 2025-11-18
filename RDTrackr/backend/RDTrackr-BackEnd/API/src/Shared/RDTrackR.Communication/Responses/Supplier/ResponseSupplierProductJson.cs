namespace RDTrackR.Communication.Responses.Supplier
{
    public class ResponseSupplierProductJson
    {
        public long ProductId { get; set; }
        public string ProductName { get; set; } = "";
        public string SKU { get; set; } = "";
        public decimal? UnitPrice { get; set; }

    }
}
