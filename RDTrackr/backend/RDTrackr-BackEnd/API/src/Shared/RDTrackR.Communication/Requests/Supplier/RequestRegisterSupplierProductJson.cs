using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RDTrackR.Communication.Requests.Supplier
{
    public class RequestRegisterSupplierProductJson
    {
        public long SupplierId { get; set; }
        public long ProductId { get; set; }
        public decimal? UnitPrice { get; set; }
        public string SupplierSKU { get; set; }
    }

}
