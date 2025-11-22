namespace RDTrackR.Communication.Requests.Supplier
{
    public class RequestUpdateSupplierProductJson
    {
        public long SupplierId { get; set; }
        public long ProductId { get; set; }
        public decimal UnitPrice { get; set; }
        public bool Active { get; set; }
    }
}
