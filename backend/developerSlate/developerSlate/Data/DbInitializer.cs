using System;
using System.Collections.Generic;
using System.Linq;
using developerSlate.Models.Domain;
using Microsoft.EntityFrameworkCore;

namespace developerSlate.Data;

public static class DbInitializer
{
    public static void Initialize(AppDbContext context)
    {
        // Ensure created or migrated
        try
        {
            context.Database.EnsureCreated();
            context.Database.ExecuteSqlRaw(@"
                CREATE TABLE IF NOT EXISTS ""PeerEndorsements"" (
                    ""Id"" uuid NOT NULL PRIMARY KEY,
                    ""UserId"" uuid NOT NULL,
                    ""AuthorName"" text NOT NULL DEFAULT '',
                    ""AuthorTitle"" text NOT NULL DEFAULT '',
                    ""AuthorAvatarUrl"" text NOT NULL DEFAULT '',
                    ""Content"" text NOT NULL DEFAULT '',
                    ""VerifiedBadge"" text NOT NULL DEFAULT 'Verified Contributor',
                    ""CreatedAt"" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT ""FK_PeerEndorsements_Users_UserId"" FOREIGN KEY (""UserId"") REFERENCES ""Users"" (""Id"") ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS ""ProfileVerifiedSolutions"" (
                    ""Id"" uuid NOT NULL PRIMARY KEY,
                    ""UserId"" uuid NOT NULL,
                    ""Title"" text NOT NULL DEFAULT '',
                    ""VerificationBadge"" text NOT NULL DEFAULT 'cargo-clippy verified',
                    ""SolvedTimeAgo"" text NOT NULL DEFAULT 'Solved 3 days ago',
                    ""CodeSnippet"" text NOT NULL DEFAULT '',
                    ""Tags"" text[] NOT NULL DEFAULT ARRAY[]::text[],
                    ""Upvotes"" integer NOT NULL DEFAULT 0,
                    ""Views"" integer NOT NULL DEFAULT 0,
                    ""CreatedAt"" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT ""FK_ProfileVerifiedSolutions_Users_UserId"" FOREIGN KEY (""UserId"") REFERENCES ""Users"" (""Id"") ON DELETE CASCADE
                );

                ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""PasswordHash"" text DEFAULT '';
                ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""PasswordSalt"" text DEFAULT '';
                ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""MonthlyReputationDelta"" integer DEFAULT 412;
                ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""AcceptanceRate"" double precision DEFAULT 98.4;
                ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""ArticlesCount"" integer DEFAULT 18;
                ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""EngineeringReach"" text DEFAULT '3.8M';
                ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""DevsHelpedCount"" integer DEFAULT 48000;
                ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""BountiesClaimedAmount"" integer DEFAULT 4200;
                ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""BountyPoints"" integer DEFAULT 8500;
                ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""PeerRfcCount"" integer DEFAULT 64;
                ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""GistsCount"" integer DEFAULT 89;
                ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""TotalContributionEvents"" integer DEFAULT 1420;
                ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""PeakActivityHours"" text DEFAULT '21:00 - 03:00 UTC';

                ALTER TABLE ""UserProficiencies"" ADD COLUMN IF NOT EXISTS ""LevelTitle"" text DEFAULT '';
                ALTER TABLE ""UserProficiencies"" ADD COLUMN IF NOT EXISTS ""Description"" text DEFAULT '';
                ALTER TABLE ""UserProficiencies"" ADD COLUMN IF NOT EXISTS ""ReputationBonus"" text DEFAULT '';
            ");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Database initialization note: {ex.Message}");
        }

        developerSlate.Services.PasswordHasher.CreatePasswordHash("Password123!", out var defaultHash, out var defaultSalt);

        // Update existing users or seed if empty
        var alexExisting = context.Users.FirstOrDefault(u => u.Username.ToLower() == "alexchen");
        if (alexExisting != null)
        {
            alexExisting.Reputation = 14840;
            alexExisting.MonthlyReputationDelta = 412;
            alexExisting.AcceptanceRate = 98.4;
            alexExisting.SolvedCount = 142;
            alexExisting.ArticlesCount = 18;
            alexExisting.QuestionCount = 14;
            alexExisting.ImpactScore = 3800000;
            alexExisting.EngineeringReach = "3.8M";
            alexExisting.DevsHelpedCount = 48000;
            alexExisting.BountiesClaimedAmount = 4200;
            alexExisting.BountyPoints = 8500;
            alexExisting.PeerRfcCount = 64;
            alexExisting.GistsCount = 89;
            alexExisting.TotalContributionEvents = 1420;
            alexExisting.PeakActivityHours = "21:00 - 03:00 UTC";
            alexExisting.Title = "Principal Systems Engineer";
            alexExisting.Bio = "Systems Architect focusing on distributed consensus, high-throughput networking, and low-latency Rust runtimes. Maintainer of KernelFlow and open-source contributor.";
            alexExisting.GithubHandle = "alexchen-dev";
            context.SaveChanges();

            // Check proficiencies
            var hasDetailedProfs = context.UserProficiencies.Any(p => p.UserId == alexExisting.Id && !string.IsNullOrEmpty(p.LevelTitle));
            if (!hasDetailedProfs)
            {
                var oldProfs = context.UserProficiencies.Where(p => p.UserId == alexExisting.Id).ToList();
                context.UserProficiencies.RemoveRange(oldProfs);
                context.UserProficiencies.AddRange(
                    new UserProficiency
                    {
                        UserId = alexExisting.Id,
                        Technology = "Rust & Async Tokio",
                        Score = 98,
                        Tier = "Top 0.5%",
                        LevelTitle = "Level 8 • Grandmaster",
                        Description = "Tokio async runtime, pinning memory layouts, SIMD vectorization.",
                        ReputationBonus = "+6,420 rep",
                        VerifiedSolutionsCount = 84,
                        Icon = "terminal"
                    },
                    new UserProficiency
                    {
                        UserId = alexExisting.Id,
                        Technology = "Distributed Systems & Raft",
                        Score = 95,
                        Tier = "Top 1%",
                        LevelTitle = "Level 7 • Architect",
                        Description = "Raft consensus, vector clocks, multi-region replication.",
                        ReputationBonus = "+3,810 rep",
                        VerifiedSolutionsCount = 38,
                        Icon = "hub"
                    },
                    new UserProficiency
                    {
                        UserId = alexExisting.Id,
                        Technology = "Kubernetes & eBPF",
                        Score = 91,
                        Tier = "Top 2%",
                        LevelTitle = "Level 6 • Kernel Ops",
                        Description = "eBPF telemetry, custom k8s operators, cgroups v2 resource quotas.",
                        ReputationBonus = "+2,140 rep",
                        VerifiedSolutionsCount = 21,
                        Icon = "cloud"
                    },
                    new UserProficiency
                    {
                        UserId = alexExisting.Id,
                        Technology = "PostgreSQL & Storage",
                        Score = 88,
                        Tier = "Top 5%",
                        LevelTitle = "Level 5 • Lead Dev",
                        Description = "B-Tree indexes, WAL tuning, query plan optimization, JSONB indexing.",
                        ReputationBonus = "+1,470 rep",
                        VerifiedSolutionsCount = 16,
                        Icon = "database"
                    }
                );
                context.SaveChanges();
            }

            // Endorsements
            if (!context.PeerEndorsements.Any(e => e.UserId == alexExisting.Id))
            {
                context.PeerEndorsements.AddRange(
                    new PeerEndorsement
                    {
                        UserId = alexExisting.Id,
                        AuthorName = "Elena Rostova",
                        AuthorTitle = "VP of Distributed Systems @ CloudScale",
                        AuthorAvatarUrl = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
                        VerifiedBadge = "Verified Peer",
                        Content = "Alex's deep understanding of Rust concurrency and memory pinning helped our team eliminate microsecond tail latencies in our packet forwarding engine. Truly exceptional engineer."
                    },
                    new PeerEndorsement
                    {
                        UserId = alexExisting.Id,
                        AuthorName = "David Kim",
                        AuthorTitle = "Staff Infrastructure Engineer @ KernelCore",
                        AuthorAvatarUrl = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
                        VerifiedBadge = "Core Contributor",
                        Content = "Consistently delivers the highest quality architectural reviews. His solutions to Raft consensus partitions are gold-standard implementations across the ecosystem."
                    }
                );
                context.SaveChanges();
            }

            // Verified Solutions
            if (!context.ProfileVerifiedSolutions.Any(s => s.UserId == alexExisting.Id))
            {
                context.ProfileVerifiedSolutions.AddRange(
                    new ProfileVerifiedSolution
                    {
                        UserId = alexExisting.Id,
                        Title = "Optimizing Tokio work-stealing scheduler for low-latency UDP packet processing",
                        VerificationBadge = "cargo-clippy verified",
                        SolvedTimeAgo = "Solved 3 days ago",
                        CodeSnippet = @"// Pin worker threads to physical cores to avoid L3 cache misses
let core_ids = core_affinity::get_core_ids().unwrap();
let runtime = tokio::runtime::Builder::new_multi_thread()
    .worker_threads(core_ids.len())
    .on_thread_start(move || {
        let core = core_ids[tokio::task::id() % core_ids.len()];
        core_affinity::set_for_current(core);
    })
    .enable_all()
    .build()?;",
                        Tags = new List<string> { "rust", "tokio", "concurrency", "low-latency" },
                        Upvotes = 142,
                        Views = 4120
                    },
                    new ProfileVerifiedSolution
                    {
                        UserId = alexExisting.Id,
                        Title = "Eliminating allocation overhead in zero-copy ring buffers using io_uring",
                        VerificationBadge = "cargo-clippy verified",
                        SolvedTimeAgo = "Solved 2 weeks ago",
                        CodeSnippet = @"pub struct ZeroCopyBuffer<T> {
    ring: IoUring,
    mmap_ptr: *mut T,
    capacity: usize,
}
impl<T> ZeroCopyBuffer<T> {
    pub unsafe fn submit_pinned(&mut self, fd: RawFd, slice: &[u8]) -> io::Result<()> {
        // Direct kernel submission avoiding user-space copy
    }
}",
                        Tags = new List<string> { "rust", "io-uring", "kernel", "memory" },
                        Upvotes = 98,
                        Views = 2890
                    },
                    new ProfileVerifiedSolution
                    {
                        UserId = alexExisting.Id,
                        Title = "Resolving deadlocks in Raft state transitions under network partition storms",
                        VerificationBadge = "Formal Verification: TLA+",
                        SolvedTimeAgo = "Solved 1 month ago",
                        CodeSnippet = @"if self.current_term < candidate_term {
    self.step_down_to_follower(candidate_term);
    self.vote_granted = Some(candidate_id);
    self.persist_state()?;
}",
                        Tags = new List<string> { "distributed-systems", "raft", "consensus", "high-availability" },
                        Upvotes = 184,
                        Views = 5410
                    }
                );
                context.SaveChanges();
            }

            // Featured RFCs
            if (!context.BlogPosts.Any(b => b.AuthorId == alexExisting.Id && b.Slug == "rfc-042-formal-verification-raft-rust"))
            {
                context.BlogPosts.AddRange(
                    new BlogPost
                    {
                        Title = "RFC #042: Formal Verification of State Machine Replication in Rust",
                        Slug = "rfc-042-formal-verification-raft-rust",
                        Subtitle = "Proposing a verified consensus state machine transition spec using TLA+ and Rust model checking.",
                        Excerpt = "Proposing a verified consensus state machine transition spec using TLA+ and Rust model checking.",
                        ContentMarkdown = "Detailed RFC specifications for consensus state machine transitions.",
                        CoverImageUrl = "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
                        AuthorId = alexExisting.Id,
                        ReadingTimeMinutes = 12,
                        ClapsCount = 412,
                        BookmarkCount = 180,
                        IsFeatured = true,
                        IsPublished = true,
                        Tags = new List<string> { "RFC", "Rust", "Distributed Systems" },
                        PublishedAt = DateTime.UtcNow.AddDays(-12)
                    },
                    new BlogPost
                    {
                        Title = "Deep-Dive: Inside the Linux eBPF Verifier for High-Throughput Packet Filtering",
                        Slug = "inside-linux-ebpf-verifier-packet-filtering",
                        Subtitle = "Analyzing instruction limits, register states, and zero-overhead kernel telemetry.",
                        Excerpt = "Analyzing instruction limits, register states, and zero-overhead kernel telemetry.",
                        ContentMarkdown = "In-depth breakdown of Linux eBPF verifier safety proofs and DAG validation.",
                        CoverImageUrl = "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
                        AuthorId = alexExisting.Id,
                        ReadingTimeMinutes = 18,
                        ClapsCount = 620,
                        BookmarkCount = 295,
                        IsFeatured = true,
                        IsPublished = true,
                        Tags = new List<string> { "eBPF", "Linux", "Networking", "Kernel" },
                        PublishedAt = DateTime.UtcNow.AddDays(-20)
                    }
                );
                context.SaveChanges();
            }
        }

        if (context.Users.Any())
        {
            var unseededUsers = context.Users.Where(u => string.IsNullOrEmpty(u.PasswordHash)).ToList();
            if (unseededUsers.Any())
            {
                foreach (var u in unseededUsers)
                {
                    u.PasswordHash = defaultHash;
                    u.PasswordSalt = defaultSalt;
                }
                context.SaveChanges();
            }
            return; // DB has been seeded
        }

        // 1. Users

        var alex = new User
        {
            Username = "alexchen",
            DisplayName = "Alex Chen",
            Email = "alex.chen@kernel.io",
            PasswordHash = defaultHash,
            PasswordSalt = defaultSalt,
            AvatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            Bio = "Systems Architect focusing on distributed consensus, high-throughput networking, and low-latency Rust runtimes. Maintainer of KernelFlow and open-source contributor.",
            Title = "Principal Systems Engineer",
            Location = "San Francisco, CA",
            GithubHandle = "alexchen-dev",
            Reputation = 4850,
            SolvedCount = 84,
            QuestionCount = 32,
            ImpactScore = 142000,
            IsOnline = true,
            LastActiveAt = DateTime.UtcNow
        };

        var amara = new User
        {
            Username = "amaravance",
            DisplayName = "Amara Vance",
            Email = "amara.v@rustaceans.org",
            PasswordHash = defaultHash,
            PasswordSalt = defaultSalt,
            AvatarUrl = "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
            Bio = "Concurrency enthusiast, Tokio core contributor, async runtime researcher.",
            Title = "Staff Concurrency Engineer",
            Location = "Seattle, WA",
            GithubHandle = "amaravance",
            Reputation = 3920,
            SolvedCount = 61,
            QuestionCount = 18,
            ImpactScore = 98000,
            IsOnline = true,
            LastActiveAt = DateTime.UtcNow
        };

        var julian = new User
        {
            Username = "julianchen",
            DisplayName = "Julian Chen",
            Email = "julian@infraops.dev",
            PasswordHash = defaultHash,
            PasswordSalt = defaultSalt,
            AvatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            Bio = "Cloud Native & Kubernetes maintainer. Cgroups v2 and container runtime debugging.",
            Title = "Lead Infrastructure Architect",
            Location = "Austin, TX",
            GithubHandle = "julian-infra",
            Reputation = 3150,
            SolvedCount = 47,
            QuestionCount = 14,
            ImpactScore = 76000,
            IsOnline = false,
            LastActiveAt = DateTime.UtcNow.AddMinutes(-45)
        };

        var sophie = new User
        {
            Username = "sophievarma",
            DisplayName = "Sophie Varma",
            Email = "sophie@dbperf.io",
            PasswordHash = defaultHash,
            PasswordSalt = defaultSalt,
            AvatarUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
            Bio = "PostgreSQL indexing ninja. Query plan optimizer and database internals architect.",
            Title = "Senior Database Specialist",
            Location = "Boston, MA",
            GithubHandle = "sophie-db",
            Reputation = 4210,
            SolvedCount = 78,
            QuestionCount = 22,
            ImpactScore = 115000,
            IsOnline = true,
            LastActiveAt = DateTime.UtcNow
        };

        context.Users.AddRange(alex, amara, julian, sophie);
        context.SaveChanges();

        // 2. Proficiencies for Alex
        var proficiencies = new List<UserProficiency>
        {
            new() { UserId = alex.Id, Technology = "Rust & Async Tokio", Score = 98, Tier = "Top 0.5%", VerifiedSolutionsCount = 42, Icon = "terminal" },
            new() { UserId = alex.Id, Technology = "PostgreSQL Internals", Score = 94, Tier = "Top 1%", VerifiedSolutionsCount = 28, Icon = "database" },
            new() { UserId = alex.Id, Technology = "Kubernetes & eBPF", Score = 91, Tier = "Top 2%", VerifiedSolutionsCount = 19, Icon = "cloud" },
            new() { UserId = alex.Id, Technology = "TypeScript Typesystem", Score = 89, Tier = "Top 5%", VerifiedSolutionsCount = 15, Icon = "code" }
        };
        context.UserProficiencies.AddRange(proficiencies);

        // 3. Tags
        var tagRust = new Tag { Name = "Rust", Slug = "rust", Description = "Memory safety without garbage collection, zero-cost abstractions, fearless concurrency.", Category = "Language", IconName = "code", AccentColor = "#f97316", QuestionCount = 1420, WeeklyGrowthPercent = 14.8, IsTrending = true };
        var tagTokio = new Tag { Name = "Tokio", Slug = "tokio", Description = "An asynchronous runtime for the Rust programming language with work-stealing schedulers.", Category = "Framework", IconName = "speed", AccentColor = "#38bdf8", QuestionCount = 680, WeeklyGrowthPercent = 18.2, IsTrending = true };
        var tagPostgres = new Tag { Name = "PostgreSQL", Slug = "postgresql", Description = "Advanced open source object-relational database system with rich indexing and JSONB.", Category = "Database", IconName = "database", AccentColor = "#6366f1", QuestionCount = 2150, WeeklyGrowthPercent = 8.5, IsTrending = true };
        var tagK8s = new Tag { Name = "Kubernetes", Slug = "kubernetes", Description = "Automated container deployment, scaling, and operational management at enterprise scale.", Category = "Cloud & Infra", IconName = "cloud", AccentColor = "#38bdf8", QuestionCount = 3100, WeeklyGrowthPercent = 11.2, IsTrending = false };
        var tagTs = new Tag { Name = "TypeScript", Slug = "typescript", Description = "Strongly typed programming language that builds on JavaScript, giving better tooling.", Category = "Language", IconName = "code", AccentColor = "#3b82f6", QuestionCount = 4200, WeeklyGrowthPercent = 6.4, IsTrending = false };
        var tagDocker = new Tag { Name = "Docker", Slug = "docker", Description = "OS-level virtualization delivering software in packages called containers.", Category = "Cloud & Infra", IconName = "developer_board", AccentColor = "#0ea5e9", QuestionCount = 1840, WeeklyGrowthPercent = 5.2, IsTrending = false };
        var tagEbpf = new Tag { Name = "eBPF", Slug = "ebpf", Description = "Revolutionary kernel technology to run sandboxed programs in an OS kernel safely.", Category = "Systems", IconName = "memory", AccentColor = "#10b981", QuestionCount = 410, WeeklyGrowthPercent = 32.5, IsTrending = true };
        var tagSignalR = new Tag { Name = "SignalR", Slug = "signalr", Description = "Real-time bi-directional communication between server and connected web clients.", Category = "Framework", IconName = "sync", AccentColor = "#ec4899", QuestionCount = 520, WeeklyGrowthPercent = 9.1, IsTrending = false };

        context.Tags.AddRange(tagRust, tagTokio, tagPostgres, tagK8s, tagTs, tagDocker, tagEbpf, tagSignalR);
        context.SaveChanges();

        // 4. Questions
        var q1 = new Question
        {
            Title = "Rust tokio deadlock with mutex guard across .await points in async worker thread",
            Slug = "rust-tokio-deadlock-mutex-guard-across-await-points",
            ContentMarkdown = "I have an asynchronous background processor using `tokio::spawn` handling multiplexed network buffers. When holding a standard `std::sync::Mutex` across an `.await` boundary, the task stalls indefinitely under high concurrency.\n\nHere is the minimal reproducible snippet:\n\n```rust\nuse std::sync::Mutex;\nuse std::sync::Arc;\n\nasync fn process_job(state: Arc<Mutex<JobState>>) {\n    let mut lock = state.lock().unwrap();\n    lock.pending_count += 1;\n    \n    // CRITICAL: Holding lock across .await point causes Send issues & deadlock!\n    tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;\n    \n    lock.completed_count += 1;\n}\n```\n\nHow do we properly design this without holding the lock across `.await` or when we need mutable state access?",
            CodeSnippet = @"let mut lock = state.lock().unwrap();
lock.pending_count += 1;
// Dangerous await while guard is in scope
tokio::time::sleep(Duration::from_millis(50)).await;
lock.completed_count += 1;",
            Language = "rust",
            AuthorId = alex.Id,
            Upvotes = 124,
            Downvotes = 2,
            ViewCount = 3840,
            IsSolved = true,
            CreatedAt = DateTime.UtcNow.AddDays(-2),
            UpdatedAt = DateTime.UtcNow.AddDays(-2)
        };

        var q2 = new Question
        {
            Title = "PostgreSQL slow query on composite index with JSONB gin_trgm_ops operator",
            Slug = "postgresql-slow-query-composite-index-jsonb-gin-trgm-ops",
            ContentMarkdown = "We have a 45M row table storing telemetry events in a `payload` JSONB column. Queries filtering by `tenant_id` and searching substrings inside `payload->>'metadata'` take over 4.2 seconds instead of doing an index scan. How can we write a multi-column GIN trigram index or functional index to achieve sub-10ms latency?",
            CodeSnippet = @"EXPLAIN ANALYZE
SELECT id, event_type, payload
FROM tenant_events
WHERE tenant_id = 'c7e9f4a1-0000-0000-0000-000000000000'
  AND payload->>'service_name' ILIKE '%ingress_proxy%'
ORDER BY created_at DESC
LIMIT 50;",
            Language = "sql",
            AuthorId = sophie.Id,
            Upvotes = 86,
            Downvotes = 1,
            ViewCount = 2190,
            IsSolved = true,
            CreatedAt = DateTime.UtcNow.AddDays(-5),
            UpdatedAt = DateTime.UtcNow.AddDays(-5)
        };

        var q3 = new Question
        {
            Title = "Kubernetes pod OOMKilled despite cgroups v2 memory limits set to 4GiB on containerd",
            Slug = "kubernetes-pod-oomkilled-cgroups-v2-memory-limits",
            ContentMarkdown = "Our worker pod runs out of memory and gets killed by the host kernel OOM killer rather than the cgroup memory controller. The pod limit is `4GiB` and node has plenty of free RAM. It seems page cache reclaim is failing on memory-mapped files.",
            CodeSnippet = @"resources:
  limits:
    memory: ""4Gi""
    cpu: ""2000m""
  requests:
    memory: ""2Gi""
    cpu: ""1000m""",
            Language = "yaml",
            AuthorId = julian.Id,
            Upvotes = 49,
            Downvotes = 0,
            ViewCount = 1420,
            IsSolved = false,
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow.AddDays(-1)
        };

        context.Questions.AddRange(q1, q2, q3);
        context.SaveChanges();

        // Question Tags
        context.QuestionTags.AddRange(
            new QuestionTag { QuestionId = q1.Id, TagId = tagRust.Id },
            new QuestionTag { QuestionId = q1.Id, TagId = tagTokio.Id },
            new QuestionTag { QuestionId = q2.Id, TagId = tagPostgres.Id },
            new QuestionTag { QuestionId = q3.Id, TagId = tagK8s.Id },
            new QuestionTag { QuestionId = q3.Id, TagId = tagDocker.Id }
        );
        context.SaveChanges();

        // 5. Answers
        var ans1 = new Answer
        {
            QuestionId = q1.Id,
            AuthorId = amara.Id,
            ContentMarkdown = "### Solution: Scope Guard & Use `tokio::sync::Mutex` or Message Passing\n\nThere are two fundamental rules when working with Tokio and locks:\n\n1. **Never hold `std::sync::MutexGuard` across an `.await` point**. `std::sync::MutexGuard` does not implement `Send`, so the future cannot be moved across threads in Tokio's multi-threaded work-stealing runtime.\n2. **Prefer explicit scoping** to drop the guard before the async suspension:\n\n```rust\n// Option A: Explicit block drop\n{\n    let mut lock = state.lock().unwrap();\n    lock.pending_count += 1;\n} // Guard dropped here!\n\ntokio::time::sleep(tokio::time::Duration::from_millis(50)).await;\n\n{\n    let mut lock = state.lock().unwrap();\n    lock.completed_count += 1;\n}\n```\n\nIf you truly must hold a lock across an await (e.g. reserving a critical transaction handle), switch to `tokio::sync::Mutex`:\n\n```rust\nuse tokio::sync::Mutex;\n\nlet mut lock = state.lock().await;\n// Safe across await points because tokio's guard implements Send\ntokio::time::sleep(tokio::time::Duration::from_millis(50)).await;\nlock.completed_count += 1;\n```",
            CodeSnippet = @"// Clean block scoping to drop lock before await
{
    let mut lock = state.lock().unwrap();
    lock.pending_count += 1;
} // dropped!

tokio::time::sleep(Duration::from_millis(50)).await;

{
    let mut lock = state.lock().unwrap();
    lock.completed_count += 1;
}",
            Language = "rust",
            Upvotes = 98,
            Downvotes = 0,
            IsAccepted = true,
            CreatedAt = DateTime.UtcNow.AddDays(-2).AddHours(1),
            UpdatedAt = DateTime.UtcNow.AddDays(-2).AddHours(1)
        };

        var ans2 = new Answer
        {
            QuestionId = q1.Id,
            AuthorId = sophie.Id,
            ContentMarkdown = "In addition to Amara's solution, if your worker only updates counters, consider `AtomicU64` or `mpsc::channel` message passing. It completely eliminates mutex contention on multi-core CPU workers.",
            Language = "rust",
            Upvotes = 32,
            Downvotes = 1,
            IsAccepted = false,
            CreatedAt = DateTime.UtcNow.AddDays(-2).AddHours(3)
        };

        context.Answers.AddRange(ans1, ans2);
        context.SaveChanges();

        q1.AcceptedAnswerId = ans1.Id;
        context.SaveChanges();

        // 6. Blog Posts
        var blog1 = new BlogPost
        {
            Title = "How We Scaled Our Distributed Raft Consensus Engine to 1.2M Writes/sec with Zero Data Loss",
            Slug = "scaled-distributed-raft-consensus-engine-1-2m-writes-sec",
            Subtitle = "Dissecting kernel bypass, batch commit pipelining, and memory-mapped log segments.",
            Excerpt = "A comprehensive architectural deep-dive into redesigning the log replication layer using io_uring, kernel bypass memory buffers, and SIMD-accelerated CRC validation.",
            ContentMarkdown = @"## System Architecture Overview

Scaling distributed consensus beyond 500k ops/sec traditionally hits wall-clock memory and sys-call bottlenecks. In this article, we share how we eliminated kernel context switching and tuned Raft heartbeats for zero data loss.

### 1. Batch Pipelining & io_uring
By replacing synchronous fsync syscalls with an async submission queue using Linux `io_uring`, we achieved true zero-copy log appends.

### 2. Micro-benchmarks
- Peak IOPS: **1,240,000 writes/sec**
- P99.9 latency: **1.82 milliseconds**
- Recovery Time Objective (RTO): **< 250ms**",
            CoverImageUrl = "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
            AuthorId = alex.Id,
            ReadingTimeMinutes = 11,
            ClapsCount = 1420,
            BookmarkCount = 530,
            IsFeatured = true,
            IsPublished = true,
            Tags = new List<string> { "Distributed Systems", "Rust", "io_uring", "Raft", "Performance" },
            PublishedAt = DateTime.UtcNow.AddDays(-4)
        };

        var blog2 = new BlogPost
        {
            Title = "Architecting a Resilient Event Sourcing System with PostgreSQL and Kafka",
            Slug = "architecting-resilient-event-sourcing-postgresql-kafka",
            Subtitle = "Transactional outbox pattern, optimistic concurrency, and zero-loss projections.",
            Excerpt = "Patterns and battle-tested code for ensuring dual-write atomicity between relational storage and distributed streaming topics.",
            ContentMarkdown = @"## The Transactional Outbox Pattern

When publishing events to an external message broker like Apache Kafka or RabbitMQ, performing a database write and broker produce in the same business flow will inevitably encounter partial failures.

By writing domain events directly into an `outbox` table within the same PostgreSQL ACID transaction, we guarantee that every state mutation has an associated durable event log.",
            CoverImageUrl = "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
            AuthorId = sophie.Id,
            ReadingTimeMinutes = 8,
            ClapsCount = 890,
            BookmarkCount = 310,
            IsFeatured = false,
            IsPublished = true,
            Tags = new List<string> { "PostgreSQL", "Kafka", "Event Sourcing", "Architecture" },
            PublishedAt = DateTime.UtcNow.AddDays(-7)
        };

        context.BlogPosts.AddRange(blog1, blog2);

        // 7. Saved Snippets
        var snippet1 = new SavedSnippet
        {
            UserId = alex.Id,
            Title = "Rust tokio deadlock with mutex guard held across .await points in async worker thread",
            Category = "Concurrency",
            Language = "rust",
            CodeContent = @"use tokio::sync::Mutex;
use std::sync::Arc;

struct WorkerPool {
    state: Arc<Mutex<PoolState>>,
}

impl WorkerPool {
    async fn execute_job(&self, job_id: u64) -> Result<(), AppError> {
        // Safe: Tokio mutex guard implements Send
        let mut guard = self.state.lock().await;
        guard.active_workers += 1;
        
        tokio::time::sleep(tokio::time::Duration::from_millis(20)).await;
        
        guard.active_workers -= 1;
        Ok(())
    }
}",
            Notes = "Verified pattern for worker pools. Avoid std::sync::Mutex when lock must span async yields.",
            IsPinned = true,
            Tags = new List<string> { "rust", "tokio", "concurrency" }
        };

        var snippet2 = new SavedSnippet
        {
            UserId = alex.Id,
            Title = "PostgreSQL 16: Composite index with JSONB gin_trgm_ops operator query optimization",
            Category = "Database",
            Language = "sql",
            CodeContent = @"CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_tenant_events_search 
ON tenant_events USING gin (tenant_id, ((payload->>'service_name')) gin_trgm_ops);",
            Notes = "Achieves index-only scan on composite jsonb trgm operations with sub-5ms lookup.",
            IsPinned = true,
            Tags = new List<string> { "postgresql", "indexing", "jsonb" }
        };

        context.SavedSnippets.AddRange(snippet1, snippet2);

        // 8. Code Diff
        var diff = new CodeDiff
        {
            Title = "Fix tokio mutex guard deadlock across yield boundaries",
            FilePath = "src/concurrency/worker_pool.rs",
            CommitHash = "8f3b20e",
            Author = "alexchen",
            Additions = 14,
            Deletions = 6,
            Language = "rust",
            OriginalCode = @"    // Old implementation: holds std::sync::Mutex across await
    let mut guard = self.state.lock().unwrap();
    guard.record_start();
    
    // BUG: Deadlock risk and Send trait violation
    tokio::time::sleep(timeout).await;
    
    guard.record_finish();",
            ModifiedCode = @"    // New implementation: scoped drop or tokio::sync::Mutex
    {
        let mut guard = self.state.lock().unwrap();
        guard.record_start();
    } // Guard dropped cleanly before await point
    
    tokio::time::sleep(timeout).await;
    
    {
        let mut guard = self.state.lock().unwrap();
        guard.record_finish();
    }"
        };
        context.CodeDiffs.Add(diff);

        // 9. AST Comparison
        var ast = new AstComparison
        {
            Name = "TypeScript AST: Generic Type Conditional Inference",
            Description = "Abstract Syntax Tree representation of mapped conditional types and infer keyword.",
            Language = "typescript",
            SourceCode = @"type Flatten<T> = T extends Array<infer Item> ? Item : T;",
            TargetCode = @"type UnpackPromise<T> = T extends Promise<infer R> ? R : T;",
            AstJson = @"{
  ""type"": ""TypeAliasDeclaration"",
  ""name"": ""Flatten"",
  ""typeParameters"": [{ ""name"": ""T"" }],
  ""type"": {
    ""type"": ""ConditionalType"",
    ""checkType"": { ""type"": ""TypeReference"", ""name"": ""T"" },
    ""extendsType"": {
      ""type"": ""TypeReference"",
      ""name"": ""Array"",
      ""typeArguments"": [{ ""type"": ""InferType"", ""typeParameter"": ""Item"" }]
    },
    ""trueType"": { ""type"": ""TypeReference"", ""name"": ""Item"" },
    ""falseType"": { ""type"": ""TypeReference"", ""name"": ""T"" }
  }
}"
        };
        context.AstComparisons.Add(ast);

        // 10. Chat Conversations & Messages
        var generalChannel = new ChatConversation
        {
            Title = "#general-architecture",
            IsGroup = true,
            ChannelTopic = "System design, distributed storage, and performance trade-offs"
        };

        var dmWithAmara = new ChatConversation
        {
            Title = "Amara Vance",
            IsGroup = false,
            AvatarUrl = amara.AvatarUrl
        };

        context.ChatConversations.AddRange(generalChannel, dmWithAmara);
        context.SaveChanges();

        // Participants
        context.ChatParticipants.AddRange(
            new ChatParticipant { ConversationId = generalChannel.Id, UserId = alex.Id, IsAdmin = true },
            new ChatParticipant { ConversationId = generalChannel.Id, UserId = amara.Id },
            new ChatParticipant { ConversationId = generalChannel.Id, UserId = julian.Id },
            new ChatParticipant { ConversationId = generalChannel.Id, UserId = sophie.Id },
            new ChatParticipant { ConversationId = dmWithAmara.Id, UserId = alex.Id },
            new ChatParticipant { ConversationId = dmWithAmara.Id, UserId = amara.Id }
        );

        // Messages
        context.ChatMessages.AddRange(
            new ChatMessage
            {
                ConversationId = dmWithAmara.Id,
                SenderId = amara.Id,
                Content = "Hey Alex! Checked your question regarding the Tokio Mutex lock scope. The benchmark tests on Linux 6.8 kernel look fantastic now.",
                SentAt = DateTime.UtcNow.AddMinutes(-25),
                IsRead = true
            },
            new ChatMessage
            {
                ConversationId = dmWithAmara.Id,
                SenderId = alex.Id,
                Content = "Thanks Amara! Dropping the guard before the await point eliminated the stall completely. Check out this snippet for the pooled channel buffer:",
                CodeSnippet = "let (tx, mut rx) = mpsc::channel::<Packet>(1024);\ntokio::spawn(async move {\n    while let Some(packet) = rx.recv().await {\n        process_packet(packet).await;\n    }\n});",
                CodeLanguage = "rust",
                SentAt = DateTime.UtcNow.AddMinutes(-18),
                IsRead = true
            },
            new ChatMessage
            {
                ConversationId = dmWithAmara.Id,
                SenderId = amara.Id,
                Content = "Spot on. That buffer size prevents backpressure spikes during ingress bursts.",
                SentAt = DateTime.UtcNow.AddMinutes(-5),
                IsRead = false
            },
            new ChatMessage
            {
                ConversationId = generalChannel.Id,
                SenderId = sophie.Id,
                Content = "Team, the PostgreSQL 16 trigram composite index tests reduced query latency from 4.2s to 3.8ms on the 45M row table!",
                SentAt = DateTime.UtcNow.AddHours(-1)
            },
            new ChatMessage
            {
                ConversationId = generalChannel.Id,
                SenderId = julian.Id,
                Content = "Awesome! That'll keep memory usage well within our 4Gi container limits.",
                SentAt = DateTime.UtcNow.AddMinutes(-40)
            }
        );

        context.SaveChanges();
    }
}

