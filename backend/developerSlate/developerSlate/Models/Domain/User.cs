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
    public string Title { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string GithubHandle { get; set; } = string.Empty;
    public long? GithubId { get; set; }
    public int Reputation { get; set; } = 0;
    public int MonthlyReputationDelta { get; set; } = 0;
    public double AcceptanceRate { get; set; } = 0;
    public int SolvedCount { get; set; } = 0;
    public int ArticlesCount { get; set; } = 0;
    public int QuestionCount { get; set; } = 0;
    public int ImpactScore { get; set; } = 0;
    public string EngineeringReach { get; set; } = string.Empty;
    public int DevsHelpedCount { get; set; } = 0;
    public int BountiesClaimedAmount { get; set; } = 0;
    public int BountyPoints { get; set; } = 0;
    public int PeerRfcCount { get; set; } = 0;
    public int GistsCount { get; set; } = 0;
    public int TotalContributionEvents { get; set; } = 0;
    public string PeakActivityHours { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsOnline { get; set; } = false;
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
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}

