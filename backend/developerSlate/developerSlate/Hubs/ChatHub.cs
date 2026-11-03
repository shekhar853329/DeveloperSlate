using Microsoft.AspNetCore.SignalR;
using developerSlate.Data;
using developerSlate.Models.Domain;
using Microsoft.EntityFrameworkCore;

namespace developerSlate.Hubs;

public class ChatHub : Hub
{
    private readonly AppDbContext _context;
    private static readonly Dictionary<string, string> ActiveUsers = new(); // ConnectionId -> Username

    public ChatHub(AppDbContext context)
    {
        _context = context;
    }

    public async Task JoinConversation(string conversationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);
        await Clients.Group(conversationId).SendAsync("UserJoined", Context.ConnectionId);
    }

    public async Task LeaveConversation(string conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId);
        await Clients.Group(conversationId).SendAsync("UserLeft", Context.ConnectionId);
    }

    public async Task SendMessage(string conversationId, string senderUsername, string content, string? codeSnippet = null, string? codeLanguage = null)
    {
        var conversationGuid = Guid.TryParse(conversationId, out var parsedId) ? parsedId : Guid.Empty;
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == senderUsername)
                   ?? await _context.Users.FirstOrDefaultAsync();

        if (user != null && conversationGuid != Guid.Empty)
        {
            var msg = new ChatMessage
            {
                ConversationId = conversationGuid,
                SenderId = user.Id,
                Content = content,
                CodeSnippet = codeSnippet,
                CodeLanguage = codeLanguage,
                SentAt = DateTime.UtcNow,
                IsRead = false
            };

            _context.ChatMessages.Add(msg);
            await _context.SaveChangesAsync();

            var payload = new
            {
                id = msg.Id,
                conversationId = conversationId,
                senderId = user.Id,
                senderUsername = user.Username,
                senderDisplayName = user.DisplayName,
                senderAvatar = user.AvatarUrl,
                content = msg.Content,
                codeSnippet = msg.CodeSnippet,
                codeLanguage = msg.CodeLanguage,
                sentAt = msg.SentAt,
                isRead = false
            };

            await Clients.Group(conversationId).SendAsync("ReceiveMessage", payload);
            await Clients.All.SendAsync("ConversationUpdated", new { conversationId, lastMessage = content, timestamp = msg.SentAt });
        }
    }

    public async Task SendTyping(string conversationId, string username, bool isTyping)
    {
        await Clients.OthersInGroup(conversationId).SendAsync("UserTyping", new { username, isTyping });
    }

    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}

