namespace RDTrackR.Domain.Entities
{
    public class PurchaseOrderItem : EntityTenantBase
    {
        public long PurchaseOrderId { get; set; }
        public PurchaseOrder PurchaseOrder { get; set; } = null!;

        public long ProductId { get; set; }
        public Product Product { get; set; } = null!;

        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
