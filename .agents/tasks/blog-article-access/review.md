# Unauthenticated access to published blog articles

A guest reader couldn't open a published engineering article because the frontend `permissionGuard` redirected any unauthenticated visitor away from `/blogs` and `/blogs/:slug` to `/login`, even though the backend read endpoints were already public. The fix strips the guard (and its now-unused `screenKey: 'blogs'` data) from the two blog routes, leaving authoring (`/studio`) and the admin screens guarded. The end-to-end read chain — listing link → route → component → service → public backend endpoint → `[innerHTML]` render — is consistent and correctly wired; `contentMarkdown`/`ContentMarkdown` and the `[innerHTML]` + `.article-content` rendering are untouched, and no new libraries were introduced. Both builds were reported as succeeding in the commit message; no runtime test against a live backend+frontend was run.

Watch for: the single-article backend endpoint returns a post regardless of its `IsPublished` flag, so removing the frontend guard now lets an anonymous reader open an unpublished draft if they know its slug; and the clap action on the detail page hits an unauthenticated, un-rate-limited endpoint that is now reachable by guests.

**Verdict**: APPROVED

## High-level view

The fix targets the actual root cause rather than a symptom: the guard's very first check is `if (!authService.isAuthenticated()) router.navigate(['/login'])`, and both blog routes carried `canActivate: [permissionGuard]`. Stripping it from `/blogs` and `/blogs/:slug` aligns the frontend with the already-public backend; `/studio` and the admin routes keep the guard, so authoring stays gated.

The public read path resolves cleanly end to end. Listing cards (`FeaturedArticleHeroComponent`, `BlogCardComponent`) link by slug via `['/blogs', article.slug]`; the detail component reads `route.params['slug']`, calls `ApiService.getBlogBySlug`, which issues `GET {API_BASE_URL}/blogs/{slug}`; `API_BASE_URL` already ends in `/api`, so the request lands on `BlogsController.GetBlogBySlug` (`GET /api/blogs/{idOrSlug}`), which has no `[Authorize]` and no global fallback policy in `Program.cs`. The returned DTO carries `contentMarkdown`, rendered unchanged through `[innerHTML]` on `.article-content`.

Two posture gaps are newly exposed by widening anonymous access, both rooted in pre-existing backend behavior. `GetBlogBySlug` matches on `Slug == idOrSlug || Id.ToString() == idOrSlug` with no `IsPublished` filter, so unpublished drafts become readable by anyone who knows the slug. The clap endpoint (`POST /api/blogs/{id}/clap`) carries no `[Authorize]` and no `[EnableRateLimiting]`; the only registered limiter (`"AuthPolicy"`) isn't applied to it and there's no `GlobalLimiter`, so anonymous clap inflation is now possible from the detail page.

<details>
<summary>Issues (2)</summary>

1. **Unpublished drafts viewable anonymously** — `GetBlogBySlug` returns a post regardless of `IsPublished`, and removing the guard lets a guest reach `/blogs/:slug`; gate non-published posts behind auth or restrict the anonymous single-fetch to published posts. (confirmed, non-blocking follow-up)
2. **Unauthenticated, un-rate-limited clap endpoint** — `POST /api/blogs/{id}/clap` has no `[Authorize]` and no effective rate limiting, and is now reachable by anonymous readers from the detail page; add auth or apply the rate limiter to it. (confirmed, low-severity follow-up)

</details>

<details>
<summary>Details</summary>

### Root cause: guard redirected guests to /login

The reported symptom — a guest opening a published article and being bounced away — is exactly what `permissionGuard` does for any unauthenticated user. `AuthService.isAuthenticated` is `computed(() => !!this.currentUser())`, so a guest has no `currentUser` and the guard's opening branch fires `router.navigate(['/login'])` and returns `false` before the component ever loads. Both `/blogs` and `/blogs/:slug` previously carried `canActivate: [permissionGuard]`, so neither the listing nor any article was reachable without a session. The guard remains on `/studio`, `/questions`, `/tags`, `/profile`, `/chat`, and the admin routes, so authoring access is unaffected.

### Single-article endpoint leaks unpublished drafts to anonymous readers

`GetBlogBySlug` looks a post up by `b.Slug == idOrSlug || b.Id.ToString() == idOrSlug` and returns it on a match, with no `IsPublished` predicate — unlike `GetBlogs`, which filters `Where(b => b.IsPublished)` for the listing. Before this change the frontend guard implicitly shielded that gap: an anonymous reader could never reach the detail page, so the missing `IsPublished` filter on the single-fetch endpoint was invisible to them. With the guard gone, any anonymous reader who knows or guesses a draft's slug (slugs are derived predictably from the title) can read its `contentMarkdown` via `GET /api/blogs/{slug}`. This is an authorization/information-disclosure gap newly exposed by the routing change, confirmed by reading the controller; the endpoint behavior itself predates the diff. Closing it is a follow-up, not a blocker for the access fix.

The clap interaction on the same page has a related, lower-severity exposure. `BlogDetailPageComponent.clap()` calls `ApiService.clapBlog` → `POST /api/blogs/{id}/clap`, whose action `ClapBlog` has no `[Authorize]`. The only rate limiter registered in `Program.cs` is the named `"AuthPolicy"` fixed-window limiter, which is never enabled on this endpoint (no `[EnableRateLimiting]` on it and no `GlobalLimiter`), so an anonymous reader can increment claps freely now that the detail page is reachable. Pre-existing endpoint behavior, newly reachable by guests.

Separately, the article body renders author-supplied HTML through `[innerHTML]` (unchanged here by design), relying on Angular's `DomSanitizer` with no `Content-Security-Policy` header in `Program.cs` as defense-in-depth — pre-existing posture the wider anonymous audience now reaches.

</details>

<details>
<summary>File map</summary>

- `frontend/src/app/app.routes.ts` — removed `permissionGuard` and `screenKey: 'blogs'` data from the `/blogs` and `/blogs/:slug` routes so published articles are viewable without authentication; all other guarded routes are unchanged.

Full diff: `git -C c:\Users\shekh\source\repos\DeveloperSlate diff 5546c4eaaa2e59eacf990e1e663359b2ff81ae52...HEAD`

</details>
