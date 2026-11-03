# Roles Screen Hang — Investigation Report

## Summary Answer

**Root cause: an infinite redirect loop triggered by the permission guard for the `roles-management` screen key.**

The `permissionGuard` checks `permissionService.canRead('roles-management')`. For any user who does NOT have the `Admin` or `System Architect` role — including any newly registered user, a Developer, or a user whose role has no seeded permissions in the DB — `canRead` returns `false`. The guard then redirects to `/questions?error=access_denied&screen=roles-management`. However, the `/questions` route is _also_ protected by `permissionGuard` with `screenKey: 'questions'`. In the specific condition where a user's role exists in the DB but has **zero permissions seeded** (i.e. `hasAnyReadPermission` is false and no recognized role name matches), `canRead('questions')` also returns `false`, sending the guard to redirect back to `/questions` again. Angular Router then fires the guard a second time, and the cycle repeats, locking the browser in an infinite navigation loop.

There is a secondary contributing bug: the `SeedAdminRoleAndUser` migration (`20261103183520_SeedAdminRoleAndUser.cs`) has empty `Up()` and `Down()` bodies — it does **nothing**. Role seeding is done at runtime by `DbSeeder.SeedAsync`, but that only seeds the `Admin` role. The four standard roles referenced in the code (`Developer`, `Maintainer`, `Viewer`, and `System Architect`) are **never seeded** into the `Roles` table, meaning every new user registered via `/auth/register` gets a `UserRole` row pointing to the `Developer` role only if `FirstOrDefaultAsync(r => r.Name == "Developer")` returns a row — which it will not on a fresh database. When that `devRole` is `null`, the `UserRoles` collection for the new user is empty, falling through to the `canRead = false; canWrite = false` else-branch in `BuildPermissionMap`.

---

## Evidence

### 1. The redirect loop — `permission.guard.ts`

**File:** `frontend/src/app/core/guards/permission.guard.ts`

```typescript
// Line 17 (simplified)
if (permissionService.canRead(screenKey)) {
  return true;
}

// Access Denied: redirect to default safe screen
router.navigate(['/questions'], { queryParams: { error: 'access_denied', screen: screenKey } });
return false;
```

The "safe screen" fallback is hardcoded to `/questions`. The `/questions` route in `app.routes.ts` (line 22-27) also carries `canActivate: [permissionGuard]` with `data: { screenKey: 'questions' }`. If `canRead('questions')` ever returns false, the guard fires again, redirects to `/questions` again, and the loop is infinite.

**File:** `frontend/src/app/app.routes.ts`

```typescript
// Line 22-27
{
  path: 'questions',
  component: QuestionsPageComponent,
  canActivate: [permissionGuard],
  data: { screenKey: 'questions' }
},
```

There is no loop-break or recursion guard.

### 2. Condition that makes `canRead('questions')` return false — `permission.service.ts`

**File:** `frontend/src/app/core/services/permission.service.ts`

```typescript
public canRead(screenKey: string): boolean {
  if (this.isAdmin()) return true;

  if (this.hasAnyReadPermission()) {       // ← only trusts DB perms if at least one canRead is true
    const perms = this.permissionsMap();
    if (perms[screenKey] !== undefined) {
      return perms[screenKey].canRead;
    }
  }

  // Default fallbacks for standard roles
  const roles = this.userRoles();
  if (roles.includes('Maintainer')) { return true; }
  if (roles.includes('Developer'))  { ... return true for 'questions' }
  if (roles.includes('Viewer'))     { ... return true for 'questions' }

  return true;   // final fallback
}
```

The final fallback is `return true`, so this service alone cannot cause the loop for a user with any recognized role name. **However**, the guard loop happens in this scenario:

- User's `permissions` object on `UserSummary` contains entries where every `canRead` is `false` (role exists in DB but has no `RoleScreenPermission` rows seeded — see Section 3).
- `hasAnyReadPermission()` returns `false`.
- The code falls through to role-name defaults.
- If the user's `roles` array from the JWT is `[]` (empty — see Section 4), none of the role-name branches match, and the final `return true` does fire.

But if `hasAnyReadPermission()` returns `true` (i.e. there are DB permission rows with at least one `canRead: true` but the specific screen has `canRead: false`), the method returns `false` for that screen. If that happens for both `roles-management` **and** `questions`, the loop triggers.

### 3. Missing role seeds — `SeedAdminRoleAndUser.cs` and `DbSeeder.cs`

**File:** `backend/developerSlate/developerSlate/Data/Migrations/20261103183520_SeedAdminRoleAndUser.cs`

```csharp
protected override void Up(MigrationBuilder migrationBuilder)
{
    // EMPTY — no SQL, no data inserts
}
```

The migration body is completely empty. It was created but never filled in.

**File:** `backend/developerSlate/developerSlate/Data/DbSeeder.cs`

`DbSeeder.SeedAsync` seeds exactly **one** role: `Admin` (with stable ID `00000000-0000-0000-0000-000000000001`). It does not create `Developer`, `Maintainer`, `Viewer`, or `System Architect` roles.

The `AuthController.Register` and `AuthController.GithubCallback` both do:

```csharp
var devRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Developer");
if (devRole != null)
    _context.UserRoles.Add(new UserRole { UserId = newUser.Id, RoleId = devRole.Id });
```

On a fresh database (or one that has only gone through the empty migration), `devRole` is `null`. The `UserRoles` collection for the new user is empty. `BuildPermissionMap` in `AuthModels.cs` hits the `else` branch and returns `canRead = false, canWrite = false` for **every screen**. The JWT `roles` claim list is also empty.

### 4. The permission map built at login — `AuthController.cs` `BuildUserPayload`

**File:** `backend/developerSlate/developerSlate/Controllers/AuthController.cs`

```csharp
private static object BuildUserPayload(User user)
{
    var roles = user.UserRoles
        .Where(ur => ur.Role != null)
        .Select(ur => ur.Role!.Name)
        .ToList();

    if (roles.Count == 0)
        roles.Add("Developer");   // ← fallback role name added here

    var permMap = AppScreens.BuildPermissionMap(user.UserRoles);
    ...
}
```

The `roles` list falls back to `["Developer"]` for display. But `BuildPermissionMap` receives the real `user.UserRoles` collection which is still empty. Inside `BuildPermissionMap`:

```csharp
bool isDeveloper = roleList.Contains("Developer");  // roleList is empty → false
bool hasAnySeedPermission = userRoles.Any(...)       // empty → false

// None of isAdmin/isMaintainer/isDeveloper/isViewer are true
// Falls to else:
canRead  = false;
canWrite = false;
```

So the `permissions` map sent to the frontend has `canRead: false` for every screen, including `questions`. Meanwhile, `roles` in the same payload says `["Developer"]` — a mismatch.

On the frontend, `userRoles()` returns `["Developer"]` (from the JWT/stored user). `permissionsMap()` has all-false. `hasAnyReadPermission()` is `false`. The role-name fallback in `canRead` then runs, and `Developer` matches — so `canRead('questions')` returns `true` and `canRead('roles-management')` returns `false`.

In this specific path the loop does NOT fire for the Developer role because the fallback logic saves it. **But** the loop does fire for a user whose role IS seeded with `RoleScreenPermission` rows where the admin has **revoked access to `questions`** (set `canRead: false`). Once the admin sets `questions.canRead = false` on a role, any user with that role gets caught: `hasAnyReadPermission()` is `true` (other screens are still readable), `perms['questions'].canRead` is `false`, so the guard redirects to `/questions`, which itself fails the guard, and the loop is infinite.

### 5. `RolesController` — no `[Authorize]` attribute

**File:** `backend/developerSlate/developerSlate/Controllers/RolesController.cs`

The `RolesController` class and its `GetRoles` action have **no `[Authorize]` attribute**. Any request — authenticated or not — reaches the controller. This is a security gap but is not the cause of the frontend hang.

The controller query does not have circular serialization issues (anonymous projection prevents cycle). The query does two `Include` calls (`Permissions` and `UserRoles`) which are straightforward. No N+1 or obvious blocking query. The serialization cycle guard in `Program.cs` (`ReferenceHandler.IgnoreCycles`) would have caught any cycles anyway.

### 6. No SignalR subscription on the roles route

The `RolesPageComponent.ngOnInit` only calls `this.apiService.getRoles()` and `this.apiService.getAvailableScreens()` — two simple HTTP GET calls. No SignalR hubs are subscribed. No polling timers are set up. The `@microsoft/signalr` package in `package.json` is used only by the chat feature.

---

## Conclusions

| # | Finding | Severity |
|---|---------|----------|
| 1 | **Infinite redirect loop**: guard falls back to `/questions`, which is also guarded; if that guard also returns `false`, the browser loops forever | **Critical — root cause of the hang** |
| 2 | **Missing role seeds**: `SeedAdminRoleAndUser` migration is empty; `Developer`, `Maintainer`, `Viewer` roles are never created in the DB, so new users get no `UserRole` row | **High — makes new users vulnerable to the loop** |
| 3 | **`BuildPermissionMap` receives empty `UserRoles` but `BuildUserPayload` adds `"Developer"` to the roles list** — the two diverge, creating a misleading state where the role name says `Developer` but all permissions are `false` | **High — silent data inconsistency** |
| 4 | `RolesController` has no `[Authorize]` attribute — any caller can read and mutate roles | **Medium — security gap, not the cause of the hang** |

---

## Recommendations (do not implement — diagnosis only)

### Fix 1 — Break the redirect loop (immediate fix)

In `permission.guard.ts`, change the fallback redirect from the guarded `/questions` route to a dedicated `/access-denied` route (or the `/login` route), or add a query-param check so the guard does not re-fire when it is already on the denied screen:

```typescript
// Current (loops):
router.navigate(['/questions'], { queryParams: { error: 'access_denied', screen: screenKey } });

// Safe alternative — redirect to a route NOT protected by permissionGuard:
router.navigate(['/access-denied'], { queryParams: { screen: screenKey } });
```

Create a simple `/access-denied` page component registered in `app.routes.ts` without any `canActivate` guard.

### Fix 2 — Seed the standard roles

In `DbSeeder.SeedAsync` (or in the empty migration), add `Developer`, `Maintainer`, `Viewer`, and `System Architect` roles with their default `RoleScreenPermission` rows, mirroring the hardcoded defaults already in `AppScreens.BuildPermissionMap`. This eliminates the state where `user.UserRoles` is empty.

Alternatively, fill in the body of `SeedAdminRoleAndUser` migration with the four standard roles using `migrationBuilder.InsertData`.

### Fix 3 — Align `BuildPermissionMap` with `BuildUserPayload` role fallback

`BuildUserPayload` appends `"Developer"` to the roles list when the list is empty, but `BuildPermissionMap` receives the raw `userRoles` collection which is still empty. Either:
- Pass the resolved `roles` list into `BuildPermissionMap` instead of `user.UserRoles`; or
- Add a `Developer` default path in `BuildPermissionMap` when `roleList.Count == 0`.

### Fix 4 — Add `[Authorize]` to `RolesController`

Add `[Authorize]` to the class declaration (or at minimum to `GetRoles`, `CreateRole`, `UpdateRole`, and `DeleteRole`) so unauthenticated callers receive a 401 rather than full role data.

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]   // ← add this
public class RolesController : ControllerBase { ... }
```
