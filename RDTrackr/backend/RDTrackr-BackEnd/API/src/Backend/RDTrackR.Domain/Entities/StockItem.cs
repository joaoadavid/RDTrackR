using System.ComponentModel.DataAnnotations.Schema;

namespace RDTrackR.Domain.Entities
{
    public class StockItem : EntityTenantBase
    {
        public long ProductId { get; set; }
        public Product Product { get; set; } = null!;

        public long WarehouseId { get; set; }
        public Warehouse Warehouse { get; set; } = null!;

        public int Quantity { get; set; }

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;


        public long CreatedByUserId { get; set; }

        [ForeignKey(nameof(CreatedByUserId))]
        public User CreatedBy { get; set; } = null!;

    }
}
