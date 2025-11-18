namespace RDTrackR.Domain.Entities
{
    public class SupplierProduct : EntityTenantBase
    {
        public long SupplierId { get; set; }
        public Supplier Supplier { get; set; } = null!;

        public long ProductId { get; set; }
        public Product Product { get; set; } = null!;

        public decimal? UnitPrice { get; set; }
        public string? SupplierSKU { get; set; }
    }
}