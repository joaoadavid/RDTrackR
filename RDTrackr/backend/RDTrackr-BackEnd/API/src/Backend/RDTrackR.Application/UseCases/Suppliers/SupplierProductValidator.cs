using FluentValidation;
using RDTrackR.Communication.Requests.Supplier;
using RDTrackR.Exceptions;

namespace RDTrackR.Application.UseCases.Suppliers
{
    public class SupplierProductValidator : AbstractValidator<RequestRegisterSupplierProductJson>
    {
        public SupplierProductValidator()
        {
            RuleFor(s => s.SupplierSKU)
                .NotEmpty()
                .WithMessage(ResourceMessagesException.SUPPLIER_NAME_REQUIRED);

            RuleFor(s => s.ProductId)
                .NotEmpty()
                .WithMessage(ResourceMessagesException.PRODUCT_NOT_FOUND);            
        }
    }
}
