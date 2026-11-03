using Microsoft.AspNetCore.SignalR;
using developerSlate.Data;
using Microsoft.EntityFrameworkCore;

namespace developerSlate.Hubs;

public class CommunityHub : Hub
{
    private readonly AppDbContext _context;

    public CommunityHub(AppDbContext context)
    {
        _context = context;
    }

    public async Task VoteQuestion(string questionId, int delta)
    {
        if (Guid.TryParse(questionId, out var qId))
        {
            var q = await _context.Questions.FindAsync(qId);
            if (q != null)
            {
                if (delta > 0) q.Upvotes += delta;
                else q.Downvotes += Math.Abs(delta);
                await _context.SaveChangesAsync();

                await Clients.All.SendAsync("QuestionScoreUpdated", new { questionId = q.Id, upvotes = q.Upvotes, downvotes = q.Downvotes, score = q.Score });
            }
        }
    }

    public async Task VoteAnswer(string answerId, int delta)
    {
        if (Guid.TryParse(answerId, out var aId))
        {
            var a = await _context.Answers.FindAsync(aId);
            if (a != null)
            {
                if (delta > 0) a.Upvotes += delta;
                else a.Downvotes += Math.Abs(delta);
                await _context.SaveChangesAsync();

                await Clients.All.SendAsync("AnswerScoreUpdated", new { answerId = a.Id, questionId = a.QuestionId, upvotes = a.Upvotes, downvotes = a.Downvotes, score = a.Score });
            }
        }
    }
}

