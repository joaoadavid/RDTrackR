namespace RDTrackR.Communication.Responses.Replenishment
{
    public class ResponseReplenishmentItemJson
    {
        public long ProductId { get; set; }
        public string Sku { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Uom { get; set; } = string.Empty!;
        public decimal CurrentStock { get; set; }
        public decimal ReorderPoint { get; set; }
        public decimal DailyConsumption { get; set; }
        public int LeadTimeDays { get; set; }
        public decimal SuggestedQty { get; set; }
        public bool IsCritical { get; set; }
        public decimal UnitPrice { get; set; }
        public long WarehouseId { get; set; }
        public string WarehouseName { get; set; } = string.Empty;

    }
}
