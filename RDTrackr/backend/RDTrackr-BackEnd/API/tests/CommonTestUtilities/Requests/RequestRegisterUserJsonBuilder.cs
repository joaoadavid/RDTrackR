using Bogus;
using RDTrackR.Communication.Requests.User;

namespace CommonTestUtilities.Requests
{
    public static class RequestRegisterUserJsonBuilder
    {
        public static RequestRegisterUserJson Build(int passwordLenght = 10)
        {
            return new Faker<RequestRegisterUserJson>()
                .RuleFor(user => user.Name, (f) => f.Person.FirstName)
                .RuleFor(user => user.Email, (f, u) => f.Internet.Email(u.Name))//U é uma instancia de RequestRegisterUserJson
                .RuleFor(user => user.Password, (f) => f.Internet.Password(passwordLenght))
                .RuleFor(user => user.OrganizationId, () => 1);
        }
    }
}
