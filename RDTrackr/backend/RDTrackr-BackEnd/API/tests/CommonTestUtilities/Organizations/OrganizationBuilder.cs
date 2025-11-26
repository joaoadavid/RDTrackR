using Bogus;
using RDTrackR.Domain.Entities;

namespace CommonTestUtilities.Organizations
{
    public static class OrganizationBuilder
    {
        public static Organization Build(long? id = null)
        {
            var faker = new Faker();

            var organization = new Organization
            {
                Id = id ?? faker.Random.Long(1, 9999),
                Name = faker.Company.CompanyName(),
                CreatedOn = DateTime.UtcNow
            };

            return organization;
        }
    }
}
