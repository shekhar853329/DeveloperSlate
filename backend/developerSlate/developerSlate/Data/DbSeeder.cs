using Microsoft.EntityFrameworkCore;
using developerSlate.Models.Domain;
using developerSlate.Services;

namespace developerSlate.Data;

public static class DbSeeder
{
    /// <summary>
    /// Seeds:
    ///   1. An "Admin" system role with full read/write on every screen.
    ///   2. A default admin user (username: admin, email: admin@developerslate.local).
    ///   3. Assigns the Admin role to that user.
    ///
    /// All operations are idempotent — safe to call on every startup.
    /// Change the default password via appsettings ("Seed:AdminPassword") before first run.
    /// </summary>
    public static async Task SeedAsync(AppDbContext context, IConfiguration config, ILogger logger)
    {
        // ── 1. Admin Role ─────────────────────────────────────────────────────
        var adminRole = await context.Roles
            .Include(r => r.Permissions)
            .FirstOrDefaultAsync(r => r.Name == "Admin");

        if (adminRole == null)
        {
            adminRole = new Role
            {
                Id          = Guid.Parse("00000000-0000-0000-0000-000000000001"), // stable seed ID
                Name        = "Admin",
                Description = "System administrator with full access to all screens and features.",
                IsSystemRole = true,
                CreatedAt   = DateTime.UtcNow
            };
            context.Roles.Add(adminRole);
            logger.LogInformation("Admin role created.");
        }

        // ── 2. Permissions for Admin role (all screens, read + write) ─────────
        foreach (var (key, name, category, description) in AppScreens.All)
        {
            bool exists = adminRole.Permissions.Any(p => p.ScreenKey == key);
            if (!exists)
            {
                context.RoleScreenPermissions.Add(new RoleScreenPermission
                {
                    Id             = Guid.NewGuid(),
                    RoleId         = adminRole.Id,
                    ScreenKey      = key,
                    ScreenName     = name,
                    ScreenCategory = category,
                    Description    = description,
                    CanRead        = true,
                    CanWrite       = true
                });
            }
        }

        await context.SaveChangesAsync();

        // ── 3. Standard non-admin roles ───────────────────────────────────────
        // These roles are referenced by AuthController.Register / GithubCallback.
        // Without them, new users get no UserRole row and all permissions default
        // to false, which can trigger the permission-guard redirect loop.
        var standardRoles = new[]
        {
            (
                Id: Guid.Parse("00000000-0000-0000-0000-000000000010"),
                Name: "Developer",
                Description: "Standard developer with read access to most screens and write access to content areas.",
                IsSystemRole: true
            ),
            (
                Id: Guid.Parse("00000000-0000-0000-0000-000000000011"),
                Name: "Maintainer",
                Description: "Maintainer with read access to all screens and write access to all content (except admin).",
                IsSystemRole: true
            ),
            (
                Id: Guid.Parse("00000000-0000-0000-0000-000000000012"),
                Name: "Viewer",
                Description: "Read-only access to public content screens.",
                IsSystemRole: true
            ),
            (
                Id: Guid.Parse("00000000-0000-0000-0000-000000000013"),
                Name: "System Architect",
                Description: "Elevated role with admin-level read access; treated as admin by the permission service.",
                IsSystemRole: true
            )
        };

        // Screen write access defaults per role (mirrors permission.service.ts defaults)
        var developerWriteScreens  = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            { "questions", "studio", "chat", "profile" };
        var maintainerNoWriteScreens = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            { "roles-management", "users-management" };
        var viewerReadScreens = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            { "questions", "blogs", "tags", "profile" };

        foreach (var roleDef in standardRoles)
        {
            var role = await context.Roles
                .Include(r => r.Permissions)
                .FirstOrDefaultAsync(r => r.Id == roleDef.Id || r.Name == roleDef.Name);

            if (role == null)
            {
                role = new Role
                {
                    Id          = roleDef.Id,
                    Name        = roleDef.Name,
                    Description = roleDef.Description,
                    IsSystemRole = roleDef.IsSystemRole,
                    CreatedAt   = DateTime.UtcNow
                };
                context.Roles.Add(role);
                logger.LogInformation("{RoleName} role created.", roleDef.Name);
            }

            foreach (var (key, name, category, description) in AppScreens.All)
            {
                if (role.Permissions.Any(p => p.ScreenKey == key)) continue;

                bool canRead;
                bool canWrite;

                switch (roleDef.Name)
                {
                    case "Developer":
                        canRead  = key != "roles-management" && key != "users-management";
                        canWrite = developerWriteScreens.Contains(key);
                        break;
                    case "Maintainer":
                        canRead  = true;
                        canWrite = !maintainerNoWriteScreens.Contains(key);
                        break;
                    case "Viewer":
                        canRead  = viewerReadScreens.Contains(key);
                        canWrite = false;
                        break;
                    default: // System Architect — full read, no write on admin screens
                        canRead  = true;
                        canWrite = !maintainerNoWriteScreens.Contains(key);
                        break;
                }

                context.RoleScreenPermissions.Add(new RoleScreenPermission
                {
                    Id             = Guid.NewGuid(),
                    RoleId         = role.Id,
                    ScreenKey      = key,
                    ScreenName     = name,
                    ScreenCategory = category,
                    Description    = description,
                    CanRead        = canRead,
                    CanWrite       = canWrite
                });
            }
        }

        await context.SaveChangesAsync();

        // ── 4. Admin User ─────────────────────────────────────────────────────
        const string adminUsername = "admin";
        const string adminEmail    = "admin@developerslate.local";

        var adminUser = await context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Username.ToLower() == adminUsername);

        if (adminUser == null)
        {
            var plainPassword = "Admin@1234!";

            PasswordHasher.CreatePasswordHash(plainPassword, out var hash, out var salt);

            adminUser = new User
            {
                Id           = Guid.Parse("00000000-0000-0000-0000-000000000002"), // stable seed ID
                Username     = adminUsername,
                DisplayName  = "Administrator",
                Email        = adminEmail,
                PasswordHash = hash,
                PasswordSalt = salt,
                Title        = "System Administrator",
                Bio          = "Default system administrator account.",
                AvatarUrl    = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
                GithubHandle = adminUsername,
                Reputation   = 9999,
                IsOnline     = false,
                CreatedAt    = DateTime.UtcNow,
                LastActiveAt = DateTime.UtcNow
            };

            context.Users.Add(adminUser);
            await context.SaveChangesAsync();
            logger.LogInformation("Admin user created (username: admin).");
        }

        // ── 5. Assign Admin role to admin user ────────────────────────────────
        // Re-fetch role ID in case the entity was just inserted this run
        var roleId = (await context.Roles.FirstAsync(r => r.Name == "Admin")).Id;

        bool alreadyAssigned = await context.UserRoles
            .AnyAsync(ur => ur.UserId == adminUser.Id && ur.RoleId == roleId);

        if (!alreadyAssigned)
        {
            context.UserRoles.Add(new UserRole
            {
                UserId     = adminUser.Id,
                RoleId     = roleId,
                AssignedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
            logger.LogInformation("Admin role assigned to admin user.");
        }
    }
}
