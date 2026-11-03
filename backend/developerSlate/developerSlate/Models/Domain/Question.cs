using System;
using System.Collections.Generic;

namespace developerSlate.Models.Domain;

public class Question
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string ContentMarkdown { get; set; } = string.Empty;
    public string? CodeSnippet { get; set; }
    public string? Language { get; set; }
    public Guid AuthorId { get; set; }
    public User? Author { get; set; }
    public int Upvotes { get; set; } = 0;
    public int Downvotes { get; set; } = 0;
    public int Score => Upvotes - Downvotes;
    public int ViewCount { get; set; } = 0;
    public bool IsSolved { get; set; } = false;
    public Guid? AcceptedAnswerId { get; set; }
    public Answer? AcceptedAnswer { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Answer> Answers { get; set; } = new List<Answer>();
    public ICollection<QuestionTag> QuestionTags { get; set; } = new List<QuestionTag>();
    public ICollection<Vote> Votes { get; set; } = new List<Vote>();
}

public class Answer
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid QuestionId { get; set; }
    public Question? Question { get; set; }
    public string ContentMarkdown { get; set; } = string.Empty;
    public string? CodeSnippet { get; set; }
    public string? Language { get; set; }
    public Guid AuthorId { get; set; }
    public User? Author { get; set; }
    public int Upvotes { get; set; } = 0;
    public int Downvotes { get; set; } = 0;
    public int Score => Upvotes - Downvotes;
    public bool IsAccepted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Vote> Votes { get; set; } = new List<Vote>();
}

public class QuestionTag
{
    public Guid QuestionId { get; set; }
    public Question? Question { get; set; }
    public Guid TagId { get; set; }
    public Tag? Tag { get; set; }
}

public class Vote
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public Guid? QuestionId { get; set; }
    public Question? Question { get; set; }
    public Guid? AnswerId { get; set; }
    public Answer? Answer { get; set; }
    public int Value { get; set; } // +1 or -1
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

