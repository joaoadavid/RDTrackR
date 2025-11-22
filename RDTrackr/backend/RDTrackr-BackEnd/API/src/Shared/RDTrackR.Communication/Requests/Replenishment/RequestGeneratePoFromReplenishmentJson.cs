namespace RDTrackR.Communication.Requests.Replenishment
{
    public class RequestGeneratePoFromReplenishmentJson
    {
        public long SupplierId { get; set; }
        public long WarehouseId { get; set; }
        public string? Notes { get; set; }
        public List<ReplenishmentPoItemJson> Items { get; set; } = new();
    }
}
