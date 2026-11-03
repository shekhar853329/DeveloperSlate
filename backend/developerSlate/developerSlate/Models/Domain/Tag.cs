using System;
using System.Collections.Generic;

namespace developerSlate.Models.Domain;

public class Tag
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = "Language"; // Language, Cloud & Infra, Database, Framework, Systems
    public string IconName { get; set; } = "code";
    public string AccentColor { get; set; } = "#38bdf8";
    public int QuestionCount { get; set; } = 0;
    public double WeeklyGrowthPercent { get; set; } = 0.0;
    public bool IsTrending { get; set; } = false;

    public ICollection<QuestionTag> QuestionTags { get; set; } = new List<QuestionTag>();
}

public class UserProficiency
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string Technology { get; set; } = string.Empty;
    public int Score { get; set; } = 95;
    public string Tier { get; set; } = "Top 1%"; // Top 1%, Top 5%, Senior
    public string LevelTitle { get; set; } = "Level 8 • Grandmaster";
    public string Description { get; set; } = string.Empty;
    public string ReputationBonus { get; set; } = "+6,420 rep";
    public int VerifiedSolutionsCount { get; set; } = 42;
    public string Icon { get; set; } = "terminal";
}

