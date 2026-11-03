using System;
using System.Collections.Generic;

namespace developerSlate.Models.Domain;

public class Role
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty; // e.g., "Admin", "Maintainer", "Developer", "Viewer"
    public string Description { get; set; } = string.Empty;
    public bool IsSystemRole { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<RoleScreenPermission> Permissions { get; set; } = new List<RoleScreenPermission>();
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}

public class RoleScreenPermission
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RoleId { get; set; }
    public Role? Role { get; set; }

    public string ScreenKey { get; set; } = string.Empty;      // e.g., "questions", "blogs", "chat", "roles-management", etc.
    public string ScreenName { get; set; } = string.Empty;     // e.g., "Problem Explorer", "Technical Articles", etc.
    public string ScreenCategory { get; set; } = string.Empty; // e.g., "Platform Feeds", "Workbench", "Administration"
    public string Description { get; set; } = string.Empty;
    public bool CanRead { get; set; } = true;
    public bool CanWrite { get; set; } = false;
}

public class UserRole
{
    public Guid UserId { get; set; }
    public User? User { get; set; }

    public Guid RoleId { get; set; }
    public Role? Role { get; set; }

    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
}

public static class AppScreens
{
    public static readonly List<(string Key, string Name, string Category, string Description)> All = new()
    {
        ("questions", "Problem Explorer & Discussions", "Platform Feeds", "Browse and search technical challenges, answers, and code threads"),
        ("studio", "Publishing Studio (Ask Question)", "Workbench & Tools", "Submit new debugging questions, benchmarks, and code problems"),
        ("blogs", "Engineering Articles & RFCs", "Platform Feeds", "Read technical whitepapers, RFC proposals, and kernel architecture posts"),
        ("blogs-write", "Author Articles & RFCs", "Platform Feeds", "Draft and publish peer-reviewed RFC whitepapers and articles"),
        ("tags", "Technology Directory & Tags", "Platform Feeds", "Explore tag taxonomies, growth metrics, and technologies"),
        ("notebook", "Code Notebook Vault", "Workbench & Tools", "Save and manage reusable code snippets and architectural recipes"),
        ("diff", "Code Diff Viewer", "Workbench & Tools", "Inspect git patch diffs, hunks, and multi-file changes"),
        ("ast", "AST Visualizer", "Workbench & Tools", "Explore AST syntax node trees and parser diagnostics"),
        ("chat", "Live Terminal Channels & DMs", "Real-time & Identity", "Real-time developer chat, SignalR code exchanges, and threads"),
        ("profile", "Developer Profile & Reputation", "Real-time & Identity", "Developer telemetry, verified proficiencies, and endorsements"),
        ("roles-management", "Roles & Screen Permissions", "Administration", "Configure security roles and assign read/write privileges per screen"),
        ("users-management", "User Roles Assignment", "Administration", "Manage registered developers and assign system access roles")
    };
}

