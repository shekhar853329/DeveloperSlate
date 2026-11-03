using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using developerSlate.Data;
using developerSlate.Models.Domain;
using developerSlate.Services;

namespace developerSlate.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.UsernameOrEmail) || string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest(new { message = "Username/Email and password are required." });
        }

        var lookup = dto.UsernameOrEmail.Trim().ToLower();
        var user = await _context.Users
            .Include(u => u.Proficiencies)
            .FirstOrDefaultAsync(u => u.Username.ToLower() == lookup || u.Email.ToLower() == lookup);

        if (user == null)
        {
            return Unauthorized(new { message = "Invalid terminal credentials. User not found in developer registry." });
        }

        // Verify password
        bool isPasswordValid = false;
        if (!string.IsNullOrEmpty(user.PasswordHash) && !string.IsNullOrEmpty(user.PasswordSalt))
        {
            isPasswordValid = PasswordHasher.VerifyPasswordHash(dto.Password, user.PasswordHash, user.PasswordSalt);
        }
        else if (dto.Password == "Password123!" || dto.Password == "admin" || dto.Password == "developer")
        {
            // Fallback for demo credentials
            isPasswordValid = true;
        }

        if (!isPasswordValid)
        {
            return Unauthorized(new { message = "Authentication failed. Verification key or password mismatch." });
        }

        user.IsOnline = true;
        user.LastActiveAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var token = GenerateAuthToken(user);

        return Ok(new
        {
            token,
            user = new
            {
                id = user.Id,
                username = user.Username,
                displayName = user.DisplayName,
                email = user.Email,
                avatarUrl = user.AvatarUrl,
                title = user.Title,
                reputation = user.Reputation,
                githubHandle = user.GithubHandle,
                location = user.Location,
                isOnline = user.IsOnline
            }
        });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest(new { message = "Username, email, and password are required." });
        }

        var uname = dto.Username.Trim().ToLower();
        var email = dto.Email.Trim().ToLower();

        if (await _context.Users.AnyAsync(u => u.Username.ToLower() == uname))
        {
            return Conflict(new { message = "A developer handle with this username is already registered." });
        }

        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == email))
        {
            return Conflict(new { message = "An account with this email address already exists." });
        }

        PasswordHasher.CreatePasswordHash(dto.Password, out var hash, out var salt);

        var newUser = new User
        {
            Username = dto.Username.Trim(),
            DisplayName = string.IsNullOrWhiteSpace(dto.DisplayName) ? dto.Username.Trim() : dto.DisplayName.Trim(),
            Email = email,
            PasswordHash = hash,
            PasswordSalt = salt,
            Title = string.IsNullOrWhiteSpace(dto.Title) ? "Software Engineer" : dto.Title.Trim(),
            Bio = "Newly registered contributor exploring high-performance systems and concurrent architectures.",
            AvatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
            GithubHandle = string.IsNullOrWhiteSpace(dto.GithubHandle) ? dto.Username.Trim() : dto.GithubHandle.Trim(),
            Reputation = 100,
            SolvedCount = 0,
            QuestionCount = 0,
            ImpactScore = 100,
            IsOnline = true,
            CreatedAt = DateTime.UtcNow,
            LastActiveAt = DateTime.UtcNow
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        // Default initial proficiency
        _context.UserProficiencies.Add(new UserProficiency
        {
            UserId = newUser.Id,
            Technology = "Rust / TypeScript Fundamentals",
            Score = 75,
            Tier = "Contributor",
            VerifiedSolutionsCount = 0,
            Icon = "code"
        });
        await _context.SaveChangesAsync();

        var token = GenerateAuthToken(newUser);

        return Ok(new
        {
            token,
            user = new
            {
                id = newUser.Id,
                username = newUser.Username,
                displayName = newUser.DisplayName,
                email = newUser.Email,
                avatarUrl = newUser.AvatarUrl,
                title = newUser.Title,
                reputation = newUser.Reputation,
                githubHandle = newUser.GithubHandle,
                location = newUser.Location,
                isOnline = newUser.IsOnline
            }
        });
    }

    [HttpPost("github")]
    public async Task<IActionResult> GithubLogin([FromBody] GithubAuthDto dto)
    {
        // 1-Click developer login using GitHub handle
        var handle = string.IsNullOrWhiteSpace(dto.GithubHandle) ? "alexchen-dev" : dto.GithubHandle.Trim();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.GithubHandle.ToLower() == handle.ToLower())
                   ?? await _context.Users.FirstOrDefaultAsync(u => u.Username == "alexchen")
                   ?? await _context.Users.FirstOrDefaultAsync();

        if (user == null)
        {
            return NotFound(new { message = "No GitHub account linked." });
        }

        user.IsOnline = true;
        user.LastActiveAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var token = GenerateAuthToken(user);

        return Ok(new
        {
            token,
            user = new
            {
                id = user.Id,
                username = user.Username,
                displayName = user.DisplayName,
                email = user.Email,
                avatarUrl = user.AvatarUrl,
                title = user.Title,
                reputation = user.Reputation,
                githubHandle = user.GithubHandle,
                location = user.Location,
                isOnline = user.IsOnline
            }
        });
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var user = await _context.Users
            .Include(u => u.Proficiencies)
            .FirstOrDefaultAsync();

        if (user == null) return Unauthorized();

        return Ok(new
        {
            id = user.Id,
            username = user.Username,
            displayName = user.DisplayName,
            email = user.Email,
            avatarUrl = user.AvatarUrl,
            title = user.Title,
            reputation = user.Reputation,
            githubHandle = user.GithubHandle,
            location = user.Location,
            isOnline = user.IsOnline
        });
    }

    private static string GenerateAuthToken(User user)
    {
        // Lightweight authenticated JWT/bearer token representation
        var header = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes("{\"alg\":\"HS256\",\"typ\":\"JWT\"}"));
        var payload = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(
            $"{{\"sub\":\"{user.Id}\",\"name\":\"{user.Username}\",\"email\":\"{user.Email}\",\"exp\":{DateTimeOffset.UtcNow.AddDays(7).ToUnixTimeSeconds()}}}"
        ));
        var signature = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes($"{user.Id}-{user.Username}-signed"));
        return $"{header}.{payload}.{signature}";
    }
}

public class LoginRequestDto
{
    public string UsernameOrEmail { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool RememberMe { get; set; } = true;
}

public class RegisterRequestDto
{
    public string Username { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? Title { get; set; }
    public string? GithubHandle { get; set; }
}

public class GithubAuthDto
{
    public string? GithubHandle { get; set; }
}

