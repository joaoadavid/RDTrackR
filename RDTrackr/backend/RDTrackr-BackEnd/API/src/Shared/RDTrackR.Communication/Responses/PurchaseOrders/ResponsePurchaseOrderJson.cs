namespace RDTrackR.Communication.Responses.PurchaseOrders
{
    public class ResponsePurchaseOrderJson
    {
        public long Id { get; set; }
        public string Number { get; set; } = string.Empty;
        public string SupplierName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public long WarehouseId { get; set; }
        public string WarehouseName { get; set; } =string.Empty;
        public DateTime CreatedOn { get; set; }
        public string CreatedByName { get; set; } = string.Empty;
        public List<ResponsePurchaseOrderItemJson> Items { get; set; } = new();
    }
}
