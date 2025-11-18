using RDTrackR.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace RDTrackR.Domain.Entities
{
    public class Movement : EntityTenantBase
    {
        public string Reference { get; set; } = null!;
        public long ProductId { get; set; }
        public Product Product { get; set; } = null!;
        public long WarehouseId { get; set; }
        public Warehouse Warehouse { get; set; } = null!;
        public MovementType Type { get; set; }
        public decimal Quantity { get; set; }
        public DateTime CreatedAt { get; set; }

        public long CreatedByUserId { get; set; }

        [ForeignKey(nameof(CreatedByUserId))]
        public User CreatedBy { get; set; } = null!;
    }

}
