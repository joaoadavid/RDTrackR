using Bogus;
using CommonTestUtilities.Cryptography;
using RDTrackR.Domain.Entities;

namespace CommonTestUtilities.Entities
{
    public static class UserBuilder
    {
        public static (User user, string password) Build()
        {
            var passwordEncripter = PasswordEncripterBuilder.Build();
            var faker = new Faker();

            var password = faker.Internet.Password();

            // Criando organização para evitar NullReference
            var organization = new Organization
            {
                Id = 1,
                Name = "Organization"
            };

            var user = new Faker<User>()
                .RuleFor(u => u.Id, _ => 1)
                .RuleFor(u => u.Name, f => f.Person.FirstName)
                .RuleFor(u => u.Email, (f, u) => f.Internet.Email(u.Name))
                .RuleFor(u => u.UserIdentifier, _ => Guid.NewGuid())
                .RuleFor(u => u.Password, _ => passwordEncripter.Encrypt(password))
                .RuleFor(u => u.OrganizationId, _ => organization.Id)
                .RuleFor(u => u.Organization, _ => organization)
                .RuleFor(u => u.Role, _ => "Admin")
                .Generate();

            return (user, password);
        }
    }
}
