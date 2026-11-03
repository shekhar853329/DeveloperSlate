using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using developerSlate.Data;
using developerSlate.Models.Domain;

namespace developerSlate.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RolesController : ControllerBase
{
    private readonly AppDbContext _context;

    public RolesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetRoles()
    {
        var roles = await _context.Roles
            .Include(r => r.Permissions)
            .Include(r => r.UserRoles)
            .OrderBy(r => r.IsSystemRole ? 0 : 1)
            .ThenBy(r => r.Name)
            .ToListAsync();

        var result = roles.Select(r => new
        {
            id = r.Id,
            name = r.Name,
            description = r.Description,
            isSystemRole = r.IsSystemRole,
            createdAt = r.CreatedAt,
            userCount = r.UserRoles.Count,
            permissions = r.Permissions.Select(p => new
            {
                id = p.Id,
                screenKey = p.ScreenKey,
                screenName = p.ScreenName,
                screenCategory = p.ScreenCategory,
                description = p.Description,
                canRead = p.CanRead,
                canWrite = p.CanWrite
            })
        });

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetRole(Guid id)
    {
        var role = await _context.Roles
            .Include(r => r.Permissions)
            .Include(r => r.UserRoles)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (role == null) return NotFound(new { message = "Role not found." });

        return Ok(new
        {
            id = role.Id,
            name = role.Name,
            description = role.Description,
            isSystemRole = role.IsSystemRole,
            createdAt = role.CreatedAt,
            userCount = role.UserRoles.Count,
            permissions = role.Permissions.Select(p => new
            {
                id = p.Id,
                screenKey = p.ScreenKey,
                screenName = p.ScreenName,
                screenCategory = p.ScreenCategory,
                description = p.Description,
                canRead = p.CanRead,
                canWrite = p.CanWrite
            })
        });
    }

    [HttpGet("screens")]
    public IActionResult GetAvailableScreens()
    {
        var screens = AppScreens.All.Select(s => new
        {
            key = s.Key,
            name = s.Name,
            category = s.Category,
            description = s.Description
        });
        return Ok(screens);
    }

    [HttpPost]
    public async Task<IActionResult> CreateRole([FromBody] CreateRoleDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { message = "Role name is required." });
        }

        var trimmedName = dto.Name.Trim();
        if (await _context.Roles.AnyAsync(r => r.Name.ToLower() == trimmedName.ToLower()))
        {
            return Conflict(new { message = "A role with this name already exists." });
        }

        var role = new Role
        {
            Name = trimmedName,
            Description = dto.Description?.Trim() ?? string.Empty,
            IsSystemRole = false
        };

        _context.Roles.Add(role);

        // Populate permissions
        var permissionMap = dto.Permissions?.ToDictionary(p => p.ScreenKey, StringComparer.OrdinalIgnoreCase)
                            ?? new Dictionary<string, ScreenPermissionInputDto>(StringComparer.OrdinalIgnoreCase);

        foreach (var screen in AppScreens.All)
        {
            bool canRead = true;
            bool canWrite = false;

            if (permissionMap.TryGetValue(screen.Key, out var inputPerm))
            {
                canRead = inputPerm.CanRead;
                canWrite = inputPerm.CanWrite;
            }

            role.Permissions.Add(new RoleScreenPermission
            {
                RoleId = role.Id,
                ScreenKey = screen.Key,
                ScreenName = screen.Name,
                ScreenCategory = screen.Category,
                Description = screen.Description,
                CanRead = canRead,
                CanWrite = canWrite
            });
        }

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRole), new { id = role.Id }, new
        {
            id = role.Id,
            name = role.Name,
            description = role.Description,
            isSystemRole = role.IsSystemRole,
            userCount = 0,
            permissions = role.Permissions.Select(p => new
            {
                id = p.Id,
                screenKey = p.ScreenKey,
                screenName = p.ScreenName,
                screenCategory = p.ScreenCategory,
                description = p.Description,
                canRead = p.CanRead,
                canWrite = p.CanWrite
            })
        });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UpdateRoleDto dto)
    {
        var role = await _context.Roles
            .Include(r => r.Permissions)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (role == null) return NotFound(new { message = "Role not found." });

        if (!string.IsNullOrWhiteSpace(dto.Name) && !role.IsSystemRole)
        {
            var trimmedName = dto.Name.Trim();
            if (await _context.Roles.AnyAsync(r => r.Id != id && r.Name.ToLower() == trimmedName.ToLower()))
            {
                return Conflict(new { message = "Another role with this name already exists." });
            }
            role.Name = trimmedName;
        }

        if (dto.Description != null)
        {
            role.Description = dto.Description.Trim();
        }

        // Update Screen Permissions
        if (dto.Permissions != null && dto.Permissions.Count > 0)
        {
            var inputMap = dto.Permissions.ToDictionary(p => p.ScreenKey, StringComparer.OrdinalIgnoreCase);

            foreach (var perm in role.Permissions)
            {
                if (inputMap.TryGetValue(perm.ScreenKey, out var input))
                {
                    perm.CanRead = input.CanRead;
                    perm.CanWrite = input.CanWrite;
                }
            }

            // Ensure any newly cataloged screens are also added
            var existingKeys = role.Permissions.Select(p => p.ScreenKey).ToHashSet(StringComparer.OrdinalIgnoreCase);
            foreach (var screen in AppScreens.All)
            {
                if (!existingKeys.Contains(screen.Key))
                {
                    bool canRead = false;
                    bool canWrite = false;
                    if (inputMap.TryGetValue(screen.Key, out var input))
                    {
                        canRead = input.CanRead;
                        canWrite = input.CanWrite;
                    }

                    role.Permissions.Add(new RoleScreenPermission
                    {
                        RoleId = role.Id,
                        ScreenKey = screen.Key,
                        ScreenName = screen.Name,
                        ScreenCategory = screen.Category,
                        Description = screen.Description,
                        CanRead = canRead,
                        CanWrite = canWrite
                    });
                }
            }
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = role.Id,
            name = role.Name,
            description = role.Description,
            isSystemRole = role.IsSystemRole,
            permissions = role.Permissions.Select(p => new
            {
                id = p.Id,
                screenKey = p.ScreenKey,
                screenName = p.ScreenName,
                screenCategory = p.ScreenCategory,
                description = p.Description,
                canRead = p.CanRead,
                canWrite = p.CanWrite
            })
        });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteRole(Guid id)
    {
        var role = await _context.Roles
            .Include(r => r.UserRoles)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (role == null) return NotFound(new { message = "Role not found." });

        if (role.IsSystemRole)
        {
            return BadRequest(new { message = "System built-in roles cannot be deleted." });
        }

        _context.Roles.Remove(role);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = $"Role '{role.Name}' was deleted." });
    }
}

public class CreateRoleDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<ScreenPermissionInputDto>? Permissions { get; set; }
}

public class UpdateRoleDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public List<ScreenPermissionInputDto>? Permissions { get; set; }
}

public class ScreenPermissionInputDto
{
    public string ScreenKey { get; set; } = string.Empty;
    public bool CanRead { get; set; } = true;
    public bool CanWrite { get; set; } = false;
}

