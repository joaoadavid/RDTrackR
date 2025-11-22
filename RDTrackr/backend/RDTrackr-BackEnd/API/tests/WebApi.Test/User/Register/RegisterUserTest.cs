using CommonTestUtilities.Requests;
using CommonTestUtilities.Tokens;
using RDTrackR.Exceptions;
using Shouldly;
using System.Net;
using System.Text.Json;
using WebApi.Test.InlineData;

namespace WebApi.Test.User.Register
{
    public class RegisterUserTest: RDTrackRClassFixture
    {
        private readonly string method = "user";
        private readonly RDTrackR.Domain.Entities.User _userIdentifier;

        public RegisterUserTest(CustomWebApplicationFactory factory) : base(factory) 
        {
            _userIdentifier = factory.GetUser();
        }        

        [Fact]
        public async Task Success()
        {
            var token = JwtTokenGeneratorBuilder.Build().Generate(_userIdentifier);

            var request = RequestRegisterUserJsonBuilder.Build();

            var response = await DoPost(method: method, request: request, token:token);

            response.StatusCode.ShouldBe(HttpStatusCode.Created);

            await using var responseBody = await response.Content.ReadAsStreamAsync();

            var responseData = await JsonDocument.ParseAsync(responseBody);

            var name = responseData.RootElement.GetProperty("name").GetString();
            name.ShouldNotBeNullOrWhiteSpace();
            name.ShouldBe(request.Name);

            var tokens = responseData.RootElement.GetProperty("tokens").GetProperty("accessToken").GetString();
            tokens.ShouldNotBeNullOrEmpty();
        }

        [Theory]
        [ClassData(typeof(CultureInlineDataTest))]
        public async Task Error_Empty_Name(string culture)
        {
            var token = JwtTokenGeneratorBuilder.Build().Generate(_userIdentifier);

            var request = RequestRegisterUserJsonBuilder.Build();
            request.Name = string.Empty;

            var response = await DoPost(method: method, request: request, culture: culture, token:token);

            response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);

            await using var responseBody = await response.Content.ReadAsStreamAsync();

            var responseData = await JsonDocument.ParseAsync(responseBody);

            var errors = responseData.RootElement.GetProperty("errors").EnumerateArray();

            var expectedMessage = ResourceMessagesException.ResourceManager.GetString
                ("NAME_EMPTY",
                new System.Globalization.CultureInfo(culture));

            errors.ShouldHaveSingleItem();
            errors.ShouldContain(error => error.GetString()!.Equals(expectedMessage));
        }

       
    }
}
