using CommonTestUtilities.Requests.Orders;
using FluentAssertions;
using RDTrackR.Application.UseCases.Orders.Validators;
using RDTrackR.Communication.Requests.Orders;
using RDTrackR.Exceptions;
using Shouldly;

namespace Validors.Test.Order
{
    public class OrderValidatorTest
    {
        [Fact]
        public void Success()
        {
            var validator = new OrderValidator();
            var request = RequestCreateOrderJsonBuilder.Build();

            var result = validator.Validate(request);

            result.IsValid.ShouldBeTrue();
            result.Errors.ShouldBeEmpty();
        }

        [Fact]
        public void Error_CustomerName_Empty()
        {
            var validator = new OrderValidator();
            var request = RequestCreateOrderJsonBuilder.Build();
            request.CustomerName = string.Empty;

            var result = validator.Validate(request);

            result.IsValid.ShouldBeFalse();
            result.Errors.Should().ContainSingle(e =>
                e.ErrorMessage == ResourceMessagesException.ORDER_INVALID_CUSTOMER_NAME);
        }

        [Fact]
        public void Error_CustomerName_MinLength()
        {
            var validator = new OrderValidator();
            var request = RequestCreateOrderJsonBuilder.Build();
            request.CustomerName = "Jo"; // < 3

            var result = validator.Validate(request);

            result.IsValid.ShouldBeFalse();
            result.Errors.Should().ContainSingle(e =>
                e.ErrorMessage == ResourceMessagesException.ORDER_CUSTOMER_NAME_MIN_LENGTH);
        }

        [Fact]
        public void Error_Items_Null()
        {
            var validator = new OrderValidator();
            var request = RequestCreateOrderJsonBuilder.Build();
            request.Items = [];

            var result = validator.Validate(request);

            result.IsValid.ShouldBeFalse();
            result.Errors.Should().Contain(e =>
                e.ErrorMessage == ResourceMessagesException.ORDER_EMPTY_ITEMS);
        }

        [Fact]
        public void Error_Items_Empty()
        {
            var validator = new OrderValidator();
            var request = RequestCreateOrderJsonBuilder.Build();
            request.Items = new List<RequestCreateOrderItemJson>();

            var result = validator.Validate(request);

            result.IsValid.ShouldBeFalse();
            result.Errors.Should().Contain(e =>
                e.ErrorMessage == ResourceMessagesException.ORDER_EMPTY_ITEMS);
        }

        [Fact]
        public void Error_Total_Invalid()
        {
            var validator = new OrderValidator();
            var request = RequestCreateOrderJsonBuilder.Build();

            // Total = 0
            foreach (var item in request.Items)
            {
                item.Quantity = 0;
                item.Price = 0;
            }

            var result = validator.Validate(request);

            result.IsValid.ShouldBeFalse();
            result.Errors.Should().ContainSingle(e =>
                e.ErrorMessage == ResourceMessagesException.ORDER_INVALID_TOTAL);
        }
    }
}
