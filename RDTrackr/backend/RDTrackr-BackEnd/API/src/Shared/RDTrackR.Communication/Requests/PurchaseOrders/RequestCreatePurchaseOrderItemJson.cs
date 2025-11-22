namespace RDTrackR.Communication.Requests.PurchaseOrders
{
    public class RequestCreatePurchaseOrderItemJson
    {
        public long ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
