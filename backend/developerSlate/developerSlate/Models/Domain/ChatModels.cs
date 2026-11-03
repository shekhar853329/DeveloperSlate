using System;
using System.Collections.Generic;

namespace developerSlate.Models.Domain;

public class ChatConversation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public bool IsGroup { get; set; } = false;
    public string? ChannelTopic { get; set; }
    public string? AvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ChatParticipant> Participants { get; set; } = new List<ChatParticipant>();
    public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
}

public class ChatParticipant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ConversationId { get; set; }
    public ChatConversation? Conversation { get; set; }
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public bool IsAdmin { get; set; } = false;
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastReadAt { get; set; } = DateTime.UtcNow;
}

public class ChatMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ConversationId { get; set; }
    public ChatConversation? Conversation { get; set; }
    public Guid SenderId { get; set; }
    public User? Sender { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? CodeSnippet { get; set; }
    public string? CodeLanguage { get; set; }
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public bool IsRead { get; set; } = false;
    public bool HasAttachment { get; set; } = false;
}

