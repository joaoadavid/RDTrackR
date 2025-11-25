namespace RDTrackR.Communication.Responses.Reports
{
    public class ResponseReportsJson
    {
        public int TotalPurchaseOrders { get; set; }
        public decimal TotalValuePurchased { get; set; }
        public int PendingPurchaseOrders { get; set; }
        public int CancelPurchaseOrders { get; set; }
        public List<ResponseRecentPurchaseOrderJson> RecentOrders { get; set; } = new();
        public List<ResponseTopSupplierJson> TopSuppliers { get; set; } = new();
    }
}
