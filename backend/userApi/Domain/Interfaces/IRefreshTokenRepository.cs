using System;
using System.Collections.Generic;

public interface IRefreshTokenRepository
{
    void Add(userApi.Domain.Entities.RefreshToken token);
    userApi.Domain.Entities.RefreshToken? GetByTokenHash(string tokenHash);
    List<userApi.Domain.Entities.RefreshToken> GetByUserId(int userId);
    void Update(userApi.Domain.Entities.RefreshToken token);
}
