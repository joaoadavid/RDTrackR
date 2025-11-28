namespace RDTrackR.Communication.Responses.StockItem
{
    public class ResponseStockItemJson
    {
        public long Id { get; set; }
        public string ProductName { get; set; } = null!;
        public string WarehouseName { get; set; } = null!;
        public int Quantity { get; set; }
        public DateTime UpdatedAt { get; set; }
        public long ProductId { get; set; }

        public long CreatedByUserId { get; set; }
        public string? CreatedByName { get; set; }
    }
}
