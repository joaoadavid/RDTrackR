using Bogus;
using RDTrackR.Communication.Requests.PurchaseOrders;

namespace CommonTestUtilities.Requests.PurchaseOrder
{
    public static class RequestUpdatePurchaseOrderItemsJsonBuilder
    {
        public static RequestUpdatePurchaseOrderItemsJson Build()
        {
            return new Faker<RequestUpdatePurchaseOrderItemsJson>()
                .RuleFor(p => p.Items, f => f.Make(2, () => new RequestUpdatePurchaseOrderItemJson
                {
                    ProductId = f.Random.Long(1, 100),
                    Quantity = f.Random.Int(1, 20),
                    UnitPrice = f.Random.Decimal(5, 500)
                }))
                .Generate();
        }
    }
}
