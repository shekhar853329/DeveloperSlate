using System;
using System.Collections.Generic;

namespace developerSlate.Models.Domain;

public class PeerEndorsement
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string AuthorTitle { get; set; } = string.Empty;
    public string AuthorAvatarUrl { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string VerifiedBadge { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class ProfileVerifiedSolution
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string Title { get; set; } = string.Empty;
    public string VerificationBadge { get; set; } = string.Empty;
    public string SolvedTimeAgo { get; set; } = string.Empty;
    public string CodeSnippet { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = new List<string>();
    public int Upvotes { get; set; } = 0;
    public int Views { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

