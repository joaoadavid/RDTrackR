namespace RDTrackR.Communication.Requests.Orders
{
    public class RequestCreateOrderJson
    {
        public string CustomerName { get; set; } = "";
        public List<RequestCreateOrderItemJson> Items { get; set; } = new();
    }
}
