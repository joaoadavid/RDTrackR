using RDTrackR.Communication.Enums;

namespace RDTrackR.Communication.Responses.Orders
{
    public class ResponseOrderJson
    {
        public long Id { get; set; }
        public string OrderNumber { get; set; } = "";
        public string CustomerName { get; set; } = "";
        public decimal Total { get; set; }
        public OrderStatus Status { get; set; }
        public DateTime CreatedOn { get; set; }
        public List<ResponseOrderItemJson> Items { get; set; } = new();
    }
}
