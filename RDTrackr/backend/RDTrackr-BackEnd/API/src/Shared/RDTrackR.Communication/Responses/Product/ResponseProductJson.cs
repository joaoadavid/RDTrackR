using RDTrackR.Communication.Responses.StockItem;

namespace RDTrackR.Communication.Responses.Product
{
    public class ResponseProductJson
    {
        public long Id { get; set; }
        public string Sku { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Category { get; set; } = null!;
        public string UoM { get; set; } = null!;
        public decimal Price { get; set; }
        public int TotalStock { get; set; }
        public int ReorderPoint { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool Active { get; set; }
        public long CreatedByUserId { get; set; }
        public long WarehouseId { get; set; }
        public string? CreatedByName { get; set; }

        public List<ResponseStockItemJson> StockItems { get; set; } = new();
    }

}
