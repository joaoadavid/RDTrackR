namespace RDTrackR.Communication.Requests.Supplier
{
    public class RequestRegisterSupplierProductJson
    {
        public long SupplierId { get; set; }
        public long ProductId { get; set; }
        public decimal? UnitPrice { get; set; }
        public string SupplierSKU { get; set; } = string.Empty;
    }

}
