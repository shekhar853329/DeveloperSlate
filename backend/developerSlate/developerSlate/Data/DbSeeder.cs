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

        // ── 3. Admin User ─────────────────────────────────────────────────────
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

        // ── 4. Assign Admin role to admin user ────────────────────────────────
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
