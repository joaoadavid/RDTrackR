namespace RDTrackR.Communication.Requests.Replenishment
{
    public class ReplenishmentPoItemJson
    {
        public long ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
