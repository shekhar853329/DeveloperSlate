using System;
using System.Collections.Generic;

namespace developerSlate.Models.Domain;

public class Tag
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string IconName { get; set; } = string.Empty;
    public string AccentColor { get; set; } = string.Empty;
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
    public int Score { get; set; } = 0;
    public string Tier { get; set; } = string.Empty;
    public string LevelTitle { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ReputationBonus { get; set; } = string.Empty;
    public int VerifiedSolutionsCount { get; set; } = 0;
    public string Icon { get; set; } = string.Empty;
}

