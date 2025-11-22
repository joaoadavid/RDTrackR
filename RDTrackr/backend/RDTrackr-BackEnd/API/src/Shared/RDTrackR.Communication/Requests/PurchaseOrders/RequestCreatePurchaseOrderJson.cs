namespace RDTrackR.Communication.Requests.PurchaseOrders
{
    public class RequestCreatePurchaseOrderJson
    {
        public string Number { get; set; } = null!;
        public long SupplierId { get; set; }
        public long WarehouseId { get; set; }
        public List<RequestCreatePurchaseOrderItemJson> Items { get; set; } = new();
    }

}
