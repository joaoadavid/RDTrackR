using RDTrackR.Domain.Entities;

namespace RDTrackR.Domain.Security.Tokens
{
    public interface IAccessTokenGenerator
    {
        public string Generate(User user);
        //string GenerateWithTokenId(Guid userIdentifier, string tokenId);
        string GenerateWithTokenId(User user, string tokenId);

    }
}
