using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using developerSlate.Data;
using developerSlate.Models.Domain;

namespace developerSlate.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProfileController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{username}")]
    public async Task<IActionResult> GetProfile(string username)
    {
        var user = await _context.Users
            .Include(u => u.Proficiencies)
            .Include(u => u.PeerEndorsements)
            .Include(u => u.VerifiedSolutions)
            .Include(u => u.BlogPosts)
            .FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower());

        if (user == null)
        {
            user = await _context.Users
                .Include(u => u.Proficiencies)
                .Include(u => u.PeerEndorsements)
                .Include(u => u.VerifiedSolutions)
                .Include(u => u.BlogPosts)
                .FirstOrDefaultAsync();
        }

        if (user == null) return NotFound();

        return Ok(new
        {
            id = user.Id,
            username = user.Username,
            displayName = user.DisplayName,
            email = user.Email,
            avatarUrl = user.AvatarUrl,
            bio = user.Bio,
            title = user.Title,
            location = user.Location,
            githubHandle = user.GithubHandle,
            reputation = user.Reputation,
            monthlyReputationDelta = user.MonthlyReputationDelta,
            acceptanceRate = user.AcceptanceRate,
            solvedCount = user.SolvedCount,
            articlesCount = user.ArticlesCount,
            questionCount = user.QuestionCount,
            impactScore = user.ImpactScore,
            engineeringReach = user.EngineeringReach,
            devsHelpedCount = user.DevsHelpedCount,
            bountiesClaimedAmount = user.BountiesClaimedAmount,
            bountyPoints = user.BountyPoints,
            peerRfcCount = user.PeerRfcCount,
            gistsCount = user.GistsCount,
            totalContributionEvents = user.TotalContributionEvents,
            peakActivityHours = user.PeakActivityHours,
            createdAt = user.CreatedAt,
            isOnline = user.IsOnline,
            lastActiveAt = user.LastActiveAt,
            proficiencies = user.Proficiencies.Select(p => new
            {
                id = p.Id,
                technology = p.Technology,
                score = p.Score,
                tier = p.Tier,
                levelTitle = p.LevelTitle,
                description = p.Description,
                reputationBonus = p.ReputationBonus,
                verifiedSolutionsCount = p.VerifiedSolutionsCount,
                icon = p.Icon
            }),
            peerEndorsements = user.PeerEndorsements.OrderByDescending(e => e.CreatedAt).Select(e => new
            {
                id = e.Id,
                authorName = e.AuthorName,
                authorTitle = e.AuthorTitle,
                authorAvatarUrl = e.AuthorAvatarUrl,
                content = e.Content,
                verifiedBadge = e.VerifiedBadge,
                createdAt = e.CreatedAt
            }),
            verifiedSolutions = user.VerifiedSolutions.OrderByDescending(s => s.CreatedAt).Select(s => new
            {
                id = s.Id,
                title = s.Title,
                verificationBadge = s.VerificationBadge,
                solvedTimeAgo = s.SolvedTimeAgo,
                codeSnippet = s.CodeSnippet,
                tags = s.Tags,
                upvotes = s.Upvotes,
                views = s.Views,
                createdAt = s.CreatedAt
            }),
            featuredRfcs = user.BlogPosts.OrderByDescending(b => b.ClapsCount).Take(4).Select(b => new
            {
                id = b.Id,
                title = b.Title,
                slug = b.Slug,
                excerpt = b.Excerpt,
                readingTimeMinutes = b.ReadingTimeMinutes,
                clapsCount = b.ClapsCount,
                publishedAt = b.PublishedAt,
                tags = b.Tags
            })
        });
    }

    [HttpGet("{username}/contributions")]
    public async Task<IActionResult> GetContributions(string username)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower())
                   ?? await _context.Users.FirstOrDefaultAsync();

        var totalEvents = user?.TotalContributionEvents ?? 1420;
        var random = new Random(user?.Id.GetHashCode() ?? 42);
        var contributions = new List<object>();
        var now = DateTime.UtcNow.Date;

        for (int i = 363; i >= 0; i--)
        {
            var date = now.AddDays(-i);
            int count = random.Next(0, 10) > 3 ? random.Next(1, 8) : 0;
            contributions.Add(new
            {
                date = date.ToString("yyyy-MM-dd"),
                count = count,
                level = count == 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 6 ? 3 : 4
            });
        }

        return Ok(new
        {
            totalContributions = totalEvents,
            longestStreak = 38,
            currentStreak = 14,
            peakHours = user?.PeakActivityHours ?? "21:00 - 03:00 UTC",
            days = contributions
        });
    }
}

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly AppDbContext _context;

    public ChatController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var convs = await _context.ChatConversations
            .Include(c => c.Participants).ThenInclude(p => p.User)
            .Include(c => c.Messages.OrderByDescending(m => m.SentAt).Take(1))
            .OrderByDescending(c => c.UpdatedAt)
            .ToListAsync();

        var result = convs.Select(c =>
        {
            var lastMsg = c.Messages.FirstOrDefault();
            return new
            {
                id = c.Id,
                title = c.Title,
                isGroup = c.IsGroup,
                channelTopic = c.ChannelTopic,
                avatarUrl = c.AvatarUrl,
                updatedAt = c.UpdatedAt,
                lastMessage = lastMsg != null ? new
                {
                    content = lastMsg.Content,
                    sentAt = lastMsg.SentAt,
                    isRead = lastMsg.IsRead
                } : null,
                participants = c.Participants.Select(p => new
                {
                    id = p.UserId,
                    username = p.User?.Username,
                    displayName = p.User?.DisplayName,
                    avatarUrl = p.User?.AvatarUrl,
                    isOnline = p.User?.IsOnline ?? false
                })
            };
        });

        return Ok(result);
    }

    [HttpGet("conversations/{id:guid}/messages")]
    public async Task<IActionResult> GetMessages(Guid id)
    {
        var messages = await _context.ChatMessages
            .Include(m => m.Sender)
            .Where(m => m.ConversationId == id)
            .OrderBy(m => m.SentAt)
            .Select(m => new
            {
                id = m.Id,
                conversationId = m.ConversationId,
                senderId = m.SenderId,
                senderUsername = m.Sender!.Username,
                senderDisplayName = m.Sender.DisplayName,
                senderAvatar = m.Sender.AvatarUrl,
                content = m.Content,
                codeSnippet = m.CodeSnippet,
                codeLanguage = m.CodeLanguage,
                sentAt = m.SentAt,
                isRead = m.IsRead
            })
            .ToListAsync();

        return Ok(messages);
    }

    [HttpPost("conversations/{id:guid}/messages")]
    public async Task<IActionResult> SendMessage(Guid id, [FromBody] SendMessageDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == dto.SenderUsername)
                   ?? await _context.Users.FirstOrDefaultAsync();

        if (user == null) return BadRequest("Sender not found");

        var msg = new ChatMessage
        {
            ConversationId = id,
            SenderId = user.Id,
            Content = dto.Content,
            CodeSnippet = dto.CodeSnippet,
            CodeLanguage = dto.CodeLanguage,
            SentAt = DateTime.UtcNow,
            IsRead = false
        };

        _context.ChatMessages.Add(msg);
        var conv = await _context.ChatConversations.FindAsync(id);
        if (conv != null)
        {
            conv.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = msg.Id,
            conversationId = msg.ConversationId,
            senderId = user.Id,
            senderUsername = user.Username,
            senderDisplayName = user.DisplayName,
            senderAvatar = user.AvatarUrl,
            content = msg.Content,
            codeSnippet = msg.CodeSnippet,
            codeLanguage = msg.CodeLanguage,
            sentAt = msg.SentAt,
            isRead = false
        });
    }
}

public class SendMessageDto
{
    public string SenderUsername { get; set; } = "alexchen";
    public string Content { get; set; } = string.Empty;
    public string? CodeSnippet { get; set; }
    public string? CodeLanguage { get; set; }
}

