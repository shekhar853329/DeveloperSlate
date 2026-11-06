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
    public int ReadingTimeMinutes { get; set; } = 0;
    public int ClapsCount { get; set; } = 0;
    public int BookmarkCount { get; set; } = 0;
    public bool IsFeatured { get; set; } = false;
    public bool IsPublished { get; set; } = true;
    public string CanonicalUrl { get; set; } = string.Empty;
    public DateTime PublishedAt { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<string> Tags { get; set; } = new List<string>();
}

