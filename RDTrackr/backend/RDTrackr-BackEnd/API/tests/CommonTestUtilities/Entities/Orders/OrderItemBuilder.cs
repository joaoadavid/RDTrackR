using Bogus;
using RDTrackR.Domain.Entities;

namespace CommonTestUtilities.Entities.Orders
{
    public static class OrderItemBuilder
    {
        public static OrderItem Build(User user, long productId)
        {
            return new Faker<OrderItem>()
                .RuleFor(i => i.ProductId, _ => productId)
                .RuleFor(i => i.Quantity, f => f.Random.Int(1, 5))
                .RuleFor(i => i.Price, f => f.Random.Decimal(10, 100))
                .RuleFor(i => i.ProductName, f => f.Commerce.ProductName())
                .RuleFor(i => i.OrganizationId, _ => user.OrganizationId)
                .Generate();
        }
    }
}
