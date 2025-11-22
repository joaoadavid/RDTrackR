namespace RDTrackR.Communication.Responses.PurchaseOrders
{
    public class ResponsePurchaseOrderItemJson
    {
        public string ProductName { get; set; } = null!;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
