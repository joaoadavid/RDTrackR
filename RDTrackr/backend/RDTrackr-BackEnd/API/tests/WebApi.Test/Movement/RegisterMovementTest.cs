using CommonTestUtilities.Entities;
using CommonTestUtilities.Requests.Movements;
using CommonTestUtilities.Tokens;
using RDTrackR.Exceptions;
using Shouldly;
using System.Globalization;
using System.Net;
using System.Text.Json;
using WebApi.Test.InlineData;

namespace WebApi.Test.Movement
{
    public class RegisterMovementTest : RDTrackRClassFixture
    {
        private const string METHOD = "movement";
        private readonly RDTrackR.Domain.Entities.User _user;
        private readonly long _warehouseId;
        private readonly long _productId;
        private readonly string _movement;

        public RegisterMovementTest(CustomWebApplicationFactory factory) : base(factory) 
        {
            _user = factory.GetUser();
            _warehouseId = factory.GetWarehouseId();
            _productId = factory.GetProductId();
            _movement = factory.GetMovementProduct();
        }

        [Fact]
        public async Task Success()
        {
            var request = RequestRegisterMovementJsonBuilder.Build();

            request.ProductId = _productId;
            request.WarehouseId = _warehouseId;
            var token = JwtTokenGeneratorBuilder.Build().Generate(_user);

            var response = await DoPost(method: METHOD, request:request, token:token);

            response.StatusCode.ShouldBe(HttpStatusCode.Created);

            await using var responseBody = await response.Content.ReadAsStreamAsync();

            var responseData = await JsonDocument.ParseAsync(responseBody);

            var title = responseData.RootElement.GetProperty("reference").GetString();
            title.ShouldBe(request.Reference);

            var product = responseData.RootElement.GetProperty("product").GetString();
            product.ShouldNotBeNullOrWhiteSpace();
        }

        [Theory]
        [ClassData(typeof(CultureInlineDataTest))]
        public async Task Error_Title_Empty(string culture)
        {
            var request = RequestRegisterMovementJsonBuilder.Build();
            request.ProductId = _productId;
            request.WarehouseId = _warehouseId;
            request.Reference = string.Empty;

            var token = JwtTokenGeneratorBuilder.Build().Generate(_user);

            var response = await DoPost(method: METHOD, request: request, token: token, culture: culture);

            response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);

            await using var responseBody = await response.Content.ReadAsStreamAsync();

            var responseData = await JsonDocument.ParseAsync(responseBody);

            var errors = responseData.RootElement.GetProperty("errors").EnumerateArray();

            var expectedMessage = ResourceMessagesException.ResourceManager.GetString
                ("MOVEMENT_REFERENCE_REQUIRED",
                new CultureInfo(culture));

            errors.ShouldHaveSingleItem();
            errors.ShouldContain(error => error.GetString()!.Equals(expectedMessage));
        }
    }
}
