using Azure.Messaging.ServiceBus;
using Azure.Storage.Blobs;
using FluentMigrator.Runner;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MyRecipeBook.Domain.Repositories.Token;
using MyRecipeBook.Domain.Repositories.User;
using MyRecipeBook.Domain.Security.Tokens.Refresh;
using RDTrackR.Domain.Enums;
using RDTrackR.Domain.Extensions;
using RDTrackR.Domain.Repositories;
using RDTrackR.Domain.Repositories.Audit;
using RDTrackR.Domain.Repositories.Movements;
using RDTrackR.Domain.Repositories.Notifications;
using RDTrackR.Domain.Repositories.Orders;
using RDTrackR.Domain.Repositories.Organization;
using RDTrackR.Domain.Repositories.Password;
using RDTrackR.Domain.Repositories.Products;
using RDTrackR.Domain.Repositories.PurchaseOrders;
using RDTrackR.Domain.Repositories.SalesOrders;
using RDTrackR.Domain.Repositories.StockItems;
using RDTrackR.Domain.Repositories.SupplierProducts;
using RDTrackR.Domain.Repositories.Suppliers;
using RDTrackR.Domain.Repositories.Users;
using RDTrackR.Domain.Repositories.Warehouses;
using RDTrackR.Domain.Security.Cryptography;
using RDTrackR.Domain.Security.Tokens;
using RDTrackR.Domain.Services.Audit;
using RDTrackR.Domain.Services.Email;
using RDTrackR.Domain.Services.LoggedUser;
using RDTrackR.Domain.Services.Notification;
using RDTrackR.Domain.Services.ServiceBus;
using RDTrackR.Domain.Services.Storage;
using RDTrackR.Infrastructure.DataAccess;
using RDTrackR.Infrastructure.DataAccess.Repositories;
using RDTrackR.Infrastructure.DataAccess.Repositories.RDTrackR.Infrastructure.DataAccess.Repositories;
using RDTrackR.Infrastructure.Extensions;
using RDTrackR.Infrastructure.Security.Cryptography;
using RDTrackR.Infrastructure.Security.Tokens.Access.Generator;
using RDTrackR.Infrastructure.Security.Tokens.Access.Validator;
using RDTrackR.Infrastructure.Security.Tokens.Refresh;
using RDTrackR.Infrastructure.Services.Audit;
using RDTrackR.Infrastructure.Services.Email;
using RDTrackR.Infrastructure.Services.LoggedUser;
using RDTrackR.Infrastructure.Services.ServiceBus;
using RDTrackR.Infrastructure.Services.Storage;
using System.Reflection;

namespace RDTrackR.Infrastructure
{
    public static class DependencyInjectionExtension
    {
        public static void AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            AddPasswordEncrpter(services);
            AddRepositories(services);
            AddLoggerUser(services);
            AddCodeGenerator(services);
            AddBrevo(services);
            AddTokens(services, configuration);
            AddAuditService(services);
            AddNotificationService(services);
            AddOrganization(services);
            services.AddAzureStorage(configuration);
            AddRefreshTokenGenerator(services);
            AddQueues(services, configuration);
            AddHub(services);
            AddSupplierProducts(services);
            AddAuditService(services);
            AddOrders(services);
            //Teste de integração
            if (configuration.IsUnitTestEnviroment())
                return;

            var databaseType = configuration.DatabaseType();

            if (databaseType == DatabaseType.SqlServer)
            {
                AddDbContext_SqlServer(services, configuration);
                services.AddFluentMigrator_SqlServer(configuration);
            }
            else if (databaseType == DatabaseType.PostgreSQL)
            {
                AddDbContext_PostgreeSQL(services, configuration);
                services.AddFluentMigrator_PostgreeSQL(configuration);
            }


        }

        private static void AddDbContext_SqlServer(IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.ConnectionString();
            //necessario instalar o sqlserver entity framework
            services.AddDbContext<RDTrackRDbContext>(dbContextOptions =>
            {
                dbContextOptions.UseSqlServer(connectionString);
            });
        }

        private static void AddFluentMigrator_SqlServer(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.ConnectionString();
            services.AddFluentMigratorCore().ConfigureRunner(options =>
            {
                options.AddSqlServer().WithGlobalConnectionString(connectionString)
                .ScanIn(Assembly.Load("RDTrackR.Infrastructure")).For.All();
            });
        }

        private static void AddDbContext_PostgreeSQL(IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.ConnectionString();
            //necessario instalar o sqlserver entity framework
            services.AddDbContext<RDTrackRDbContext>(dbContextOptions =>
            {
                dbContextOptions.UseNpgsql(connectionString);
            });
        }


        private static void AddFluentMigrator_PostgreeSQL(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.ConnectionString();
            services.AddFluentMigratorCore().ConfigureRunner(options =>
            {
                options.AddPostgres().WithGlobalConnectionString(connectionString)
                .ScanIn(Assembly.Load("RDTrackR.Infrastructure")).For.All();
            });
        }

        private static void AddRepositories(IServiceCollection services)
        {
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IUserWriteOnlyRepository, UserRepository>();
            services.AddScoped<IUserReadOnlyRepository, UserRepository>();
            services.AddScoped<IUserUpdateOnlyRepository, UserRepository>();
            services.AddScoped<IUserDeleteOnlyRepository, UserRepository>();
            services.AddScoped<ICodeToPerformActionRepository, CodeToPerformActionRepository>();
            services.AddScoped<ITokenRepository, TokenRepository>();
            services.AddScoped<IProductReadOnlyRepository, ProductRepository>();
            services.AddScoped<IProductWriteOnlyRepository, ProductRepository>();
            services.AddScoped<IWarehouseReadOnlyRepository, WarehouseRepository>();
            services.AddScoped<IWarehouseWriteOnlyRepository, WarehouseRepository>();
            services.AddScoped<IMovementReadOnlyRepository, MovementRepository>();
            services.AddScoped<IMovementWriteOnlyRepository, MovementRepository>();
            services.AddScoped<IStockItemReadOnlyRepository, StockItemRepository>();
            services.AddScoped<IStockItemWriteOnlyRepository, StockItemRepository>();
            services.AddScoped<ISupplierReadOnlyRepository, SupplierRepository>();
            services.AddScoped<ISupplierWriteOnlyRepository, SupplierRepository>();
            services.AddScoped<IPurchaseOrderWriteOnlyRepository, PurchaseOrderRepository>();
            services.AddScoped<IPurchaseOrderReadOnlyRepository, PurchaseOrderRepository>();
            services.AddScoped<ISalesOrderReadOnlyRepository, SalesOrderReadOnlyRepository>();
            services.AddScoped<IPurchaseOrderReadOnlyRepository, PurchaseOrderRepository>();
            services.AddScoped<IPurchaseOrderWriteOnlyRepository, PurchaseOrderRepository>();
            services.AddScoped<IAuditLogRepository, AuditLogRepository>();
            services.AddScoped<INotificationRepository, NotificationRepository>();
        }

        

        private static void AddTokens(IServiceCollection services, IConfiguration configuration)
        {
            var expirationTimeMinutes = configuration.GetValue<uint>("Settings:Jwt:ExpirationTimeMinutes");
            var signingKey = configuration.GetValue<string>("Settings:Jwt:SigningKey");

            services.AddScoped<IAccessTokenGenerator>(option => new JwtTokenGenerator(expirationTimeMinutes, signingKey!));
            services.AddScoped<IAccessTokenValidator>(option => new JwtTokenValidator(signingKey!));
        }

        public static void AddLoggerUser(IServiceCollection services)
            => services.AddScoped<ILoggedUser, LoggedUser>();

        private static void AddPasswordEncrpter(IServiceCollection services)
        {
            services.AddScoped<IPasswordEncripter, BCryptNet>();
        }

        private static void AddAuditService(IServiceCollection services)
        {
            services.AddScoped<IAuditService, AuditService>();
        }
        private static void AddNotificationService(IServiceCollection services)
        {
            services.AddScoped<INotificationService, NotificationService>();
        }

        private static void AddHub(IServiceCollection services)
        {
            services.AddScoped<INotificationService, NotificationService>();
        }

        private static void AddAzureStorage(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetValue<string>("Storage:BlobStorage:Azure");

            if (connectionString.NotEmpty())
                services.AddScoped<IBlobStorageService>(client => new AzureStorageService(new BlobServiceClient(connectionString)));
        }

        private static void AddQueues(IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetValue<string>("ServiceBus:DeleteUserAccount");

            var client = new ServiceBusClient(connectionString, new ServiceBusClientOptions
            {
                TransportType = ServiceBusTransportType.AmqpWebSockets
            });

            var deleteQueue = new DeleteUserQueue(client.CreateSender("user"));

            var deleteUserProcessor = new DeleteUserProcessor(client.CreateProcessor("user", new ServiceBusProcessorOptions
            {
                MaxConcurrentCalls = 1,
            }));

            services.AddSingleton(deleteUserProcessor);

            services.AddScoped<IDeleteUserQueue>(client => deleteQueue);
        }

        private static void AddCodeGenerator(IServiceCollection services)
        {
            services.AddScoped<ICodeGenerator, CodeGenerator>();
        }

        private static void AddBrevo(IServiceCollection services)
        {
            services.AddScoped<ISendCodeResetPassword, BrevoSendCodeResetPassword>();
            services.AddScoped<IContactEmailService, BrevoSendCodeResetPassword>();
        }

        private static void AddOrganization(IServiceCollection services)
        {
            services.AddScoped<IOrganizationWriteOnlyRepository, OrganizationRepository>();
            services.AddScoped<IOrganizationReadOnlyRepository, OrganizationRepository>();
        }



        private static void AddRefreshTokenGenerator(IServiceCollection services)
        {
            services.AddScoped<IRefreshTokenGenerator, RefreshTokenGenerator>();
        }

        private static void AddOrders(IServiceCollection services)
        {
            services.AddScoped<IOrderWriteOnlyRepository, OrdersRepository>();
            services.AddScoped<IOrderReadOnlyRepository, OrdersRepository>();
            services.AddScoped<IOrderDeleteOnlyRepository, OrdersRepository>();
        }

        private static void AddSupplierProducts(IServiceCollection services)
        {
            services.AddScoped<ISupplierProductWriteOnlyRepository, SupplierProductRepository>();
            services.AddScoped<ISupplierProductReadOnlyRepository, SupplierProductRepository>();
        }
    }
}
