using RDTrackR.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace RDTrackR.Domain.Entities
{
    public class PurchaseOrder : EntityTenantBase
    {
        public int Number { get; set; }

        public long SupplierId { get; set; }
        public Supplier Supplier { get; set; } = null!;

        public PurchaseOrderStatus Status { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public long CreatedByUserId { get; set; }

        [ForeignKey(nameof(CreatedByUserId))]
        public User CreatedBy { get; set; } = null!;

        public ICollection<PurchaseOrderItem> Items { get; set; } = new List<PurchaseOrderItem>();
    }

}
