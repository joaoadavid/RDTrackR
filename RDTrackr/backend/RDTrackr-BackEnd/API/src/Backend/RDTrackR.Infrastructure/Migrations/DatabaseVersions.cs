namespace RDTrackR.Infrastructure.Migrations
{
    public abstract class DatabaseVersions
    {
        public const int CREATE_ORGANIZATION = 1;
        public const int TABLE_USER = 2;
        public const int TABLE_REFRESH_TOKEN = 3;
        public const int TABLE_USER_FORGOT_PASSWORD = 4;
        public const int TABLE_RDTRACKR_PRODUCTS = 5;
        public const int ADD_PRODUCT_USER_RELATION = 7;
        public const int TABLE_WAREHOUSES = 6;
        public const int TABLE_MOVEMENTS = 7;
        public const int TABLE_STOCKITEMS = 8;
        public const int ALTER_MOVEMENT_TYPE_COLUMN = 9;
        public const int TABLE_SUPPLIERS = 10;
        public const int TABLE_PURCHASE_ORDERS = 11;
        public const int TABLE_AUDIT_LOG = 12;
        public const int ADD_PRODUCT_REPLENISHMENT_FIELDS = 13;
        public const int TABLE_PURCHASE_ORDER_ITEMS = 14;
        public const int TABLE_NOTIFICATIONS = 15;
        public const int ALTER_PURCHASE_ORDERS_NUMBER_TO_IDENTITY = 16;
        public const int ALTER_PURCHASE_ORDERS_STAUTS_TO_INT32 = 17;
        public const int FIX_AUDITLOG_ACTIONTYPE_INT = 18;
        public const int ADD_USER_ROLE_COLUMN = 19;
        public const int ADD_SUPPLIER_PRODUCT = 20;
        public const int ADD_ORDERS = 21;
        public const int ADD_DELETE_CASCADE = 22;
        public const int ADD_WAREHOUSE_TO_PURCHASE_ORDER = 23;
        public const int ALTER_CREATEDON = 24;
        public const int ALTER_QUANTITY = 25;
        public const int ALTER_ORDERS = 26;
    }
}
