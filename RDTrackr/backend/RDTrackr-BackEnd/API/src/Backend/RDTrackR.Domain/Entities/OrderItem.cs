namespace RDTrackR.Domain.Entities
{
    public class OrderItem : EntityTenantBase
    {
        public long ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal Total { get; set; }
        public int Quantity { get; set; }

        public long OrderId { get; set; }
        public Order Order { get; set; } = null!;
    }
}
