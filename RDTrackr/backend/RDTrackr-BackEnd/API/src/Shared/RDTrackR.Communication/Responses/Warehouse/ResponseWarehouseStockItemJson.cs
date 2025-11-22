namespace RDTrackR.Communication.Responses.Warehouse
{
    public class ResponseWarehouseStockItemJson
    {
        public long ProductId { get; set; }
        public string Sku { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal ReorderPoint { get; set; }
        public decimal LastPurchasePrice { get; set; }
    }

}
