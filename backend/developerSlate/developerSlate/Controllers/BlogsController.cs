using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using developerSlate.Data;
using developerSlate.Models.Domain;

namespace developerSlate.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BlogsController : ControllerBase
{
    private readonly AppDbContext _context;

    public BlogsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetBlogs([FromQuery] string? tag)
    {
        var query = _context.BlogPosts
            .Include(b => b.Author)
            .Where(b => b.IsPublished)
            .OrderByDescending(b => b.IsFeatured)
            .ThenByDescending(b => b.PublishedAt)
            .AsQueryable();

        var blogs = await query.Select(b => new
        {
            id = b.Id,
            title = b.Title,
            slug = b.Slug,
            subtitle = b.Subtitle,
            excerpt = b.Excerpt,
            contentMarkdown = b.ContentMarkdown,
            coverImageUrl = b.CoverImageUrl,
            readingTimeMinutes = b.ReadingTimeMinutes,
            clapsCount = b.ClapsCount,
            bookmarkCount = b.BookmarkCount,
            isFeatured = b.IsFeatured,
            tags = b.Tags,
            publishedAt = b.PublishedAt,
            author = new
            {
                id = b.Author!.Id,
                username = b.Author.Username,
                displayName = b.Author.DisplayName,
                avatarUrl = b.Author.AvatarUrl,
                title = b.Author.Title
            }
        }).ToListAsync();

        return Ok(blogs);
    }

    [HttpGet("{idOrSlug}")]
    public async Task<IActionResult> GetBlogBySlug(string idOrSlug)
    {
        var blog = await _context.BlogPosts
            .Include(b => b.Author)
            .FirstOrDefaultAsync(b => b.Slug == idOrSlug || b.Id.ToString() == idOrSlug);

        if (blog == null) return NotFound();

        return Ok(new
        {
            id = blog.Id,
            title = blog.Title,
            slug = blog.Slug,
            subtitle = blog.Subtitle,
            excerpt = blog.Excerpt,
            contentMarkdown = blog.ContentMarkdown,
            coverImageUrl = blog.CoverImageUrl,
            readingTimeMinutes = blog.ReadingTimeMinutes,
            clapsCount = blog.ClapsCount,
            bookmarkCount = blog.BookmarkCount,
            isFeatured = blog.IsFeatured,
            canonicalUrl = blog.CanonicalUrl,
            tags = blog.Tags,
            publishedAt = blog.PublishedAt,
            author = new
            {
                id = blog.Author!.Id,
                username = blog.Author.Username,
                displayName = blog.Author.DisplayName,
                avatarUrl = blog.Author.AvatarUrl,
                bio = blog.Author.Bio,
                title = blog.Author.Title,
                reputation = blog.Author.Reputation
            }
        });
    }

    [HttpPost]
    public async Task<IActionResult> PublishBlog([FromBody] CreateBlogDto dto)
    {
        var author = await _context.Users.FirstOrDefaultAsync() 
                     ?? throw new InvalidOperationException("No user found");

        var blog = new BlogPost
        {
            Title = dto.Title,
            Slug = dto.Title.ToLower().Replace(" ", "-").Replace(":", "").Replace("?", ""),
            Subtitle = dto.Subtitle ?? "",
            Excerpt = dto.Excerpt ?? (dto.ContentMarkdown.Length > 160 ? dto.ContentMarkdown.Substring(0, 160) + "..." : dto.ContentMarkdown),
            ContentMarkdown = dto.ContentMarkdown,
            CoverImageUrl = dto.CoverImageUrl ?? "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
            ReadingTimeMinutes = Math.Max(1, dto.ContentMarkdown.Split(' ').Length / 180),
            AuthorId = author.Id,
            Tags = dto.Tags ?? new List<string> { "Architecture" },
            CanonicalUrl = dto.CanonicalUrl ?? "",
            PublishedAt = DateTime.UtcNow,
            IsPublished = true
        };

        _context.BlogPosts.Add(blog);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBlogBySlug), new { idOrSlug = blog.Slug }, blog);
    }

    [HttpPost("{id:guid}/clap")]
    public async Task<IActionResult> ClapBlog(Guid id)
    {
        var b = await _context.BlogPosts.FindAsync(id);
        if (b == null) return NotFound();

        b.ClapsCount += 1;
        await _context.SaveChangesAsync();
        return Ok(new { claps = b.ClapsCount });
    }
}

public class CreateBlogDto
{
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string? Excerpt { get; set; }
    public string ContentMarkdown { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public string? CanonicalUrl { get; set; }
    public List<string>? Tags { get; set; }
}

