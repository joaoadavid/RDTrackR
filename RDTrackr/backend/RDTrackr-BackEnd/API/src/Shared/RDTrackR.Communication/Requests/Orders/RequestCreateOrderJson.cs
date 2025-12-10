namespace RDTrackR.Communication.Requests.Orders
{
    public class RequestCreateOrderJson
    {
        public string CustomerName { get; set; } = "";
        public long WarehouseId { get; set; }
        public List<RequestCreateOrderItemJson> Items { get; set; } = new();
    }
}
