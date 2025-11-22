using CommonTestUtilities.Tokens;
using RDTrackR.Exceptions;
using Shouldly;
using System.Globalization;
using System.Net;
using System.Text.Json;
using WebApi.Test.InlineData;

namespace WebApi.Test.Product.Delete
{
    public class DeleteProductTest : RDTrackRClassFixture
    {
        private const string METHOD = "product";

        private readonly RDTrackR.Domain.Entities.User _userIdentifier;
        private readonly long _productId;
        public DeleteProductTest(CustomWebApplicationFactory factory) : base(factory)
        {
            _userIdentifier = factory.GetUser();
            _productId = factory.GetProductId();
        }

        [Fact]
        public async Task Success()
        {
            var token = JwtTokenGeneratorBuilder.Build().Generate(_userIdentifier);

            var response = await DoDelete($"{METHOD}/{_productId}", token);

            response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
        }

        [Theory]
        [ClassData(typeof(CultureInlineDataTest))]
        public async Task Error_Product_Not_Found(string culture)
        {
            var token = JwtTokenGeneratorBuilder.Build().Generate(_userIdentifier);

            var id = 0;

            var response = await DoDelete(method:$"{METHOD}/{id}", token: token, culture:culture);

            response.StatusCode.ShouldBe(HttpStatusCode.NotFound);

            await using var responseBody = await response.Content.ReadAsStreamAsync();

            var responseData = await JsonDocument.ParseAsync(responseBody);

            var errors = responseData.RootElement.GetProperty("errors").EnumerateArray();

            var expectedMessage = ResourceMessagesException.ResourceManager.GetString("PRODUCT_NOT_FOUND", new CultureInfo(culture));

            errors.ShouldHaveSingleItem();
            errors.ShouldContain(error => error.GetString()!.Equals(expectedMessage));
        }
    }
}
