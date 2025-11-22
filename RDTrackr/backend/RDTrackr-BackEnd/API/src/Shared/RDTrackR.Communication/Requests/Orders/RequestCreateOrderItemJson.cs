namespace RDTrackR.Communication.Requests.Orders
{
    public class RequestCreateOrderItemJson
    {
        public long ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}
