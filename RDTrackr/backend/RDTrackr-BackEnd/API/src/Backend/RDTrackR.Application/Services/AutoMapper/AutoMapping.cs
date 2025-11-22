using AutoMapper;
using MyRecipeBook.Communication.Responses;
using RDTrackR.Communication.Requests.Movements;
using RDTrackR.Communication.Requests.Organization;
using RDTrackR.Communication.Requests.Product;
using RDTrackR.Communication.Requests.PurchaseOrders;
using RDTrackR.Communication.Requests.StockItem;
using RDTrackR.Communication.Requests.Supplier;
using RDTrackR.Communication.Requests.User;
using RDTrackR.Communication.Requests.Warehouse;
using RDTrackR.Communication.Responses.Movements;
using RDTrackR.Communication.Responses.Orders;
using RDTrackR.Communication.Responses.Organization;
using RDTrackR.Communication.Responses.Product;
using RDTrackR.Communication.Responses.PurchaseOrders;
using RDTrackR.Communication.Responses.Reports;
using RDTrackR.Communication.Responses.StockItem;
using RDTrackR.Communication.Responses.Supplier;
using RDTrackR.Communication.Responses.User.Admin;
using RDTrackR.Communication.Responses.Warehouse;
using RDTrackR.Domain.Entities;
using Sqids;

namespace RDTrackR.Application.Services.AutoMapper
{
    public class AutoMapping : Profile
    {
        private readonly SqidsEncoder<long> _idEncoder;
        public AutoMapping(SqidsEncoder<long> idEnconder)
        {
            _idEncoder = idEnconder;

            RequestToDomain();
            DomainToResponse();
        }

        private void RequestToDomain()
        {

            CreateMap<RequestRegisterUserJson, User>()
                .ForMember(dest => dest.Password, opt => opt.Ignore())
                .ForMember(dest => dest.OrganizationId, opt => opt.Ignore());

            CreateMap<RequestRegisterProductJson, Product>()
                .ForMember(dest => dest.CreatedByUserId, opt => opt.Ignore())
                .ForMember(dest => dest.OrganizationId, opt => opt.Ignore());

            CreateMap<RequestRegisterWarehouseJson, Warehouse>()
                .ForMember(dest => dest.CreatedByUserId, opt => opt.Ignore())
                .ForMember(dest => dest.OrganizationId, opt => opt.Ignore());

            CreateMap<RequestRegisterMovementJson, Movement>()
                .ForMember(dest => dest.OrganizationId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedByUserId, opt => opt.Ignore())
                .ForMember(dest => dest.Product, opt => opt.Ignore())
                .ForMember(dest => dest.Warehouse, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore());

            CreateMap<RequestRegisterStockItemJson, StockItem>()
                .ForMember(dest => dest.OrganizationId, opt => opt.Ignore());

            CreateMap<RequestRegisterSupplierJson, Supplier>()
                .ForMember(dest => dest.CreatedByUserId, opt => opt.Ignore())
                .ForMember(dest => dest.OrganizationId, opt => opt.Ignore());

            CreateMap<RequestCreatePurchaseOrderJson, PurchaseOrder>()
                .ForMember(dest => dest.CreatedByUserId, o => o.Ignore())
                .ForMember(dest => dest.Number, o => o.Ignore());

            CreateMap<RequestCreatePurchaseOrderItemJson, PurchaseOrderItem>();

            CreateMap<RequestRegisterOrganizationJson, Organization>();

            CreateMap<RequestRegisterSupplierProductJson, SupplierProduct>();
        }

        private void DomainToResponse()
        {
            CreateMap<Domain.Entities.User, ResponseUserProfileJson>();

            //CreateMap<Product, ResponseProductJson>()
            //     .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            //     .ForMember(dest => dest.Active, opt => opt.MapFrom(src => src.Active))
            //     .ForMember(dest => dest.CreatedByUserId, opt => opt.MapFrom(src => src.CreatedByUserId))
            //     .ForMember(dest => dest.TotalStock,
            //    opt => opt.MapFrom(src => src.StockItems.Sum(x => x.Quantity)))
            //     .ForMember(dest => dest.CreatedByName, opt => opt.MapFrom(src => src.CreatedBy.Name));

            CreateMap<Product, ResponseProductJson>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Active, opt => opt.MapFrom(src => src.Active))
                .ForMember(dest => dest.CreatedByUserId, opt => opt.MapFrom(src => src.CreatedByUserId))
                .ForMember(dest => dest.TotalStock,
                    opt => opt.MapFrom(src => src.StockItems.Sum(x => x.Quantity)))
                .ForMember(dest => dest.StockItems,
                    opt => opt.MapFrom(src => src.StockItems))
                .ForMember(dest => dest.CreatedByName, opt => opt.MapFrom(src => src.CreatedBy.Name));


            CreateMap<Domain.Entities.Warehouse, ResponseWarehouseJson>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.CreatedByUserId, opt => opt.MapFrom(src => src.CreatedByUserId))
                .ForMember(dest => dest.CreatedByName, opt => opt.MapFrom(src => src.CreatedBy.Name))
                .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.Items))
                .ForMember(dest => dest.Utilization, opt => opt.MapFrom(src => src.Utilization))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedOn))

                .ForMember(dest => dest.UpdatedByUserId, opt => opt.MapFrom(src => src.UpdatedByUserId))
                .ForMember(dest => dest.UpdatedByName, opt => opt.MapFrom(src => src.UpdatedBy != null ? src.UpdatedBy.Name : null))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt));


            CreateMap<Domain.Entities.Movement, ResponseMovementJson>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Product, opt => opt.MapFrom(src => src.Product.Name))
                .ForMember(dest => dest.Warehouse, opt => opt.MapFrom(src => src.Warehouse.Name))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
                .ForMember(dest => dest.Quantity, opt => opt.MapFrom(src => src.Quantity))
                .ForMember(dest => dest.Reference, opt => opt.MapFrom(src => src.Reference))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedOn))
                .ForMember(dest => dest.CreatedByName, opt => opt.MapFrom(src => src.CreatedBy.Name));

            CreateMap<Domain.Entities.StockItem, ResponseStockItemJson>()
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name))
                .ForMember(dest => dest.WarehouseName, opt => opt.MapFrom(src => src.Warehouse.Name));

            CreateMap<Supplier, ResponseSupplierJson>()
                .ForMember(dest => dest.CreatedByName, opt => opt.MapFrom(src => src.CreatedBy.Name));

            CreateMap<RequestCreatePurchaseOrderJson, PurchaseOrder>()
                .ForMember(dest => dest.SupplierId, opt => opt.MapFrom(src => src.SupplierId))
                .ForMember(dest => dest.WarehouseId, opt => opt.MapFrom(src => src.WarehouseId))
                .ForMember(dest => dest.Number, opt => opt.MapFrom(src => src.Number))
                .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.Items));

            CreateMap<PurchaseOrderItem, ResponsePurchaseOrderItemJson>()
                .ForMember(dest => dest.ProductName, o => o.MapFrom(src => src.Product.Name));

            CreateMap<Domain.Entities.User, ResponseUserListItemJson>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.Active, opt => opt.MapFrom(src => src.Active));

            CreateMap<Domain.Entities.User, ResponseShortUserJson>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name));

            CreateMap<PurchaseOrder, ResponsePurchaseOrderJson>()
                .ForMember(dest => dest.SupplierName, o => o.MapFrom(src => src.Supplier.Name))
                .ForMember(dest => dest.WarehouseName, o => o.MapFrom(src => src.Warehouse.Name))
                .ForMember(dest => dest.WarehouseId, o => o.MapFrom(src => src.WarehouseId))
                .ForMember(dest => dest.Status, o => o.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.CreatedByName, o => o.MapFrom(src => src.CreatedBy.Name))
                .ForMember(dest => dest.Items, o => o.MapFrom(src => src.Items));

            CreateMap<SupplierProduct, ResponseSupplierProductJson>()
                .ForMember(dest => dest.ProductId, opt => opt.MapFrom(src => src.ProductId))
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name))
                .ForMember(dest => dest.SKU, opt => opt.MapFrom(src => src.Product.Sku))
                .ForMember(dest => dest.UnitPrice, opt => opt.MapFrom(src => src.UnitPrice));

            CreateMap<Organization, ResponseRegisterOrganizationJson>()
                .ForMember(dest => dest.OrganizationId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.OrganizationName, opt => opt.MapFrom(src => src.Name));

            // Order → ResponseOrderJson
            CreateMap<Order, ResponseOrderJson>()
                .ForMember(dest => dest.Id, o => o.MapFrom(src => src.Id))
                .ForMember(dest => dest.OrderNumber, o => o.MapFrom(src => src.OrderNumber))
                .ForMember(dest => dest.CustomerName, o => o.MapFrom(src => src.CustomerName))
                .ForMember(dest => dest.Total, o => o.MapFrom(src => src.Total))
                .ForMember(dest => dest.Status, o => o.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.CreatedOn, o => o.MapFrom(src => src.CreatedOn))
                .ForMember(dest => dest.Items, o => o.MapFrom(src => src.Items));

            // OrderItem → ResponseOrderItemJson
            CreateMap<OrderItem, ResponseOrderItemJson>()
                .ForMember(dest => dest.ProductId, o => o.MapFrom(src => src.ProductId))
                .ForMember(dest => dest.ProductName, o => o.MapFrom(src => src.ProductName))
                .ForMember(dest => dest.Quantity, o => o.MapFrom(src => src.Quantity))
                .ForMember(dest => dest.Price, o => o.MapFrom(src => src.Price));
        }
    }
}
