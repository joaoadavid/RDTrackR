using RDTrackR.Communication.Requests.Orders;
using RDTrackR.Communication.Responses.Orders;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories.Orders;
using RDTrackR.Domain.Repositories.Products;
using RDTrackR.Domain.Repositories;
using RDTrackR.Domain.Services.LoggedUser;
using RDTrackR.Exceptions.ExceptionBase;
using AutoMapper;
using RDTrackR.Application.UseCases.Orders.Validators;
using RDTrackR.Exceptions;

namespace RDTrackR.Application.UseCases.Orders
{
    public class CreateOrderUseCase : ICreateOrderUseCase
    {
        private readonly IOrderWriteOnlyRepository _repo;
        private readonly IProductReadOnlyRepository _products;
        private readonly ILoggedUser _loggedUser;
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public CreateOrderUseCase(
            IOrderWriteOnlyRepository repo,
            IProductReadOnlyRepository products,
            ILoggedUser loggedUser,
            IUnitOfWork uow,
            IMapper mapper)
        {
            _repo = repo;
            _products = products;
            _loggedUser = loggedUser;
            _uow = uow;
            _mapper = mapper;
        }

        public async Task<ResponseOrderJson> Execute(RequestCreateOrderJson request)
        {
            await Validate(request);
            var user = await _loggedUser.User();

            var order = new Order
            {
                OrderNumber = $"ORD-{DateTime.UtcNow:yyyyMMddHHmmss}",
                CustomerName = request.CustomerName,
                OrganizationId = user.OrganizationId,
                CreatedByUserId = user.Id
            };

            foreach (var item in request.Items)
            {
                var product = await _products.GetByIdAsync(item.ProductId, user);

                if (product == null)
                    throw new NotFoundException("Product not found");

                order.Items.Add(new OrderItem
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    Price = item.Price,
                    Quantity = item.Quantity,
                    Total = item.Price * item.Quantity,
                    OrganizationId = user.OrganizationId
                });

                order.Total += item.Price * item.Quantity;
            }

            await _repo.Add(order);
            await _uow.Commit();

            return _mapper.Map<ResponseOrderJson>(order);
        }

        private async Task Validate(RequestCreateOrderJson request)
        {
            var validator = new OrderValidator();
            var result = await validator.ValidateAsync(request);

            foreach (var item in request.Items)
            {
                var productExists = await _products.Exists(item.ProductId);

                if (!productExists)
                {
                    result.Errors.Add(new FluentValidation.Results.ValidationFailure(
                        nameof(item.ProductId),
                        ResourceMessagesException.PRODUCT_NOT_FOUND
                    ));
                }
            }

            if (result.IsValid == false)
            {
                throw new ErrorOnValidationException(
                    result.Errors
                        .Select(e => e.ErrorMessage)
                        .Distinct()
                        .ToList()
                );
            }
        }

    }

}
