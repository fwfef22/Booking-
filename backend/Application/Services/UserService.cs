using Application.DTOs;
using Infrastructure.Repositories;
using Domain;

namespace Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _repository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;

    public UserService(IUserRepository repository, IPasswordHasher passwordHasher, ITokenService tokenService, IEmailService emailService)
    {
        _repository = repository;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _emailService = emailService;
    }

    public async Task<UserDto> GetUserByIdAsync(string User_ID)
    {
        var user = await _repository.GetByIdAsync(User_ID);
        if (user == null) return null;
        return new UserDto { User_ID = user.User_ID, First_Name = user.First_Name, Last_Name = user.Last_Name, Email = user.Email };
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        // Validate input
        if (string.IsNullOrWhiteSpace(request.First_Name))
            return new AuthResponse { Success = false, Message = "First Name is required" };

        if (string.IsNullOrWhiteSpace(request.Last_Name))
            return new AuthResponse { Success = false, Message = "Last Name is required" };

        if (string.IsNullOrWhiteSpace(request.Email))
            return new AuthResponse { Success = false, Message = "Email is required" };

        if (string.IsNullOrWhiteSpace(request.Password))
            return new AuthResponse { Success = false, Message = "Password is required" };

        if (string.IsNullOrWhiteSpace(request.Adres_Miasto))
            return new AuthResponse { Success = false, Message = "City is required" };

        if (string.IsNullOrWhiteSpace(request.Adres_Ulica_1))
            return new AuthResponse { Success = false, Message = "Street is required" };

        if (string.IsNullOrWhiteSpace(request.Adres_Budynek))
            return new AuthResponse { Success = false, Message = "Building is required" };

        if (string.IsNullOrWhiteSpace(request.Adres_KodPocztowy))
            return new AuthResponse { Success = false, Message = "Post-Cod is required" };

        if (string.IsNullOrWhiteSpace(request.Phone_Number))
            return new AuthResponse { Success = false, Message = "Phone Number is required" };

        if (request.Password != request.ConfirmPassword)
            return new AuthResponse { Success = false, Message = "Passwords do not match" };

        if (request.Password.Length < 6)
            return new AuthResponse { Success = false, Message = "Password must be at least 6 characters" };


        // Check if email already exists
        if (await _repository.CheckIfEmailExistsAsync(request.Email))
            return new AuthResponse { Success = false, Message = "Email already registered" };

        // Create new user
        var user = new User
        {
            First_Name = request.First_Name,
            Last_Name = request.Last_Name,
            Email = request.Email,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            CreatedAt = DateTime.UtcNow,
            Adres_Miasto = request.Adres_Miasto,
            Adres_Ulica_1 = request.Adres_Ulica_1,
            Adres_Ulica_2 = string.IsNullOrWhiteSpace(request.Adres_Ulica_2) ? string.Empty : request.Adres_Ulica_2,
            Adres_Budynek = request.Adres_Budynek,
            Adres_Pokoj = string.IsNullOrWhiteSpace(request.Adres_Pokoj) ? string.Empty : request.Adres_Pokoj,
            Adres_KodPocztowy = request.Adres_KodPocztowy,
            Phone_Number = request.Phone_Number
        };

        await _repository.AddAsync(user);
        await _repository.SaveChangesAsync();

        var userDto = new UserDto { User_ID = user.User_ID, First_Name = user.First_Name, Last_Name = user.Last_Name, Email = user.Email };
        var token = _tokenService.GenerateToken(user);

        await _emailService.SendRegistrationAsync(user.Email, user.First_Name).ContinueWith(task =>
        {
            if (task.IsFaulted)
                Console.WriteLine($"Failed to send registration email: {task.Exception?.GetBaseException().Message}");
            else
                Console.WriteLine("Registration email sent successfully");
        });

        return new AuthResponse
        {
            Success = true,
            Message = "User registered successfully",
            User = userDto,
            Token = token
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        // Validate input
        if (string.IsNullOrWhiteSpace(request.Email))
            return new AuthResponse { Success = false, Message = "Email is required" };

        if (string.IsNullOrWhiteSpace(request.Password))
            return new AuthResponse { Success = false, Message = "Password is required" };

        // Find user by email
        var users = await _repository.GetAllAsync();
        var user = users.FirstOrDefault(u => u.Email == request.Email);

        if (user == null)
            return new AuthResponse { Success = false, Message = "Invalid email or password" };

        // Verify password
        if (!_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
            return new AuthResponse { Success = false, Message = "Invalid email or password" };

        // Generate token
        var userDto = new UserDto { User_ID = user.User_ID, First_Name = user.First_Name, Last_Name = user.Last_Name, Email = user.Email };
        var token = _tokenService.GenerateToken(user);

        try{
            await _emailService.SendLoginAsync(user.Email, user.First_Name, DateTime.UtcNow);
        Console.WriteLine("Email sent successfully");
        }
        catch (Exception ex){
            Console.WriteLine($"Email failed: {ex.Message}");
        }

        return new AuthResponse
        {
            Success = true,
            Message = "Login successful",
            User = userDto,
            Token = token
        };
    }
}
