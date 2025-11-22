using FluentValidation;
using RDTrackR.Communication.Requests.Orders;
using RDTrackR.Exceptions;

namespace RDTrackR.Application.UseCases.Orders.Validators
{
    public class OrderItemValidator : AbstractValidator<RequestCreateOrderItemJson>
    {
        public OrderItemValidator()
        {
            RuleFor(i => i.ProductId)
                .GreaterThan(0).WithMessage(ResourceMessagesException.ORDER_ITEMS_REQUIRED);

            RuleFor(i => i.Quantity)
                .GreaterThan(0).WithMessage(ResourceMessagesException.ORDER_ITEM_INVALID_QUANTITY);

            RuleFor(i => i.Price)
                .GreaterThan(0).WithMessage(ResourceMessagesException.ORDER_ITEM_INVALID_PRICE);
        }
    }
}
