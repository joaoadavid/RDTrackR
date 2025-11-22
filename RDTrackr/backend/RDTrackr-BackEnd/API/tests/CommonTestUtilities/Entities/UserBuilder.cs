using Bogus;
using Bogus.DataSets;
using CommonTestUtilities.Cryptography;
using RDTrackR.Domain.Entities;

namespace CommonTestUtilities.Entities
{
    public static class UserBuilder
    {
        public static (User user,string password) Build()
        {
            var passwordEncripter = PasswordEncripterBuilder.Build();

            var password = new Faker().Internet.Password();
            var user = new Faker<User>()
                .RuleFor(user => user.Id, () => 1)
                .RuleFor(user => user.Name, (f) => f.Person.FirstName)
                .RuleFor(user => user.Email, (f, user) => f.Internet.Email(user.Name))
                .RuleFor(user => user.UserIdentifier, _ => Guid.NewGuid())
                .RuleFor(user => user.Password, (f) => passwordEncripter.Encrypt(password))
                .RuleFor(user => user.OrganizationId, () => 1)
                .RuleFor(u => u.Role, "Admin");


            return (user, password);
        }
    }
}
