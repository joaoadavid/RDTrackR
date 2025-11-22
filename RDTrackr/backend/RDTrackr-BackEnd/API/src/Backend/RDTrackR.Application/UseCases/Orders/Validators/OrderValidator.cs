using FluentValidation;
using RDTrackR.Communication.Requests.Orders;
using RDTrackR.Exceptions;

namespace RDTrackR.Application.UseCases.Orders.Validators
{
    public class OrderValidator : AbstractValidator<RequestCreateOrderJson>
    {
        public OrderValidator()
        {
            // Nome do cliente
            RuleFor(x => x.CustomerName)
                .NotEmpty().WithMessage(ResourceMessagesException.ORDER_INVALID_CUSTOMER_NAME)
                .MinimumLength(3).WithMessage(ResourceMessagesException.ORDER_CUSTOMER_NAME_MIN_LENGTH);

            // Lista de itens
            RuleFor(x => x.Items)
                .NotNull().WithMessage(ResourceMessagesException.ORDER_EMPTY_ITEMS)
                .Must(items => items != null && items.Any())
                .WithMessage(ResourceMessagesException.ORDER_EMPTY_ITEMS);

            // Validação individual dos itens
            RuleForEach(x => x.Items)
                .SetValidator(new OrderItemValidator());

            // Total calculado precisa ser > 0
            RuleFor(x => x.Items.Sum(i => i.Quantity * i.Price))
                .GreaterThan(0)
                .WithMessage(ResourceMessagesException.ORDER_INVALID_TOTAL);
        }
    }
}
