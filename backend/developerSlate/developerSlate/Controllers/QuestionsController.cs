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
public class QuestionsController : ControllerBase
{
    private readonly AppDbContext _context;

    public QuestionsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetQuestions([FromQuery] string? tag, [FromQuery] string? sort, [FromQuery] string? search, [FromQuery] bool? isSolved)
    {
        var query = _context.Questions
            .Include(q => q.Author)
            .Include(q => q.QuestionTags)
                .ThenInclude(qt => qt.Tag)
            .Include(q => q.Answers)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(tag))
        {
            query = query.Where(q => q.QuestionTags.Any(qt => qt.Tag != null && qt.Tag.Slug.ToLower() == tag.ToLower()));
        }

        if (isSolved.HasValue)
        {
            query = query.Where(q => q.IsSolved == isSolved.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(q => q.Title.ToLower().Contains(s) || q.ContentMarkdown.ToLower().Contains(s));
        }

        query = sort switch
        {
            "votes" => query.OrderByDescending(q => q.Upvotes - q.Downvotes),
            "unanswered" => query.Where(q => q.Answers.Count == 0).OrderByDescending(q => q.CreatedAt),
            "solved" => query.Where(q => q.IsSolved).OrderByDescending(q => q.CreatedAt),
            _ => query.OrderByDescending(q => q.CreatedAt) // "newest" / default
        };

        var questions = await query.Select(q => new
        {
            id = q.Id,
            title = q.Title,
            slug = q.Slug,
            contentMarkdown = q.ContentMarkdown,
            codeSnippet = q.CodeSnippet,
            language = q.Language,
            upvotes = q.Upvotes,
            downvotes = q.Downvotes,
            score = q.Score,
            viewCount = q.ViewCount,
            isSolved = q.IsSolved,
            acceptedAnswerId = q.AcceptedAnswerId,
            createdAt = q.CreatedAt,
            answerCount = q.Answers.Count,
            author = new
            {
                id = q.Author!.Id,
                username = q.Author.Username,
                displayName = q.Author.DisplayName,
                avatarUrl = q.Author.AvatarUrl,
                reputation = q.Author.Reputation,
                title = q.Author.Title
            },
            tags = q.QuestionTags.Select(qt => new
            {
                id = qt.Tag!.Id,
                name = qt.Tag.Name,
                slug = qt.Tag.Slug,
                accentColor = qt.Tag.AccentColor
            })
        }).ToListAsync();

        return Ok(questions);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetQuestionById(Guid id)
    {
        var q = await _context.Questions
            .Include(q => q.Author)
            .Include(q => q.QuestionTags).ThenInclude(qt => qt.Tag)
            .Include(q => q.Answers).ThenInclude(a => a.Author)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (q == null) return NotFound();

        q.ViewCount += 1;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = q.Id,
            title = q.Title,
            slug = q.Slug,
            contentMarkdown = q.ContentMarkdown,
            codeSnippet = q.CodeSnippet,
            language = q.Language,
            upvotes = q.Upvotes,
            downvotes = q.Downvotes,
            score = q.Score,
            viewCount = q.ViewCount,
            isSolved = q.IsSolved,
            acceptedAnswerId = q.AcceptedAnswerId,
            createdAt = q.CreatedAt,
            updatedAt = q.UpdatedAt,
            author = new
            {
                id = q.Author!.Id,
                username = q.Author.Username,
                displayName = q.Author.DisplayName,
                avatarUrl = q.Author.AvatarUrl,
                reputation = q.Author.Reputation,
                title = q.Author.Title
            },
            tags = q.QuestionTags.Select(qt => new
            {
                id = qt.Tag!.Id,
                name = qt.Tag.Name,
                slug = qt.Tag.Slug,
                accentColor = qt.Tag.AccentColor
            }),
            answers = q.Answers.OrderByDescending(a => a.IsAccepted).ThenByDescending(a => a.Score).Select(a => new
            {
                id = a.Id,
                contentMarkdown = a.ContentMarkdown,
                codeSnippet = a.CodeSnippet,
                language = a.Language,
                upvotes = a.Upvotes,
                downvotes = a.Downvotes,
                score = a.Score,
                isAccepted = a.IsAccepted,
                createdAt = a.CreatedAt,
                author = new
                {
                    id = a.Author!.Id,
                    username = a.Author.Username,
                    displayName = a.Author.DisplayName,
                    avatarUrl = a.Author.AvatarUrl,
                    reputation = a.Author.Reputation,
                    title = a.Author.Title
                }
            })
        });
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateQuestion([FromBody] CreateQuestionDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "Invalid token." });

        var author = await _context.Users.FindAsync(userId);
        if (author == null) return Unauthorized(new { message = "User not found." });

        var q = new Question
        {
            Title = dto.Title,
            Slug = dto.Title.ToLower().Replace(" ", "-").Replace("?", ""),
            ContentMarkdown = dto.ContentMarkdown,
            CodeSnippet = dto.CodeSnippet,
            Language = dto.Language ?? "rust",
            AuthorId = author.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Questions.Add(q);
        await _context.SaveChangesAsync();

        if (dto.TagIds?.Count > 0)
        {
            foreach (var tid in dto.TagIds)
            {
                _context.QuestionTags.Add(new QuestionTag { QuestionId = q.Id, TagId = tid });
            }
            await _context.SaveChangesAsync();
        }

        return CreatedAtAction(nameof(GetQuestionById), new { id = q.Id }, q);
    }

    [HttpPost("{id:guid}/vote")]
    public async Task<IActionResult> VoteQuestion(Guid id, [FromQuery] int delta)
    {
        var q = await _context.Questions.FindAsync(id);
        if (q == null) return NotFound();

        if (delta > 0) q.Upvotes += 1;
        else q.Downvotes += 1;

        await _context.SaveChangesAsync();
        return Ok(new { id = q.Id, upvotes = q.Upvotes, downvotes = q.Downvotes, score = q.Score });
    }

    [HttpPost("{id:guid}/answers")]
    [Authorize]
    public async Task<IActionResult> PostAnswer(Guid id, [FromBody] PostAnswerDto dto)
    {
        var q = await _context.Questions.FindAsync(id);
        if (q == null) return NotFound();

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "Invalid token." });

        var author = await _context.Users.FindAsync(userId);
        if (author == null) return Unauthorized(new { message = "User not found." });

        var ans = new Answer
        {
            QuestionId = id,
            AuthorId = author.Id,
            ContentMarkdown = dto.ContentMarkdown,
            CodeSnippet = dto.CodeSnippet,
            Language = dto.Language ?? "rust",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Answers.Add(ans);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = ans.Id,
            contentMarkdown = ans.ContentMarkdown,
            codeSnippet = ans.CodeSnippet,
            language = ans.Language,
            upvotes = 0,
            downvotes = 0,
            score = 0,
            isAccepted = false,
            createdAt = ans.CreatedAt,
            author = new
            {
                id = author.Id,
                username = author.Username,
                displayName = author.DisplayName,
                avatarUrl = author.AvatarUrl,
                reputation = author.Reputation,
                title = author.Title
            }
        });
    }
}

public class CreateQuestionDto
{
    public string Title { get; set; } = string.Empty;
    public string ContentMarkdown { get; set; } = string.Empty;
    public string? CodeSnippet { get; set; }
    public string? Language { get; set; }
    public List<Guid>? TagIds { get; set; }
}

public class PostAnswerDto
{
    public string ContentMarkdown { get; set; } = string.Empty;
    public string? CodeSnippet { get; set; }
    public string? Language { get; set; }
}

