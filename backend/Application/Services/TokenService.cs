using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Domain;

namespace Application.Services;

public interface ITokenService
{
    string GenerateToken(User user);
}

public class TokenService : ITokenService
{
    private readonly string _secretKey;
    private readonly int _expirationMinutes;

    public TokenService(string secretKey = "your-secret-key-change-in-production-min-32-chars", int expirationMinutes = 43200)
    {
        _secretKey = secretKey;
        _expirationMinutes = expirationMinutes;
    }

    public string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {    
            new Claim(JwtRegisteredClaimNames.Sub, user.User_ID),
            new Claim(JwtRegisteredClaimNames.FamilyName, user.Last_Name),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())


            //new Claim(ClaimTypes.NameIdentifier, user.User_Id),
            //new Claim(ClaimTypes.Name, user.Last_Name + " " + user.First_Name),
            //new Claim(ClaimTypes.Email, user.Email)
        };

        var token = new JwtSecurityToken(
            issuer: "RentalApp",
            audience: "RentalAppUsers",
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
