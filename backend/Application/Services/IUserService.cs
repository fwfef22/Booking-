using Application.DTOs;

namespace Application.Services;

public interface IUserService
{
    Task<UserDto> GetUserByIdAsync(string id);
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
}
