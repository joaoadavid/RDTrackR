namespace RDTrackR.Communication.Responses.Orders
{
    public class ResponseOrderItemJson
    {
        public long ProductId { get; set; }
        public string ProductName { get; set; } = "";
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}
