using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using developerSlate.Data;
using developerSlate.Models.Domain;

namespace developerSlate.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers([FromQuery] string? search, [FromQuery] string? role)
    {
        var query = _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .ThenInclude(r => r.Permissions)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(u => u.Username.ToLower().Contains(s) ||
                                     u.DisplayName.ToLower().Contains(s) ||
                                     u.Email.ToLower().Contains(s));
        }

        if (!string.IsNullOrWhiteSpace(role))
        {
            var rName = role.Trim().ToLower();
            query = query.Where(u => u.UserRoles.Any(ur => ur.Role != null && ur.Role.Name.ToLower() == rName));
        }

        var users = await query
            .OrderByDescending(u => u.Reputation)
            .ToListAsync();

        var result = users.Select(u =>
        {
            var assignedRoles = u.UserRoles
                .Where(ur => ur.Role != null)
                .Select(ur => new
                {
                    id = ur.Role!.Id,
                    name = ur.Role.Name,
                    isSystemRole = ur.Role.IsSystemRole,
                    assignedAt = ur.AssignedAt
                })
                .ToList();

            // Compute effective screen permissions aggregated across all roles
            var permMap = AppScreens.BuildPermissionMap(u.UserRoles);
            var permissionsMap = permMap.ToDictionary(
                kv => kv.Key,
                kv => (object)new { canRead = kv.Value.CanRead, canWrite = kv.Value.CanWrite });

            return new
            {
                id = u.Id,
                username = u.Username,
                displayName = u.DisplayName,
                email = u.Email,
                avatarUrl = u.AvatarUrl,
                title = u.Title,
                reputation = u.Reputation,
                solvedCount = u.SolvedCount,
                githubHandle = u.GithubHandle,
                location = u.Location,
                isOnline = u.IsOnline,
                lastActiveAt = u.LastActiveAt,
                createdAt = u.CreatedAt,
                roles = assignedRoles,
                effectivePermissions = permissionsMap
            };
        });

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetUserById(Guid id)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .ThenInclude(r => r.Permissions)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null) return NotFound(new { message = "User not found." });

        var assignedRoles = user.UserRoles
            .Where(ur => ur.Role != null)
            .Select(ur => new
            {
                id = ur.Role!.Id,
                name = ur.Role.Name,
                isSystemRole = ur.Role.IsSystemRole,
                assignedAt = ur.AssignedAt
            })
            .ToList();

        var permMap2 = AppScreens.BuildPermissionMap(user.UserRoles);
        var permissionsMap = permMap2.ToDictionary(
            kv => kv.Key,
            kv => (object)new { canRead = kv.Value.CanRead, canWrite = kv.Value.CanWrite });

        return Ok(new
        {
            id = user.Id,
            username = user.Username,
            displayName = user.DisplayName,
            email = user.Email,
            avatarUrl = user.AvatarUrl,
            title = user.Title,
            reputation = user.Reputation,
            solvedCount = user.SolvedCount,
            githubHandle = user.GithubHandle,
            location = user.Location,
            isOnline = user.IsOnline,
            lastActiveAt = user.LastActiveAt,
            roles = assignedRoles,
            effectivePermissions = permissionsMap
        });
    }

    [HttpPut("{userId:guid}/roles")]
    public async Task<IActionResult> AssignUserRoles(Guid userId, [FromBody] AssignUserRolesDto dto)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return NotFound(new { message = "User not found." });

        // Remove current roles
        _context.UserRoles.RemoveRange(user.UserRoles);

        // Add selected roles
        if (dto.RoleIds != null && dto.RoleIds.Count > 0)
        {
            var validRoleIds = await _context.Roles
                .Where(r => dto.RoleIds.Contains(r.Id))
                .Select(r => r.Id)
                .ToListAsync();

            foreach (var roleId in validRoleIds)
            {
                _context.UserRoles.Add(new UserRole
                {
                    UserId = user.Id,
                    RoleId = roleId,
                    AssignedAt = DateTime.UtcNow
                });
            }
        }

        await _context.SaveChangesAsync();

        // Reload user with updated roles
        var updatedUser = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .ThenInclude(r => r.Permissions)
            .FirstAsync(u => u.Id == userId);

        var assignedRoles = updatedUser.UserRoles
            .Where(ur => ur.Role != null)
            .Select(ur => new
            {
                id = ur.Role!.Id,
                name = ur.Role.Name,
                isSystemRole = ur.Role.IsSystemRole,
                assignedAt = ur.AssignedAt
            })
            .ToList();

        var permMap3 = AppScreens.BuildPermissionMap(updatedUser.UserRoles);
        var permissionsMap = permMap3.ToDictionary(
            kv => kv.Key,
            kv => (object)new { canRead = kv.Value.CanRead, canWrite = kv.Value.CanWrite });

        return Ok(new
        {
            success = true,
            userId = user.Id,
            username = user.Username,
            roles = assignedRoles,
            effectivePermissions = permissionsMap
        });
    }
}

public class AssignUserRolesDto
{
    public List<Guid> RoleIds { get; set; } = new List<Guid>();
}
