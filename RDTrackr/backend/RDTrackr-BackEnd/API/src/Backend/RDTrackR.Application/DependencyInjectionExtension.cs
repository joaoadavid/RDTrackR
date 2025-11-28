using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MyRecipeBook.Application.UseCases.Token;
using MyRecipeBook.Application.UseCases.User.ChangePassword;
using MyRecipeBook.Application.UseCases.User.Delete.Delete;
using MyRecipeBook.Application.UseCases.User.Delete.Request;
using MyRecipeBook.Application.UseCases.User.Profile;
using MyRecipeBook.Application.UseCases.User.Register;
using MyRecipeBook.Application.UseCases.User.Update;
using RDTrackR.Application.Services.AutoMapper;
using RDTrackR.Application.Services.Context;
using RDTrackR.Application.UseCases.AuditLogs;
using RDTrackR.Application.UseCases.Contact;
using RDTrackR.Application.UseCases.Login.DoLogin;
using RDTrackR.Application.UseCases.Login.Logout;
using RDTrackR.Application.UseCases.Login.ResetPassword;
using RDTrackR.Application.UseCases.Movements.GetAll;
using RDTrackR.Application.UseCases.Movements.Register;
using RDTrackR.Application.UseCases.Notifications;
using RDTrackR.Application.UseCases.Orders;
using RDTrackR.Application.UseCases.Organizations;
using RDTrackR.Application.UseCases.Overview.Get;
using RDTrackR.Application.UseCases.Product.Delete;
using RDTrackR.Application.UseCases.Product.GetAll;
using RDTrackR.Application.UseCases.Product.Update;
using RDTrackR.Application.UseCases.Products.GetById;
using RDTrackR.Application.UseCases.Products.Register;
using RDTrackR.Application.UseCases.PurchaseOrders.Delete;
using RDTrackR.Application.UseCases.PurchaseOrders.GetAll;
using RDTrackR.Application.UseCases.PurchaseOrders.Register;
using RDTrackR.Application.UseCases.PurchaseOrders.Update;
using RDTrackR.Application.UseCases.Replenishment.GetAll;
using RDTrackR.Application.UseCases.Replenishment.Register;
using RDTrackR.Application.UseCases.Reports;
using RDTrackR.Application.UseCases.StockItems.GetAll;
using RDTrackR.Application.UseCases.StockItems.Register;
using RDTrackR.Application.UseCases.Suppliers.Delete;
using RDTrackR.Application.UseCases.Suppliers.DeleteSupplierProduct;
using RDTrackR.Application.UseCases.Suppliers.GetAll;
using RDTrackR.Application.UseCases.Suppliers.GetSupplierProduct;
using RDTrackR.Application.UseCases.Suppliers.Register;
using RDTrackR.Application.UseCases.Suppliers.RegisterSupplierProduct;
using RDTrackR.Application.UseCases.Suppliers.Update;
using RDTrackR.Application.UseCases.Suppliers.UpdateSupplierProduct;
using RDTrackR.Application.UseCases.User.Admin;
using RDTrackR.Application.UseCases.User.ChangePassword;
using RDTrackR.Application.UseCases.User.GetAll;
using RDTrackR.Application.UseCases.User.Register;
using RDTrackR.Application.UseCases.User.Request;
using RDTrackR.Application.UseCases.User.Update;
using RDTrackR.Application.UseCases.Warehouses.Delete;
using RDTrackR.Application.UseCases.Warehouses.GetAll;
using RDTrackR.Application.UseCases.Warehouses.GetById;
using RDTrackR.Application.UseCases.Warehouses.Register;
using RDTrackR.Application.UseCases.Warehouses.Update;
using RDTrackR.Domain.Context;
using Sqids;

namespace RDTrackR.Application
{
    public static class DependencyInjectionExtension
    {
        public static void AddApplication(this IServiceCollection services, IConfiguration configuration)
        {
            AddUserUseCases(services);
            AddIdEncoder(services, configuration);
            AddProductUseCases(services);
            AddMovementsUseCases(services);
            AddWarehousesUseCases(services);
            AddStockItemUseCases(services);
            AddSuppliersesUseCases(services);
            AddPurchaseOrderUseCase(services);
            services.AddAutoMapper();
            AddContextAcessor(services);
            AddReportsUseCases(services);
            AddReplenishmentUseCase(services);
            AddRestePassword(services);
            AddReportsUseCase(services);
            AddOverviewUseCase(services);
            AddAuditLog(services);
            AddNotification(services);
            AddOrganizationUseCase(services);
            AddOrdersUseCase(services);
            AddSupplierProductUseCases(services);
            AddContactUseCase(services);
        }

        private static void AddAutoMapper(this IServiceCollection services)
        {

            services.AddScoped(option => new AutoMapper.MapperConfiguration(automapperOption =>
            {
                var sqids = option.GetService<SqidsEncoder<long>>()!;

                automapperOption.AddProfile(new AutoMapping(sqids));
            }).CreateMapper());
        }

        private static void AddIdEncoder(IServiceCollection services, IConfiguration configuration)
        {
            var sqids = new SqidsEncoder<long>(new()
            {
                MinLength = 3,
                Alphabet = configuration.GetValue<string>("Settings:IdCryptographyAlphabet")!
            });
            services.AddSingleton(sqids);
        }
        private static void AddUserUseCases(IServiceCollection services)
        {
            services.AddScoped<IRegisterUserUseCase, RegisterUserUseCase>();
            services.AddScoped<IDoLoginUseCase, DoLoginUseCase>();
            services.AddScoped<IGetUserProfileUseCase, GetUserProfileUseCase>();
            services.AddScoped<IUpdateUserUseCase, UpdateUserUseCase>();
            services.AddScoped<IChangePasswordUseCase, ChangePasswordUseCase>();
            services.AddScoped<IUpdateUserUseCase, UpdateUserUseCase>();
            services.AddScoped<IDeleteUserAccountUseCase, DeleteUserAccountUseCase>();
            services.AddScoped<IRequestDeleteUserUseCase, RequestDeleteUserUseCase>();
            services.AddScoped<IUseRefreshTokenUseCase, UseRefreshTokenUseCase>();
            services.AddScoped<IGetOverviewUseCase, GetOverviewUseCase>();
            services.AddScoped<ILogoutUseCase, LogoutUseCase>();
            services.AddScoped<IAdminToggleUserActiveUseCase, AdminToggleUserActiveUseCase>();
            services.AddScoped<IAdminUpdateUserUseCase, AdminUpdateUserUseCase>();
            services.AddScoped<IAdminDeleteUserUseCase, AdminDeleteUserUseCase>();
            services.AddScoped<IGetAllUsersUseCase, GetAllUsersUseCase>();
            services.AddScoped<IValidateResetCodeUseCase, ValidateResetCodeUseCase>();
        }

        private static void AddProductUseCases(IServiceCollection services)
        {
            services.AddScoped<IRegisterProductUseCase, RegisterProductUseCase>();
            services.AddScoped<IUpdateProductUseCase, UpdateProductUseCase>();
            services.AddScoped<IGetAllProductsUseCase, GetAllProductsUseCase>();
            services.AddScoped<IDeleteProductUseCase, DeleteProductUseCase>();
            services.AddScoped<IGetProductByIdUseCase, GetProductByIdUseCase>();
            services.AddScoped<IGetAllUserProfileUseCase, GetAllUserProfileUseCase>();
            services.AddScoped<IAdminCreateUserUseCase, AdminCreateUserUseCase>();
        }

        private static void AddWarehousesUseCases(IServiceCollection services)
        {
            services.AddScoped<IGetAllWarehousesUseCase, GetAllWarehousesUseCase>();
            services.AddScoped<IRegisterWarehouseUseCase, RegisterWarehouseUseCase>();
            services.AddScoped<IUpdateWarehouseUseCase, UpdateWarehouseUseCase>();
            services.AddScoped<IDeleteWarehouseUseCase, DeleteWarehouseUseCase>();
            services.AddScoped<IGetWarehouseByIdUseCase, GetWarehouseByIdUseCase>();
            services.AddScoped<IGetWarehouseItemsUseCase, GetWarehouseItemsUseCase>();

        }

        private static void AddSuppliersesUseCases(IServiceCollection services)
        {
            services.AddScoped<IDeleteSupplierUseCase, DeleteSupplierUseCase>();
            services.AddScoped<IRegisterSupplierUseCase, RegisterSupplierUseCase>();
            services.AddScoped<IGetAllSuppliersUseCase, GetAllSuppliersUseCase>();
            services.AddScoped<IUpdateSupplierUseCase, UpdateSupplierUseCase>();
        }
        private static void AddMovementsUseCases(IServiceCollection services)
        {
            services.AddScoped<IRegisterMovementUseCase, RegisterMovementUseCase>();
            services.AddScoped<IGetAllMovementsUseCase, GetAllMovementsUseCase>();
        }

        private static void AddStockItemUseCases(IServiceCollection services)
        {
            services.AddScoped<IGetAllStockItemsUseCase, GetAllStockItemsUseCase>();
            services.AddScoped<IRegisterStockItemUseCase, RegisterStockItemUseCase>();
        }

        private static void AddReportsUseCases(IServiceCollection services)
        {
            services.AddScoped<IGetReportsUseCase, GetReportsUseCase>();
        }

        private static void AddPurchaseOrderUseCase(IServiceCollection services)
        {
            services.AddScoped<IDeletePurchaseOrderUseCase, DeletePurchaseOrderUseCase>();
            services.AddScoped<IGetPurchaseOrdersUseCase, GetPurchaseOrdersUseCase>();
            services.AddScoped<IRegisterPurchaseOrderUseCase, RegisterPurchaseOrderUseCase>();
            services.AddScoped<IUpdatePurchaseOrderItemsUseCase, UpdatePurchaseOrderItemsUseCase>();
            services.AddScoped<IUpdatePurchaseOrderStatusUseCase, UpdatePurchaseOrderStatusUseCase>();
            services.AddScoped<IGetByIdPurchaseOrdersUseCase, GetByIdPurchaseOrdersUseCase>();
        }

        private static void AddContextAcessor(IServiceCollection services)
        {
            services.AddHttpContextAccessor();
            services.AddScoped<IUserContext, UserContext>();
        }

        private static void AddRestePassword(IServiceCollection services)
        {
            services.AddScoped<IResetPasswordUseCase, ResetPasswordUseCase>();
            services.AddScoped<IRequestCodeResetPasswordUseCase, RequestCodeResetPasswordUseCase>();
        }

        private static void AddReplenishmentUseCase(IServiceCollection services)
        {
            services.AddScoped<IGetReplenishmentItemsUseCase, GetReplenishmentItemsUseCase>();
            services.AddScoped<IGeneratePoFromReplenishmentUseCase, GeneratePoFromReplenishmentUseCase>();
        }
        private static void AddOverviewUseCase(IServiceCollection services)
        {
            services.AddScoped<IGetOverviewUseCase, GetOverviewUseCase>();
        }
        private static void AddReportsUseCase(IServiceCollection services)
        {
            services.AddScoped<IGetReportsUseCase, GetReportsUseCase>();
        }

        private static void AddAuditLog(IServiceCollection services)
        {
            services.AddScoped<IGetAuditLogsUseCase, GetAuditLogsUseCase>();
        }

        private static void AddNotification(IServiceCollection services)
        {
            services.AddScoped< IGetNotificationUseCase, GetNotificationUseCase>();
            services.AddScoped< IMarkNotificationAsReadUseCase, MarkNotificationAsReadUseCase>();
        }

        private static void AddOrganizationUseCase(IServiceCollection services)
        {
            services.AddScoped<IRegisterOrganizationUseCase, RegisterOrganizationUseCase>();
        }

        private static void AddOrdersUseCase(IServiceCollection services)
        {
            services.AddScoped<ICreateOrderUseCase, CreateOrderUseCase>();
            services.AddScoped<IGetAllOrdersUseCase, GetAllOrdersUseCase>();
            services.AddScoped<IGetOrdersPagedUseCase, GetOrdersPagedUseCase>();
            services.AddScoped<IUpdateOrderStatusUseCase, UpdateOrderStatusUseCase>();
            services.AddScoped<IDeleteOrderUseCase, DeleteOrderUseCase>();
        }

        private static void AddContactUseCase(IServiceCollection services)
        {
            services.AddScoped<ISendContactMessageUseCase, SendContactMessageUseCase>();
        }
        private static void AddSupplierProductUseCases(IServiceCollection services)
        {
            services.AddScoped<IRegisterSupplierProductUseCase, RegisterSupplierProductUseCase>();
            services.AddScoped<IGetProductsBySupplierUseCase, GetProductsBySupplierUseCase>();
            services.AddScoped<IUpdateSupplierProductUseCase, UpdateSupplierProductUseCase>();
            services.AddScoped<IDeleteSupplierProductUseCase, DeleteSupplierProductUseCase>();
        }
    }
}
