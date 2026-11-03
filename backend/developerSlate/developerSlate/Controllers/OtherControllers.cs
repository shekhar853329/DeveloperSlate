using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using developerSlate.Data;
using developerSlate.Models.Domain;

namespace developerSlate.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TagsController : ControllerBase
{
    private readonly AppDbContext _context;

    public TagsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetTags([FromQuery] string? category, [FromQuery] string? search)
    {
        var query = _context.Tags.AsQueryable();

        if (!string.IsNullOrWhiteSpace(category) && category != "All")
        {
            query = query.Where(t => t.Category.ToLower() == category.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(t => t.Name.ToLower().Contains(s) || t.Description.ToLower().Contains(s));
        }

        var tags = await query
            .OrderByDescending(t => t.QuestionCount)
            .Select(t => new
            {
                id = t.Id,
                name = t.Name,
                slug = t.Slug,
                description = t.Description,
                category = t.Category,
                iconName = t.IconName,
                accentColor = t.AccentColor,
                questionCount = t.QuestionCount,
                weeklyGrowthPercent = t.WeeklyGrowthPercent,
                isTrending = t.IsTrending
            })
            .ToListAsync();

        return Ok(tags);
    }
}

[ApiController]
[Route("api/[controller]")]
public class NotebookController : ControllerBase
{
    private readonly AppDbContext _context;

    public NotebookController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetSnippets([FromQuery] string? category, [FromQuery] string? search)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "Invalid token." });

        var query = _context.SavedSnippets.Where(s => s.UserId == userId).AsQueryable();

        if (!string.IsNullOrWhiteSpace(category) && category != "All")
        {
            query = query.Where(s => s.Category.ToLower() == category.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(x => x.Title.ToLower().Contains(s) || x.Notes.ToLower().Contains(s));
        }

        var list = await query
            .OrderByDescending(s => s.IsPinned)
            .ThenByDescending(s => s.UpdatedAt)
            .Select(s => new
            {
                id = s.Id,
                title = s.Title,
                category = s.Category,
                language = s.Language,
                codeContent = s.CodeContent,
                notes = s.Notes,
                isPinned = s.IsPinned,
                tags = s.Tags,
                createdAt = s.CreatedAt,
                updatedAt = s.UpdatedAt
            })
            .ToListAsync();

        return Ok(list);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> SaveSnippet([FromBody] CreateSnippetDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "Invalid token." });

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return Unauthorized(new { message = "User not found." });

        var snippet = new SavedSnippet
        {
            UserId = user.Id,
            Title = dto.Title,
            Category = dto.Category ?? "General",
            Language = dto.Language ?? "rust",
            CodeContent = dto.CodeContent,
            Notes = dto.Notes ?? "",
            IsPinned = dto.IsPinned,
            Tags = dto.Tags ?? new List<string>()
        };

        _context.SavedSnippets.Add(snippet);
        await _context.SaveChangesAsync();

        return Ok(snippet);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteSnippet(Guid id)
    {
        var s = await _context.SavedSnippets.FindAsync(id);
        if (s == null) return NotFound();
        _context.SavedSnippets.Remove(s);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public class CreateSnippetDto
{
    public string Title { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? Language { get; set; }
    public string CodeContent { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public bool IsPinned { get; set; }
    public List<string>? Tags { get; set; }
}

[ApiController]
[Route("api/[controller]")]
public class DiffController : ControllerBase
{
    private readonly AppDbContext _context;

    public DiffController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetDiffs()
    {
        var diffs = await _context.CodeDiffs.OrderByDescending(d => d.CreatedAt).ToListAsync();
        return Ok(diffs);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetDiffById(Guid id)
    {
        var diff = await _context.CodeDiffs.FindAsync(id);
        if (diff == null) return NotFound();
        return Ok(diff);
    }
}

[ApiController]
[Route("api/[controller]")]
public class AstController : ControllerBase
{
    private readonly AppDbContext _context;

    public AstController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAstComparisons()
    {
        var list = await _context.AstComparisons.OrderByDescending(a => a.CreatedAt).ToListAsync();
        return Ok(list);
    }
}

