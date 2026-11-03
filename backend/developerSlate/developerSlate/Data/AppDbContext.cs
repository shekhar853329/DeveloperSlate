using Microsoft.EntityFrameworkCore;
using developerSlate.Models.Domain;

namespace developerSlate.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<UserProficiency> UserProficiencies => Set<UserProficiency>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<Answer> Answers => Set<Answer>();
    public DbSet<QuestionTag> QuestionTags => Set<QuestionTag>();
    public DbSet<Vote> Votes => Set<Vote>();
    public DbSet<BlogPost> BlogPosts => Set<BlogPost>();
    public DbSet<SavedSnippet> SavedSnippets => Set<SavedSnippet>();
    public DbSet<CodeDiff> CodeDiffs => Set<CodeDiff>();
    public DbSet<AstComparison> AstComparisons => Set<AstComparison>();
    public DbSet<ChatConversation> ChatConversations => Set<ChatConversation>();
    public DbSet<ChatParticipant> ChatParticipants => Set<ChatParticipant>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
    public DbSet<PeerEndorsement> PeerEndorsements => Set<PeerEndorsement>();
    public DbSet<ProfileVerifiedSolution> ProfileVerifiedSolutions => Set<ProfileVerifiedSolution>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Many-to-Many: Question <-> Tag
        modelBuilder.Entity<QuestionTag>()
            .HasKey(qt => new { qt.QuestionId, qt.TagId });

        modelBuilder.Entity<QuestionTag>()
            .HasOne(qt => qt.Question)
            .WithMany(q => q.QuestionTags)
            .HasForeignKey(qt => qt.QuestionId);

        modelBuilder.Entity<QuestionTag>()
            .HasOne(qt => qt.Tag)
            .WithMany(t => t.QuestionTags)
            .HasForeignKey(qt => qt.TagId);

        // Question -> Author
        modelBuilder.Entity<Question>()
            .HasOne(q => q.Author)
            .WithMany(u => u.Questions)
            .HasForeignKey(q => q.AuthorId)
            .OnDelete(DeleteBehavior.Restrict);

        // Question -> AcceptedAnswer
        modelBuilder.Entity<Question>()
            .HasOne(q => q.AcceptedAnswer)
            .WithMany()
            .HasForeignKey(q => q.AcceptedAnswerId)
            .OnDelete(DeleteBehavior.SetNull);

        // Answer -> Question
        modelBuilder.Entity<Answer>()
            .HasOne(a => a.Question)
            .WithMany(q => q.Answers)
            .HasForeignKey(a => a.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Answer -> Author
        modelBuilder.Entity<Answer>()
            .HasOne(a => a.Author)
            .WithMany(u => u.Answers)
            .HasForeignKey(a => a.AuthorId)
            .OnDelete(DeleteBehavior.Restrict);

        // Votes
        modelBuilder.Entity<Vote>()
            .HasOne(v => v.User)
            .WithMany()
            .HasForeignKey(v => v.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Vote>()
            .HasOne(v => v.Question)
            .WithMany(q => q.Votes)
            .HasForeignKey(v => v.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Vote>()
            .HasOne(v => v.Answer)
            .WithMany(a => a.Votes)
            .HasForeignKey(v => v.AnswerId)
            .OnDelete(DeleteBehavior.Cascade);

        // Chat
        modelBuilder.Entity<ChatParticipant>()
            .HasOne(cp => cp.Conversation)
            .WithMany(c => c.Participants)
            .HasForeignKey(cp => cp.ConversationId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ChatParticipant>()
            .HasOne(cp => cp.User)
            .WithMany(u => u.ChatParticipations)
            .HasForeignKey(cp => cp.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ChatMessage>()
            .HasOne(cm => cm.Conversation)
            .WithMany(c => c.Messages)
            .HasForeignKey(cm => cm.ConversationId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ChatMessage>()
            .HasOne(cm => cm.Sender)
            .WithMany(u => u.SentMessages)
            .HasForeignKey(cm => cm.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes for Postgres performance
        modelBuilder.Entity<Question>()
            .HasIndex(q => q.CreatedAt);
        modelBuilder.Entity<Question>()
            .HasIndex(q => q.IsSolved);
        modelBuilder.Entity<Tag>()
            .HasIndex(t => t.Slug)
            .IsUnique();
        modelBuilder.Entity<BlogPost>()
            .HasIndex(b => b.Slug)
            .IsUnique();
    }
}

