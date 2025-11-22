namespace RDTrackR.Communication.Requests.PurchaseOrders
{
    public class RequestUpdatePurchaseOrderItemJson
    {
        public long ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
