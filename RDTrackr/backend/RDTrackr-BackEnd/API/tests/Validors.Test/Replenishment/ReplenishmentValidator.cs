using CommonTestUtilities.Requests.Replenishment;
using FluentAssertions;
using RDTrackR.Application.UseCases.Replenishment.Register;
using RDTrackR.Communication.Requests.Replenishment;
using RDTrackR.Exceptions;
using Shouldly;

namespace Validors.Test.Replenishment
{
    public class GenerateReplenishmentValidatorTest
    {
        [Fact]
        public void Success()
        {
            var validator = new GenerateReplenishmentValidator();
            var request = RequestGeneratePoFromReplenishmentJsonBuilder.Build();

            var result = validator.Validate(request);

            result.IsValid.ShouldBeTrue();
            result.Errors.ShouldBeEmpty();
        }

        [Fact]
        public void Error_SupplierId_Invalid()
        {
            var validator = new GenerateReplenishmentValidator();
            var request = RequestGeneratePoFromReplenishmentJsonBuilder.Build();
            request.SupplierId = 0;

            var result = validator.Validate(request);

            result.IsValid.ShouldBeFalse();
            result.Errors.Should().ContainSingle(e =>
                e.ErrorMessage == ResourceMessagesException.SUPPLIER_NOT_FOUND);
        }

        [Fact]
        public void Error_Items_Empty()
        {
            var validator = new GenerateReplenishmentValidator();
            var request = RequestGeneratePoFromReplenishmentJsonBuilder.Build();
            request.Items = new List<ReplenishmentPoItemJson>();

            var result = validator.Validate(request);

            result.IsValid.ShouldBeFalse();
            result.Errors.Should().ContainSingle(e =>
                e.ErrorMessage == ResourceMessagesException.REPLENISHMENT_ITEMS_REQUIRED);
        }

        [Fact]
        public void Error_ProductId_Invalid()
        {
            var validator = new GenerateReplenishmentValidator();
            var request = RequestGeneratePoFromReplenishmentJsonBuilder.Build();
            request.Items[0].ProductId = 0;

            var result = validator.Validate(request);

            result.IsValid.ShouldBeFalse();
            result.Errors.Should().ContainSingle(e =>
                e.ErrorMessage == ResourceMessagesException.PRODUCT_NOT_FOUND);
        }

        [Fact]
        public void Error_Quantity_Invalid()
        {
            var validator = new GenerateReplenishmentValidator();
            var request = RequestGeneratePoFromReplenishmentJsonBuilder.Build();
            request.Items[0].Quantity = 0;

            var result = validator.Validate(request);

            result.IsValid.ShouldBeFalse();
            result.Errors.Should().ContainSingle(e =>
                e.ErrorMessage == ResourceMessagesException.REPLENISHMENT_QTY_INVALID);
        }

        [Fact]
        public void Error_UnitPrice_Invalid()
        {
            var validator = new GenerateReplenishmentValidator();
            var request = RequestGeneratePoFromReplenishmentJsonBuilder.Build();
            request.Items[0].UnitPrice = 0;

            var result = validator.Validate(request);

            result.IsValid.ShouldBeFalse();
            result.Errors.Should().ContainSingle(e =>
                e.ErrorMessage == ResourceMessagesException.REPLENISHMENT_UNITPRICE_INVALID);
        }
    }
}
