# Auth-Security Review

## Evidence

| # | Concern | Result | Evidence |
|---|---------|--------|----------|
| 1 | `GenerateJwt` produces real signed JWT | ✅ PASS | `AuthController.cs` uses `JwtSecurityTokenHandler.WriteToken()` with `SigningCredentials(key, SecurityAlgorithms.HmacSha256)`. Not base64; proper signed compact token. |
| 2 | `[Authorize]` on `/me` and `/logout` | ✅ PASS | `GetCurrentUser()` carries `[Authorize]` (line ~212); `Logout()` carries `[Authorize]` (line ~266). |
| 3 | Hardcoded fallback passwords removed from login path | ✅ PASS | `Login()` calls only `PasswordHasher.VerifyPasswordHash`. No literal `"Password123!"`, `"admin"`, or `"developer"` comparisons exist in `AuthController.cs`. `DbInitializer.cs` uses the string to hash seeded demo users correctly — not a login bypass. |
| 4 | `/api/auth/github` returns 410 Gone | ✅ PASS | `GithubLoginDeprecated()` returns `StatusCode(410, ...)`. |
| 5 | Refresh token rotation (revoke old, issue new) | ✅ PASS | `Refresh()` sets `storedToken.RevokedAt = DateTime.UtcNow` before calling `CreateRefreshTokenAsync`. New token issued only after revocation. |
| 6 | `UseAuthentication()` before `UseAuthorization()` | ✅ PASS | `Program.cs`: `app.UseAuthentication()` immediately precedes `app.UseAuthorization()` in middleware pipeline. |
| 7 | Password validation enforces all five rules | ✅ PASS | `ValidatePasswordStrength` checks: length ≥ 8, `char.IsUpper`, `char.IsLower`, `char.IsDigit`, `!char.IsLetterOrDigit` (special char). All five rules present. |
| 8 | Build: 0 errors | ✅ PASS | Commit `e2912e7` message states "Build: dotnet build succeeded with 0 errors". |

---

## Blockers

### BLOCKER-1 — Static JWT signing key committed to source control

**File:** `appsettings.json`, `Jwt.Key`

**Evidence:**
```json
"Key": "REPLACE_WITH_A_SECRET_KEY_AT_LEAST_32_CHARS_LONG_abc123xyz"
```

This literal placeholder is committed to the repository and therefore publicly known to anyone with read access. `Program.cs` reads this value at startup and uses it as the HMAC-SHA256 signing key. Any deployment that does not override this value through environment-specific config or environment variables will sign all JWT access tokens with a public secret, making them trivially forgeable. The threat path is: attacker reads repo → crafts arbitrary JWT signed with the known key → gains authenticated access to any `[Authorize]` endpoint including `/api/auth/me` and `/api/auth/logout`.

**Consequence:** Complete authentication bypass in any environment where the key is not overridden.

**Correction:** Remove the literal key from `appsettings.json`. Use `appsettings.Development.json` (git-ignored) or an environment variable (`Jwt__Key`) for local development, and a secrets manager (Azure Key Vault, AWS Secrets Manager, or environment injection) for all deployed environments. The `?? throw new InvalidOperationException(...)` guard in `Program.cs` is correct and should remain.

---

### BLOCKER-2 — Postgres password committed to source control

**File:** `appsettings.json`, `ConnectionStrings.DefaultConnection`

**Evidence:**
```
"Host=localhost;Port=5432;Database=developer_slate;Username=postgres;Password=Subh@9899;..."
```

A real credential appears in a committed file. If this password is reused on a shared or production Postgres instance, it is now exposed.

**Consequence:** Unauthorized database access for anyone with repo read access.

**Correction:** Move the connection string (or at minimum the `Password=` segment) to `appsettings.Development.json` (git-ignored), user secrets (`dotnet user-secrets`), or an environment variable (`ConnectionStrings__DefaultConnection`). The `appsettings.json` entry should hold only a placeholder.
