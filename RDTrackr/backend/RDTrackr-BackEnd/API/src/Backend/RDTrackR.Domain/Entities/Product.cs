using RDTrackR.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace RDTrackR.Domain.Entities
{
    public class Product : EntityTenantBase
    {
        public string Sku { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Category { get; set; } = null!;
        public string UoM { get; set; } = null!;
        public decimal Price { get; set; }

        public int ReorderPoint { get; set; }
        public decimal DailyConsumption { get; set; }
        public int LeadTimeDays { get; set; }
        public decimal SafetyStock { get; set; }
        public decimal LastPurchasePrice { get; set; }

        public ItemCriticality Criticality { get; set; } = ItemCriticality.Medium;
        public int InitialStockLevel { get; set; } = 0;

        public DateTime UpdatedAt { get; set; }
        public long CreatedByUserId { get; set; }

        [ForeignKey(nameof(CreatedByUserId))]
        public User CreatedBy { get; set; } = null!;

        public ICollection<StockItem> StockItems { get; set; } = new List<StockItem>();

        [NotMapped]
        public int TotalStock => StockItems.Sum(x => x.Quantity);
    }
}