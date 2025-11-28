using Bogus;
using RDTrackR.Communication.Requests.Orders;

namespace CommonTestUtilities.Requests.Orders
{
    public static class RequestCreateOrderJsonBuilder
    {
        public static RequestCreateOrderJson Build()
        {
            return new Faker<RequestCreateOrderJson>()
                .RuleFor(x => x.CustomerName, f => f.Name.FullName())
                .RuleFor(x => x.Items, f => new List<RequestCreateOrderItemJson>
                {
                    new RequestCreateOrderItemJson
                    {
                        ProductId = f.Random.Long(1, 100),
                        Quantity = f.Random.Int(1, 10),
                        Price = f.Random.Decimal(10, 100)
                    }
                });
        }
    }
}
