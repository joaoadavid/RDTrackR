using Microsoft.EntityFrameworkCore;
using MyRecipeBook.Domain.Repositories.User;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories.Users;

namespace RDTrackR.Infrastructure.DataAccess.Repositories
{
    public class UserRepository : IUserReadOnlyRepository, IUserWriteOnlyRepository, IUserUpdateOnlyRepository, IUserDeleteOnlyRepository
    {
        private readonly RDTrackRDbContext _dbContext;

        public UserRepository(RDTrackRDbContext dbContext) => _dbContext = dbContext;

        public async Task Add(User user) => await _dbContext.Users.AddAsync(user);

        public async Task<bool> ExistsActiveUserWithEmail(string email) => await _dbContext.Users.AnyAsync(user => user.Email.Equals(email) && user.Active);

        public async Task<User?> GetByEmailAndPassword(string email, string password)
        {
            return await _dbContext.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(user => user.Email.Equals(email)
                && user.Password.Equals(password) && user.Active);
        }

        public async Task<bool> ExistActiveUserWithIdenfier(Guid userIdentifier) => await _dbContext.Users.AnyAsync(user => user.UserIdentifier.Equals(userIdentifier) && user.Active);

        public async Task<User> GetUserById(long id)
        {
            return await _dbContext.Users
                .FirstAsync(u => u.Id == id);
        }

        public async Task Update(User user) => _dbContext.Users.Update(user);

        public async Task DeleteAccoutn(Guid userIdentifier)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(user => user.UserIdentifier == userIdentifier);

            if (user == null)
                return;

            var users = _dbContext.Users.Where(users => users.UserIdentifier == userIdentifier);

            _dbContext.Users.RemoveRange(users);

            _dbContext.Users.Remove(user);
        }

        public async Task Delete(long userId)
        {
            var user = await _dbContext.Users
                .FirstOrDefaultAsync(x => x.Id == userId);

            if (user == null)
                return;

            _dbContext.Users.Remove(user);
        }

        public async Task<User?> GetByEmail(string email)
        {
            return await _dbContext
                .Users
                .AsNoTracking()
                .FirstOrDefaultAsync(user => user.Active && user.Email.Equals(email));
        }

        public async Task<User?> GetByIdAsync(long id)
        {
            return await _dbContext.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<List<User>> GetAllAsync(User user)
        {
            return await _dbContext.Users
                .Where(u => u.OrganizationId == user.OrganizationId && u.Role == "User" || u.Role == "Admin" && u.Id != user.Id)
                .AsNoTracking()
                .OrderBy(u => u.Name)
                .ToListAsync();
        }

        public async Task<bool> ExistsAnotherUserWithEmail(long id, string email)
        {
            return await _dbContext.Users
                .AnyAsync(u => u.Email == email && u.Id != id);
        }

        public async Task<User?> GetByIdentifier(Guid identifier)
        {
            return await _dbContext.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(user => user.UserIdentifier == identifier && user.Active);
        }


    }
}
