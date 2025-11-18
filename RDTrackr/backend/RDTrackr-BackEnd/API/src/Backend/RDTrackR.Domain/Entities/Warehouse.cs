using System.ComponentModel.DataAnnotations.Schema;

namespace RDTrackR.Domain.Entities
{
    public class Warehouse : EntityTenantBase
    {
        public string Name { get; set; } = null!;
        public string Location { get; set; } = null!;
        public int Capacity { get; set; }
        public int Items { get; set; }
        public decimal Utilization { get; set; }

        public long CreatedByUserId { get; set; }
        [ForeignKey(nameof(CreatedByUserId))]
        public User CreatedBy { get; set; } = null!;

        public long? UpdatedByUserId { get; set; }
        [ForeignKey(nameof(UpdatedByUserId))]
        public User? UpdatedBy { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public ICollection<StockItem> StockItems { get; set; } = new List<StockItem>();
    }
}
