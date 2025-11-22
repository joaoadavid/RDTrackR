using RDTrackR.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace RDTrackR.Domain.Entities
{
    public class Order : EntityTenantBase
    {
        public string OrderNumber { get; set; } = "";
        public long CustomerId { get; set; }
        public string CustomerName { get; set; } = "";

        public OrderStatus Status { get; set; } = OrderStatus.PENDING;

        public decimal Total { get; set; }

        public List<OrderItem> Items { get; set; } = new();

        public long CreatedByUserId { get; set; }

        [ForeignKey(nameof(CreatedByUserId))]
        public User CreatedBy { get; set; } = null!;
    }
}
