using Microsoft.Extensions.Configuration;
using RDTrackR.Domain.Enums;

namespace RDTrackR.Infrastructure.Extensions
{
    public static class ConfigurationExtensions
    {
        public static bool IsUnitTestEnviroment(this IConfiguration configuration)
        {
            return configuration.GetValue<bool>("InMemoryTest");
        }
        public static DatabaseType DatabaseType(this IConfiguration configuration)
        {
            var databaseType = configuration.GetConnectionString("DatabaseType");

            return (DatabaseType)Enum.Parse(typeof(DatabaseType), databaseType!);
        }

        public static string ConnectionString(this IConfiguration configuration)
        {
            var databaseType = configuration.DatabaseType();

            if (databaseType == Domain.Enums.DatabaseType.SqlServer)
                return configuration.GetConnectionString("ConnectionSqlServer")!;
            else if (databaseType == Domain.Enums.DatabaseType.SqlServer)
            {
                return configuration.GetConnectionString("ConnectionPostgreeSQL")!;
            }
            else
                return "";
            

        }
    }
}
