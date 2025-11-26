using CommonTestUtilities.Entities;
using CommonTestUtilities.Tokens;
using Shouldly;
using System.Net;
using System.Text.Json;

namespace WebApi.Test.Product.GetAll
{
    public class GetAllProductTest : RDTrackRClassFixture
    {

        private const string METHOD = "product";
        private readonly RDTrackR.Domain.Entities.User _userIdentifier;
        private readonly long _productId;
        private readonly string _productName;

        public GetAllProductTest(CustomWebApplicationFactory factory) : base(factory)
        {
            _userIdentifier = factory.GetUser();
            _productId = factory.GetProductId();
            _productName = factory.GetProductName();
        }

        [Fact]
        public async Task Success()
        {
            var token = JwtTokenGeneratorBuilder.Build().Generate(_userIdentifier);

            var response = await DoGet(method:METHOD, token: token);

            response.StatusCode.ShouldBe(HttpStatusCode.OK);

            await using var responseBody = await response.Content.ReadAsStreamAsync();

            var responseData = await JsonDocument.ParseAsync(responseBody);

            var bodyString = await response.Content.ReadAsStringAsync();

            var firstProduct = responseData
                .RootElement
                .GetProperty("items")
                .EnumerateArray()
                .First();

            var name = firstProduct.GetProperty("name").GetString();

            name.ShouldBe(_productName);
        }
    }
}
