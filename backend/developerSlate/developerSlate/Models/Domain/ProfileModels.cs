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
    public string VerifiedBadge { get; set; } = "Verified Contributor";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class ProfileVerifiedSolution
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string Title { get; set; } = string.Empty;
    public string VerificationBadge { get; set; } = "cargo-clippy verified";
    public string SolvedTimeAgo { get; set; } = "Solved 3 days ago";
    public string CodeSnippet { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = new List<string>();
    public int Upvotes { get; set; } = 124;
    public int Views { get; set; } = 3840;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

