using Bogus;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Enums;

namespace CommonTestUtilities.Entities.Orders
{
    public static class OrderBuilder
    {
        public static Order Build(User user, OrderStatus status = OrderStatus.PENDING)
        {
            return new Faker<Order>()
                .RuleFor(o => o.Id, f => f.Random.Long(1, 99999))
                .RuleFor(o => o.CustomerName, f => f.Person.FullName)
                .RuleFor(o => o.OrganizationId, _ => user.OrganizationId)
                .RuleFor(o => o.CreatedByUserId, _ => user.Id)
                .RuleFor(o => o.Status, _ => status)
                .RuleFor(o => o.Items, _ => new List<OrderItem>())
                .Generate();
        }
    }
}
