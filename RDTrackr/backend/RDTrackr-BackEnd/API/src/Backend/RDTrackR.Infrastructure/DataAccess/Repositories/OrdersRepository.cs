using Microsoft.EntityFrameworkCore;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories.Orders;
using RDTrackR.Infrastructure.DataAccess;

namespace RDTrackR.Infrastructure.DataAccess.Repositories
{
    public class OrdersRepository :
        IOrderWriteOnlyRepository,
        IOrderReadOnlyRepository,
        IOrderDeleteOnlyRepository
    {
        private readonly RDTrackRDbContext _db;

        public OrdersRepository(RDTrackRDbContext db)
        {
            _db = db;
        }

        public async Task Add(Order order)
        {
            await _db.Orders.AddAsync(order);
        }

        public async Task Delete(Order order)
        {
            _db.Orders.Remove(order);
        }

        public async Task<List<Order>> GetAll(long organizationId)
        {
            return await _db.Orders
                .AsNoTracking()
                .Include(o => o.Items)
                .Where(o => o.OrganizationId == organizationId)
                .OrderByDescending(o => o.Id)
                .ToListAsync();
        }

        public async Task<Order?> GetById(long id)
        {
            return await _db.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task Update(Order order)
        {
            _db.Orders.Update(order);
        }
    }
}
