using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using developerSlate.Data;
using developerSlate.Models.Domain;
using developerSlate.Services;

namespace developerSlate.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("AuthPolicy")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _httpClientFactory;

    public AuthController(AppDbContext context, IConfiguration config, IHttpClientFactory httpClientFactory)
    {
        _context = context;
        _config = config;
        _httpClientFactory = httpClientFactory;
    }

    // ─── Login ───────────────────────────────────────────────────────────────

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.UsernameOrEmail) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { message = "Username/Email and password are required." });

        var lookup = dto.UsernameOrEmail.Trim().ToLower();
        var user = await _context.Users
            .Include(u => u.Proficiencies)
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .ThenInclude(r => r.Permissions)
            .FirstOrDefaultAsync(u => u.Username.ToLower() == lookup || u.Email.ToLower() == lookup);

        if (user == null)
            return Unauthorized(new { message = "Invalid terminal credentials. User not found in developer registry." });

        if (string.IsNullOrEmpty(user.PasswordHash) || string.IsNullOrEmpty(user.PasswordSalt))
            return Unauthorized(new { message = "Account has no password set. Use GitHub OAuth to sign in." });

        bool isPasswordValid = PasswordHasher.VerifyPasswordHash(dto.Password, user.PasswordHash, user.PasswordSalt);
        if (!isPasswordValid)
            return Unauthorized(new { message = "Authentication failed. Verification key or password mismatch." });

        user.IsOnline = true;
        user.LastActiveAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var accessToken = GenerateJwt(user);
        var refreshToken = await CreateRefreshTokenAsync(user.Id);

        return Ok(new { token = accessToken, refreshToken = refreshToken.Token, user = BuildUserPayload(user) });
    }

    // ─── Register ────────────────────────────────────────────────────────────

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { message = "Username, email, and password are required." });

        var passwordError = ValidatePasswordStrength(dto.Password);
        if (passwordError != null)
            return BadRequest(new { message = passwordError });

        var uname = dto.Username.Trim().ToLower();
        var email = dto.Email.Trim().ToLower();

        if (await _context.Users.AnyAsync(u => u.Username.ToLower() == uname))
            return Conflict(new { message = "A developer handle with this username is already registered." });

        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == email))
            return Conflict(new { message = "An account with this email address already exists." });

        PasswordHasher.CreatePasswordHash(dto.Password, out var hash, out var salt);

        var newUser = new User
        {
            Username = dto.Username.Trim(),
            DisplayName = string.IsNullOrWhiteSpace(dto.DisplayName) ? dto.Username.Trim() : dto.DisplayName.Trim(),
            Email = email,
            PasswordHash = hash,
            PasswordSalt = salt,
            Title = string.IsNullOrWhiteSpace(dto.Title) ? (_config["Registration:DefaultTitle"] ?? "Software Engineer") : dto.Title.Trim(),
            Bio = _config["Registration:DefaultBio"] ?? "Newly registered contributor.",
            AvatarUrl = _config["Registration:DefaultAvatarUrl"] ?? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
            GithubHandle = string.IsNullOrWhiteSpace(dto.GithubHandle) ? dto.Username.Trim() : dto.GithubHandle.Trim(),
            Reputation = _config.GetValue<int>("Registration:DefaultReputation", 100),
            SolvedCount = 0,
            QuestionCount = 0,
            ImpactScore = _config.GetValue<int>("Registration:DefaultImpactScore", 100),
            IsOnline = true,
            CreatedAt = DateTime.UtcNow,
            LastActiveAt = DateTime.UtcNow
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        _context.UserProficiencies.Add(new UserProficiency
        {
            UserId = newUser.Id,
            Technology = _config["Registration:DefaultProficiency:Technology"] ?? "Rust / TypeScript Fundamentals",
            Score = _config.GetValue<int>("Registration:DefaultProficiency:Score", 75),
            Tier = _config["Registration:DefaultProficiency:Tier"] ?? "Contributor",
            VerifiedSolutionsCount = 0,
            Icon = _config["Registration:DefaultProficiency:Icon"] ?? "code"
        });

        var devRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Developer");
        if (devRole != null)
            _context.UserRoles.Add(new UserRole { UserId = newUser.Id, RoleId = devRole.Id });

        await _context.SaveChangesAsync();

        var reloadedUser = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .ThenInclude(r => r.Permissions)
            .FirstAsync(u => u.Id == newUser.Id);

        var accessToken = GenerateJwt(reloadedUser);
        var refreshToken = await CreateRefreshTokenAsync(reloadedUser.Id);

        return Ok(new { token = accessToken, refreshToken = refreshToken.Token, user = BuildUserPayload(reloadedUser) });
    }

    // ─── GitHub OAuth 2.0 Callback ────────────────────────────────────────────

    [HttpPost("github/callback")]
    public async Task<IActionResult> GithubCallback([FromBody] GithubCallbackDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Code))
            return BadRequest(new { message = "Authorization code is required." });

        var clientId = _config["GitHub:ClientId"];
        var clientSecret = _config["GitHub:ClientSecret"];

        if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
            return StatusCode(503, new { message = "GitHub OAuth is not configured on this server." });

        var httpClient = _httpClientFactory.CreateClient("GitHub");

        // Exchange code for access token
        var tokenRequest = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["client_id"] = clientId,
            ["client_secret"] = clientSecret,
            ["code"] = dto.Code
        });

        var tokenResponse = await httpClient.PostAsync("https://github.com/login/oauth/access_token", tokenRequest);
        if (!tokenResponse.IsSuccessStatusCode)
            return StatusCode(502, new { message = "Failed to exchange code with GitHub." });

        var tokenContent = await tokenResponse.Content.ReadAsStringAsync();
        string? githubAccessToken = null;

        // GitHub returns JSON when Accept: application/json is set
        try
        {
            var tokenJson = JsonDocument.Parse(tokenContent);
            githubAccessToken = tokenJson.RootElement.GetProperty("access_token").GetString();
        }
        catch
        {
            // fallback: parse query string format
            var parts = tokenContent.Split('&');
            foreach (var part in parts)
            {
                var kv = part.Split('=');
                if (kv.Length == 2 && kv[0] == "access_token")
                {
                    githubAccessToken = kv[1];
                    break;
                }
            }
        }

        if (string.IsNullOrWhiteSpace(githubAccessToken))
            return StatusCode(502, new { message = "GitHub did not return an access token." });

        // Fetch GitHub user profile
        var profileRequest = new HttpRequestMessage(HttpMethod.Get, "https://api.github.com/user");
        profileRequest.Headers.Add("Authorization", $"Bearer {githubAccessToken}");
        var profileResponse = await httpClient.SendAsync(profileRequest);

        if (!profileResponse.IsSuccessStatusCode)
            return StatusCode(502, new { message = "Failed to fetch GitHub user profile." });

        var profileContent = await profileResponse.Content.ReadAsStringAsync();
        var profileJson = JsonDocument.Parse(profileContent);
        var root = profileJson.RootElement;

        long githubId = root.GetProperty("id").GetInt64();
        string githubLogin = root.TryGetProperty("login", out var loginProp) ? loginProp.GetString() ?? string.Empty : string.Empty;
        string githubEmail = root.TryGetProperty("email", out var emailProp) ? emailProp.GetString() ?? string.Empty : string.Empty;
        string avatarUrl = root.TryGetProperty("avatar_url", out var avatarProp) ? avatarProp.GetString() ?? string.Empty : string.Empty;
        string displayName = root.TryGetProperty("name", out var nameProp) ? nameProp.GetString() ?? githubLogin : githubLogin;

        // Match or create user by GithubId
        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .ThenInclude(r => r.Permissions)
            .FirstOrDefaultAsync(u => u.GithubId == githubId);

        if (user == null)
        {
            // Try match by GithubHandle
            if (!string.IsNullOrEmpty(githubLogin))
            {
                user = await _context.Users
                    .Include(u => u.UserRoles)
                        .ThenInclude(ur => ur.Role)
                        .ThenInclude(r => r.Permissions)
                    .FirstOrDefaultAsync(u => u.GithubHandle.ToLower() == githubLogin.ToLower());
            }
        }

        if (user == null)
        {
            // Create new user from GitHub profile
            var usernameBase = githubLogin.ToLower().Replace("-", "_");
            var username = usernameBase;
            var counter = 1;
            while (await _context.Users.AnyAsync(u => u.Username.ToLower() == username))
                username = $"{usernameBase}{counter++}";

            user = new User
            {
                Username = username,
                DisplayName = displayName,
                Email = githubEmail,
                GithubHandle = githubLogin,
                GithubId = githubId,
                AvatarUrl = avatarUrl,
                Title = "Software Engineer",
                Bio = "GitHub OAuth user.",
                Reputation = 100,
                IsOnline = true,
                CreatedAt = DateTime.UtcNow,
                LastActiveAt = DateTime.UtcNow
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var devRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Developer");
            if (devRole != null)
                _context.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = devRole.Id });
            await _context.SaveChangesAsync();

            user = await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r.Permissions)
                .FirstAsync(u => u.Id == user.Id);
        }
        else
        {
            // Update GithubId if matched by handle
            user.GithubId = githubId;
            user.GithubHandle = githubLogin;
            if (!string.IsNullOrWhiteSpace(avatarUrl)) user.AvatarUrl = avatarUrl;
        }

        user.IsOnline = true;
        user.LastActiveAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var accessToken = GenerateJwt(user);
        var refreshToken = await CreateRefreshTokenAsync(user.Id);

        return Ok(new { token = accessToken, refreshToken = refreshToken.Token, user = BuildUserPayload(user) });
    }

    // ─── Deprecated GitHub endpoint ───────────────────────────────────────────

    [HttpPost("github")]
    public IActionResult GithubLoginDeprecated([FromBody] object? _ = null)
    {
        return StatusCode(410, new { message = "This endpoint is deprecated. Use POST /api/auth/github/callback with a real OAuth code." });
    }

    // ─── Get Current User ─────────────────────────────────────────────────────

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "Invalid token." });

        var user = await _context.Users
            .Include(u => u.Proficiencies)
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .ThenInclude(r => r.Permissions)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return Unauthorized(new { message = "User not found." });

        return Ok(BuildUserPayload(user));
    }

    // ─── Refresh Token ────────────────────────────────────────────────────────

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.RefreshToken))
            return BadRequest(new { message = "Refresh token is required." });

        var storedToken = await _context.RefreshTokens
            .Include(rt => rt.User)
                .ThenInclude(u => u!.UserRoles)
                    .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r.Permissions)
            .FirstOrDefaultAsync(rt => rt.Token == dto.RefreshToken);

        if (storedToken == null || !storedToken.IsActive)
            return Unauthorized(new { message = "Invalid or expired refresh token." });

        // Revoke old token (rotation)
        storedToken.RevokedAt = DateTime.UtcNow;

        // Issue new pair
        var user = storedToken.User!;
        var newAccessToken = GenerateJwt(user);
        var newRefreshToken = await CreateRefreshTokenAsync(user.Id);

        return Ok(new { token = newAccessToken, refreshToken = newRefreshToken.Token, user = BuildUserPayload(user) });
    }

    // ─── Logout ───────────────────────────────────────────────────────────────

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout([FromBody] RefreshRequestDto dto)
    {
        if (!string.IsNullOrWhiteSpace(dto.RefreshToken))
        {
            var storedToken = await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.Token == dto.RefreshToken);

            if (storedToken != null && storedToken.IsActive)
                storedToken.RevokedAt = DateTime.UtcNow;
        }

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

        if (Guid.TryParse(userIdClaim, out var userId))
        {
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                user.IsOnline = false;
                user.LastActiveAt = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Logged out successfully." });
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private string GenerateJwt(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var expiryMinutes = _config.GetValue<int>("Jwt:AccessTokenExpiryMinutes", 60);

        var roles = user.UserRoles
            .Where(ur => ur.Role != null)
            .Select(ur => ur.Role!.Name)
            .ToList();

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(JwtRegisteredClaimNames.UniqueName, user.Username),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
        };

        foreach (var role in roles)
            claims.Add(new Claim(ClaimTypes.Role, role));

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<RefreshToken> CreateRefreshTokenAsync(Guid userId)
    {
        var expiryDays = _config.GetValue<int>("Jwt:RefreshTokenExpiryDays", 7);
        var tokenBytes = RandomNumberGenerator.GetBytes(64);
        var tokenString = Convert.ToHexString(tokenBytes).ToLower();

        var refreshToken = new RefreshToken
        {
            UserId = userId,
            Token = tokenString,
            ExpiresAt = DateTime.UtcNow.AddDays(expiryDays),
            CreatedAt = DateTime.UtcNow
        };

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();
        return refreshToken;
    }

    private static string? ValidatePasswordStrength(string password)
    {
        if (password.Length < 8)
            return "Password must be at least 8 characters long.";
        if (!password.Any(char.IsUpper))
            return "Password must contain at least one uppercase letter.";
        if (!password.Any(char.IsLower))
            return "Password must contain at least one lowercase letter.";
        if (!password.Any(char.IsDigit))
            return "Password must contain at least one digit.";
        if (!password.Any(c => !char.IsLetterOrDigit(c)))
            return "Password must contain at least one special character.";
        return null;
    }

    private static object BuildUserPayload(User user)
    {
        var roles = user.UserRoles
            .Where(ur => ur.Role != null)
            .Select(ur => ur.Role!.Name)
            .ToList();

        if (roles.Count == 0)
            roles.Add("Developer");

        // Pass the resolved roles list (including any fallback) into BuildPermissionMap
        // so the permission map and the roles list are always consistent.
        var permMap = AppScreens.BuildPermissionMap(user.UserRoles, roles);
        var permissionsMap = permMap.ToDictionary(
            kv => kv.Key,
            kv => (object)new { canRead = kv.Value.CanRead, canWrite = kv.Value.CanWrite });

        return new
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
            isOnline = user.IsOnline,
            roles,
            permissions = permissionsMap
        };
    }
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

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

public class GithubCallbackDto
{
    public string Code { get; set; } = string.Empty;
}

public class RefreshRequestDto
{
    public string RefreshToken { get; set; } = string.Empty;
}
