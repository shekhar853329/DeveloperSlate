using System;
using System.Collections.Generic;

namespace developerSlate.Models.Domain;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Username { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string PasswordSalt { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string Title { get; set; } = "Systems Architect & Core Contributor";
    public string Location { get; set; } = "San Francisco, CA";
    public string GithubHandle { get; set; } = string.Empty;
    public int Reputation { get; set; } = 14840;
    public int MonthlyReputationDelta { get; set; } = 412;
    public double AcceptanceRate { get; set; } = 98.4;
    public int SolvedCount { get; set; } = 142;
    public int ArticlesCount { get; set; } = 18;
    public int QuestionCount { get; set; } = 14;
    public int ImpactScore { get; set; } = 3800000;
    public string EngineeringReach { get; set; } = "3.8M";
    public int DevsHelpedCount { get; set; } = 48000;
    public int BountiesClaimedAmount { get; set; } = 4200;
    public int BountyPoints { get; set; } = 8500;
    public int PeerRfcCount { get; set; } = 64;
    public int GistsCount { get; set; } = 89;
    public int TotalContributionEvents { get; set; } = 1420;
    public string PeakActivityHours { get; set; } = "21:00 - 03:00 UTC";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsOnline { get; set; } = true;
    public DateTime LastActiveAt { get; set; } = DateTime.UtcNow;

    public ICollection<UserProficiency> Proficiencies { get; set; } = new List<UserProficiency>();
    public ICollection<PeerEndorsement> PeerEndorsements { get; set; } = new List<PeerEndorsement>();
    public ICollection<ProfileVerifiedSolution> VerifiedSolutions { get; set; } = new List<ProfileVerifiedSolution>();
    public ICollection<Question> Questions { get; set; } = new List<Question>();
    public ICollection<Answer> Answers { get; set; } = new List<Answer>();
    public ICollection<BlogPost> BlogPosts { get; set; } = new List<BlogPost>();
    public ICollection<SavedSnippet> SavedSnippets { get; set; } = new List<SavedSnippet>();
    public ICollection<ChatParticipant> ChatParticipations { get; set; } = new List<ChatParticipant>();
    public ICollection<ChatMessage> SentMessages { get; set; } = new List<ChatMessage>();
}

