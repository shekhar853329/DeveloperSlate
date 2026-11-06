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
