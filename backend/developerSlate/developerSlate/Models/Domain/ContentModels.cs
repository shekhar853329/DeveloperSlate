using System;
using System.Collections.Generic;

namespace developerSlate.Models.Domain;

public class BlogPost
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public string Excerpt { get; set; } = string.Empty;
    public string ContentMarkdown { get; set; } = string.Empty;
    public string CoverImageUrl { get; set; } = string.Empty;
    public Guid AuthorId { get; set; }
    public User? Author { get; set; }
    public int ReadingTimeMinutes { get; set; } = 8;
    public int ClapsCount { get; set; } = 0;
    public int BookmarkCount { get; set; } = 0;
    public bool IsFeatured { get; set; } = false;
    public bool IsPublished { get; set; } = true;
    public string CanonicalUrl { get; set; } = string.Empty;
    public DateTime PublishedAt { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<string> Tags { get; set; } = new List<string>();
}

public class SavedSnippet
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = "Concurrency";
    public string Language { get; set; } = "rust";
    public string CodeContent { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public bool IsPinned { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<string> Tags { get; set; } = new List<string>();
}

public class CodeDiff
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string CommitHash { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public int Additions { get; set; } = 0;
    public int Deletions { get; set; } = 0;
    public string OriginalCode { get; set; } = string.Empty;
    public string ModifiedCode { get; set; } = string.Empty;
    public string Language { get; set; } = "rust";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class AstComparison
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Language { get; set; } = "typescript";
    public string SourceCode { get; set; } = string.Empty;
    public string TargetCode { get; set; } = string.Empty;
    public string AstJson { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

