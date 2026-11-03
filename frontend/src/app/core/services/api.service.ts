import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import {
  QuestionItem,
  BlogPostItem,
  TagSummary,
  SavedSnippetItem,
  CodeDiffItem,
  AstComparisonItem,
  ProfileDetail,
  ChatConversationItem,
  ChatMessageItem,
  AnswerItem,
  UserSummary
} from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5000/api';

  // Questions
  getQuestions(tag?: string, sort?: string, search?: string): Observable<QuestionItem[]> {
    let url = `${this.baseUrl}/questions?`;
    if (tag) url += `tag=${encodeURIComponent(tag)}&`;
    if (sort) url += `sort=${encodeURIComponent(sort)}&`;
    if (search) url += `search=${encodeURIComponent(search)}&`;

    return this.http.get<QuestionItem[]>(url).pipe(
      catchError(() => of(this.getMockQuestions(tag, sort, search)))
    );
  }

  getQuestionById(id: string): Observable<QuestionItem> {
    return this.http.get<QuestionItem>(`${this.baseUrl}/questions/${id}`).pipe(
      catchError(() => {
        const found = this.getMockQuestions().find(q => q.id === id || q.slug === id);
        return of(found || this.getMockQuestions()[0]);
      })
    );
  }

  createQuestion(data: { title: string; contentMarkdown: string; codeSnippet?: string; language?: string; tagIds?: string[] }): Observable<any> {
    return this.http.post(`${this.baseUrl}/questions`, data).pipe(
      catchError(() => {
        const newQ: QuestionItem = {
          id: 'q-' + Date.now(),
          title: data.title,
          slug: data.title.toLowerCase().replace(/\s+/g, '-'),
          contentMarkdown: data.contentMarkdown,
          codeSnippet: data.codeSnippet,
          language: data.language || 'rust',
          upvotes: 1,
          downvotes: 0,
          score: 1,
          viewCount: 1,
          isSolved: false,
          createdAt: new Date().toISOString(),
          answerCount: 0,
          author: this.getCurrentUserSummary(),
          tags: [{ id: 't1', name: 'Rust', slug: 'rust', accentColor: '#f97316' }]
        };
        return of(newQ);
      })
    );
  }

  postAnswer(questionId: string, data: { contentMarkdown: string; codeSnippet?: string; language?: string }): Observable<AnswerItem> {
    return this.http.post<AnswerItem>(`${this.baseUrl}/questions/${questionId}/answers`, data).pipe(
      catchError(() => {
        const ans: AnswerItem = {
          id: 'ans-' + Date.now(),
          contentMarkdown: data.contentMarkdown,
          codeSnippet: data.codeSnippet,
          language: data.language || 'rust',
          upvotes: 0,
          downvotes: 0,
          score: 0,
          isAccepted: false,
          createdAt: new Date().toISOString(),
          author: this.getCurrentUserSummary()
        };
        return of(ans);
      })
    );
  }

  voteQuestion(id: string, delta: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/questions/${id}/vote?delta=${delta}`, {}).pipe(
      catchError(() => of({ id, delta }))
    );
  }

  // Blogs
  getBlogs(tag?: string): Observable<BlogPostItem[]> {
    return this.http.get<BlogPostItem[]>(`${this.baseUrl}/blogs`).pipe(
      catchError(() => of(this.getMockBlogs()))
    );
  }

  getBlogBySlug(slug: string): Observable<BlogPostItem> {
    return this.http.get<BlogPostItem>(`${this.baseUrl}/blogs/${slug}`).pipe(
      catchError(() => {
        const found = this.getMockBlogs().find(b => b.slug === slug || b.id === slug);
        return of(found || this.getMockBlogs()[0]);
      })
    );
  }

  publishBlog(data: { title: string; subtitle?: string; contentMarkdown: string; tags?: string[]; coverImageUrl?: string; canonicalUrl?: string }): Observable<BlogPostItem> {
    return this.http.post<BlogPostItem>(`${this.baseUrl}/blogs`, data).pipe(
      catchError(() => {
        const item: BlogPostItem = {
          id: 'b-' + Date.now(),
          title: data.title,
          slug: data.title.toLowerCase().replace(/\s+/g, '-'),
          subtitle: data.subtitle,
          excerpt: data.contentMarkdown.substring(0, 140) + '...',
          contentMarkdown: data.contentMarkdown,
          coverImageUrl: data.coverImageUrl || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
          readingTimeMinutes: Math.max(1, Math.round(data.contentMarkdown.split(' ').length / 180)),
          clapsCount: 0,
          bookmarkCount: 0,
          isFeatured: false,
          publishedAt: new Date().toISOString(),
          author: this.getCurrentUserSummary(),
          tags: data.tags || ['Architecture']
        };
        return of(item);
      })
    );
  }

  clapBlog(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/blogs/${id}/clap`, {}).pipe(
      catchError(() => of({ success: true }))
    );
  }

  // Tags
  getTags(category?: string, search?: string): Observable<TagSummary[]> {
    return this.http.get<TagSummary[]>(`${this.baseUrl}/tags`).pipe(
      catchError(() => of(this.getMockTags(category, search)))
    );
  }

  // Notebook
  getSavedSnippets(): Observable<SavedSnippetItem[]> {
    return this.http.get<SavedSnippetItem[]>(`${this.baseUrl}/notebook`).pipe(
      catchError(() => of(this.getMockSnippets()))
    );
  }

  saveSnippet(snippet: Partial<SavedSnippetItem>): Observable<SavedSnippetItem> {
    return this.http.post<SavedSnippetItem>(`${this.baseUrl}/notebook`, snippet).pipe(
      catchError(() => {
        const created: SavedSnippetItem = {
          id: 'snip-' + Date.now(),
          title: snippet.title || 'Untitled Snippet',
          category: snippet.category || 'Concurrency',
          language: snippet.language || 'rust',
          codeContent: snippet.codeContent || '',
          notes: snippet.notes || '',
          isPinned: snippet.isPinned || false,
          tags: snippet.tags || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return of(created);
      })
    );
  }

  deleteSnippet(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/notebook/${id}`).pipe(
      catchError(() => of({ success: true }))
    );
  }

  // Diff
  getDiffs(): Observable<CodeDiffItem[]> {
    return this.http.get<CodeDiffItem[]>(`${this.baseUrl}/diff`).pipe(
      catchError(() => of(this.getMockDiffs()))
    );
  }

  // AST
  getAstComparisons(): Observable<AstComparisonItem[]> {
    return this.http.get<AstComparisonItem[]>(`${this.baseUrl}/ast`).pipe(
      catchError(() => of(this.getMockAstComparisons()))
    );
  }

  // Profile
  getProfile(username: string): Observable<ProfileDetail> {
    return this.http.get<ProfileDetail>(`${this.baseUrl}/profile/${username}`).pipe(
      catchError(() => of(this.getMockProfile()))
    );
  }

  getContributions(username: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/profile/${username}/contributions`).pipe(
      catchError(() => of(this.generateMockContributions()))
    );
  }

  // Chat
  getConversations(): Observable<ChatConversationItem[]> {
    return this.http.get<ChatConversationItem[]>(`${this.baseUrl}/chat/conversations`).pipe(
      catchError(() => of(this.getMockConversations()))
    );
  }

  getMessages(conversationId: string): Observable<ChatMessageItem[]> {
    return this.http.get<ChatMessageItem[]>(`${this.baseUrl}/chat/conversations/${conversationId}/messages`).pipe(
      catchError(() => of(this.getMockMessages(conversationId)))
    );
  }

  sendChatMessage(conversationId: string, content: string, codeSnippet?: string, codeLanguage?: string): Observable<ChatMessageItem> {
    const payload = {
      senderUsername: 'alexchen',
      content,
      codeSnippet,
      codeLanguage
    };
    return this.http.post<ChatMessageItem>(`${this.baseUrl}/chat/conversations/${conversationId}/messages`, payload).pipe(
      catchError(() => {
        const msg: ChatMessageItem = {
          id: 'msg-' + Date.now(),
          conversationId,
          senderId: 'alex-id',
          senderUsername: 'alexchen',
          senderDisplayName: 'Alex Chen',
          senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          content,
          codeSnippet,
          codeLanguage,
          sentAt: new Date().toISOString(),
          isRead: true
        };
        return of(msg);
      })
    );
  }

  public getCurrentUserSummary(): UserSummary {
    return {
      id: 'alex-id',
      username: 'alexchen',
      displayName: 'Alex Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      reputation: 4850,
      title: 'Principal Systems Engineer'
    };
  }

  // Mock data fallbacks matching Stitch exactly
  private getMockQuestions(tag?: string, sort?: string, search?: string): QuestionItem[] {
    const all: QuestionItem[] = [
      {
        id: '17862a6cdc0d4512b2e7f59cfe49e984',
        title: 'Rust tokio deadlock with mutex guard across .await points in async worker thread',
        slug: 'rust-tokio-deadlock-mutex-guard-across-await-points',
        contentMarkdown: `I have an asynchronous background processor using \`tokio::spawn\` handling multiplexed network buffers. When holding a standard \`std::sync::Mutex\` across an \`.await\` boundary, the task stalls indefinitely under high concurrency.

Here is the minimal reproducible snippet:

\`\`\`rust
use std::sync::Mutex;
use std::sync::Arc;

async fn process_job(state: Arc<Mutex<JobState>>) {
    let mut lock = state.lock().unwrap();
    lock.pending_count += 1;
    
    // CRITICAL: Holding lock across .await point causes Send issues & deadlock!
    tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;
    
    lock.completed_count += 1;
}
\`\`\`

How do we properly design this without holding the lock across \`.await\` or when we need mutable state access?`,
        codeSnippet: `let mut lock = state.lock().unwrap();
lock.pending_count += 1;
// Dangerous await while guard is in scope
tokio::time::sleep(Duration::from_millis(50)).await;
lock.completed_count += 1;`,
        language: 'rust',
        upvotes: 124,
        downvotes: 2,
        score: 122,
        viewCount: 3840,
        isSolved: true,
        acceptedAnswerId: 'ans-1',
        createdAt: '2026-11-01T10:14:00Z',
        answerCount: 2,
        author: {
          id: 'alex-id',
          username: 'alexchen',
          displayName: 'Alex Chen',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          reputation: 4850,
          title: 'Principal Systems Engineer'
        },
        tags: [
          { id: 't1', name: 'Rust', slug: 'rust', accentColor: '#f97316' },
          { id: 't2', name: 'Tokio', slug: 'tokio', accentColor: '#38bdf8' },
          { id: 't7', name: 'Concurrency', slug: 'concurrency', accentColor: '#ec4899' }
        ],
        answers: [
          {
            id: 'ans-1',
            contentMarkdown: `### Verified Solution: Scope Guard & Use \`tokio::sync::Mutex\` or Message Passing

There are two fundamental rules when working with Tokio and locks:

1. **Never hold \`std::sync::MutexGuard\` across an \`.await\` point**. \`std::sync::MutexGuard\` does not implement \`Send\`, so the future cannot be moved across threads in Tokio's multi-threaded work-stealing runtime.
2. **Prefer explicit scoping** to drop the guard before the async suspension:

\`\`\`rust
// Option A: Explicit block drop
{
    let mut lock = state.lock().unwrap();
    lock.pending_count += 1;
} // Guard dropped here!

tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;

{
    let mut lock = state.lock().unwrap();
    lock.completed_count += 1;
}
\`\`\`

If you truly must hold a lock across an await (e.g. reserving a critical transaction handle), switch to \`tokio::sync::Mutex\`:

\`\`\`rust
use tokio::sync::Mutex;

let mut lock = state.lock().await;
// Safe across await points because tokio's guard implements Send
tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;
lock.completed_count += 1;
\`\`\``,
            codeSnippet: `// Clean block scoping to drop lock before await
{
    let mut lock = state.lock().unwrap();
    lock.pending_count += 1;
} // dropped!

tokio::time::sleep(Duration::from_millis(50)).await;

{
    let mut lock = state.lock().unwrap();
    lock.completed_count += 1;
}`,
            language: 'rust',
            upvotes: 98,
            downvotes: 0,
            score: 98,
            isAccepted: true,
            createdAt: '2026-11-01T11:20:00Z',
            author: {
              id: 'amara-id',
              username: 'amaravance',
              displayName: 'Amara Vance',
              avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
              reputation: 3920,
              title: 'Staff Concurrency Engineer'
            }
          },
          {
            id: 'ans-2',
            contentMarkdown: `In addition to Amara's solution, if your worker only updates counters, consider \`AtomicU64\` or \`mpsc::channel\` message passing. It completely eliminates mutex contention on multi-core CPU workers.`,
            language: 'rust',
            upvotes: 32,
            downvotes: 1,
            score: 31,
            isAccepted: false,
            createdAt: '2026-11-01T12:05:00Z',
            author: {
              id: 'sophie-id',
              username: 'sophievarma',
              displayName: 'Sophie Varma',
              avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
              reputation: 4210,
              title: 'Senior Database Specialist'
            }
          }
        ]
      },
      {
        id: 'q-2',
        title: 'PostgreSQL slow query on composite index with JSONB gin_trgm_ops operator',
        slug: 'postgresql-slow-query-composite-index-jsonb-gin-trgm-ops',
        contentMarkdown: 'We have a 45M row table storing telemetry events in a `payload` JSONB column. Queries filtering by `tenant_id` and searching substrings inside `payload->>\'metadata\'` take over 4.2 seconds instead of doing an index scan. How can we optimize this?',
        codeSnippet: `EXPLAIN ANALYZE
SELECT id, event_type, payload
FROM tenant_events
WHERE tenant_id = 'c7e9f4a1-0000-0000-0000-000000000000'
  AND payload->>'service_name' ILIKE '%ingress_proxy%'
ORDER BY created_at DESC
LIMIT 50;`,
        language: 'sql',
        upvotes: 86,
        downvotes: 1,
        score: 85,
        viewCount: 2190,
        isSolved: true,
        acceptedAnswerId: 'ans-3',
        createdAt: '2026-10-29T14:22:00Z',
        answerCount: 3,
        author: {
          id: 'sophie-id',
          username: 'sophievarma',
          displayName: 'Sophie Varma',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          reputation: 4210,
          title: 'Senior Database Specialist'
        },
        tags: [
          { id: 't3', name: 'PostgreSQL', slug: 'postgresql', accentColor: '#6366f1' },
          { id: 't8', name: 'JSONB', slug: 'jsonb', accentColor: '#10b981' }
        ]
      },
      {
        id: 'q-3',
        title: 'Kubernetes pod OOMKilled despite cgroups v2 memory limits set to 4GiB on containerd',
        slug: 'kubernetes-pod-oomkilled-cgroups-v2-memory-limits',
        contentMarkdown: 'Our worker pod runs out of memory and gets killed by the host kernel OOM killer rather than the cgroup memory controller. The pod limit is 4GiB and node has plenty of free RAM.',
        codeSnippet: `resources:
  limits:
    memory: "4Gi"
    cpu: "2000m"
  requests:
    memory: "2Gi"
    cpu: "1000m"`,
        language: 'yaml',
        upvotes: 49,
        downvotes: 0,
        score: 49,
        viewCount: 1420,
        isSolved: false,
        createdAt: '2026-11-02T08:45:00Z',
        answerCount: 1,
        author: {
          id: 'julian-id',
          username: 'julianchen',
          displayName: 'Julian Chen',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          reputation: 3150,
          title: 'Lead Infrastructure Architect'
        },
        tags: [
          { id: 't4', name: 'Kubernetes', slug: 'kubernetes', accentColor: '#38bdf8' },
          { id: 't6', name: 'Docker', slug: 'docker', accentColor: '#0ea5e9' }
        ]
      },
      {
        id: 'q-4',
        title: 'TypeScript 5.4 type inference breakdown with conditional generic mapped types',
        slug: 'typescript-5-4-type-inference-breakdown-conditional-generic',
        contentMarkdown: 'When defining deeply nested distributed conditional types over union parameters, TypeScript 5.4 falls back to `unknown` instead of preserving the discriminated literal properties.',
        codeSnippet: `type Transform<T> = T extends Promise<infer R>
  ? { [K in keyof R]: R[K] extends Function ? never : R[K] }
  : never;`,
        language: 'typescript',
        upvotes: 72,
        downvotes: 1,
        score: 71,
        viewCount: 2950,
        isSolved: true,
        createdAt: '2026-10-31T16:10:00Z',
        answerCount: 4,
        author: {
          id: 'alex-id',
          username: 'alexchen',
          displayName: 'Alex Chen',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          reputation: 4850,
          title: 'Principal Systems Engineer'
        },
        tags: [
          { id: 't5', name: 'TypeScript', slug: 'typescript', accentColor: '#3b82f6' }
        ]
      }
    ];

    let result = [...all];
    if (tag) {
      result = result.filter(q => q.tags.some(t => t.slug.toLowerCase() === tag.toLowerCase()));
    }
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(q => q.title.toLowerCase().includes(s) || q.contentMarkdown.toLowerCase().includes(s));
    }
    if (sort === 'votes') {
      result.sort((a, b) => b.score - a.score);
    } else if (sort === 'unanswered') {
      result = result.filter(q => q.answerCount === 0);
    } else if (sort === 'solved') {
      result = result.filter(q => q.isSolved);
    }
    return result;
  }

  private getMockBlogs(): BlogPostItem[] {
    return [
      {
        id: 'b-1',
        title: 'How We Scaled Our Distributed Raft Consensus Engine to 1.2M Writes/sec with Zero Data Loss',
        slug: 'scaled-distributed-raft-consensus-engine-1-2m-writes-sec',
        subtitle: 'Dissecting kernel bypass, batch commit pipelining, and memory-mapped log segments.',
        excerpt: 'A comprehensive architectural deep-dive into redesigning the log replication layer using io_uring, kernel bypass memory buffers, and SIMD-accelerated CRC validation.',
        contentMarkdown: `## 1. System Architecture Overview

Scaling distributed consensus beyond 500k ops/sec traditionally hits wall-clock memory and sys-call bottlenecks. In this article, we share how we eliminated kernel context switching and tuned Raft heartbeats for zero data loss.

### Batch Pipelining & io_uring
By replacing synchronous fsync syscalls with an async submission queue using Linux \`io_uring\`, we achieved true zero-copy log appends.

### Key Guarantees:
- Peak IOPS: **1,240,000 writes/sec**
- P99.9 latency: **1.82 milliseconds**
- Recovery Time Objective (RTO): **< 250ms**
- Zero single points of failure across 5 Raft cluster regions.`,
        coverImageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
        readingTimeMinutes: 11,
        clapsCount: 1420,
        bookmarkCount: 530,
        isFeatured: true,
        publishedAt: '2026-10-30T09:00:00Z',
        author: this.getCurrentUserSummary(),
        tags: ['Distributed Systems', 'Rust', 'io_uring', 'Raft', 'Performance']
      },
      {
        id: 'b-2',
        title: 'Architecting a Resilient Event Sourcing System with PostgreSQL and Kafka',
        slug: 'architecting-resilient-event-sourcing-postgresql-kafka',
        subtitle: 'Transactional outbox pattern, optimistic concurrency, and zero-loss projections.',
        excerpt: 'Patterns and battle-tested code for ensuring dual-write atomicity between relational storage and distributed streaming topics.',
        contentMarkdown: `## The Transactional Outbox Pattern

When publishing events to an external message broker like Apache Kafka or RabbitMQ, performing a database write and broker produce in the same business flow will inevitably encounter partial failures.

By writing domain events directly into an \`outbox\` table within the same PostgreSQL ACID transaction, we guarantee that every state mutation has an associated durable event log.`,
        coverImageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
        readingTimeMinutes: 8,
        clapsCount: 890,
        bookmarkCount: 310,
        isFeatured: false,
        publishedAt: '2026-10-27T14:30:00Z',
        author: {
          id: 'sophie-id',
          username: 'sophievarma',
          displayName: 'Sophie Varma',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          reputation: 4210,
          title: 'Senior Database Specialist'
        },
        tags: ['PostgreSQL', 'Kafka', 'Event Sourcing', 'Architecture']
      },
      {
        id: 'b-3',
        title: 'Demystifying eBPF Tracing for Cloud-Native Microservices',
        slug: 'demystifying-ebpf-tracing-cloud-native-microservices',
        subtitle: 'Observing TCP sockets and socket filters without modifying application binaries.',
        excerpt: 'Zero-overhead telemetry using kernel probes, kretprobes, and BPF maps to monitor distributed trace latencies in real time.',
        contentMarkdown: `## Kernel Space Observability

eBPF lets us safely execute bytecode inside the Linux kernel without changing kernel source code or loading external kernel modules.`,
        coverImageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
        readingTimeMinutes: 9,
        clapsCount: 640,
        bookmarkCount: 195,
        isFeatured: false,
        publishedAt: '2026-10-25T11:15:00Z',
        author: {
          id: 'julian-id',
          username: 'julianchen',
          displayName: 'Julian Chen',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          reputation: 3150,
          title: 'Lead Infrastructure Architect'
        },
        tags: ['eBPF', 'Linux Kernel', 'Kubernetes', 'Networking']
      }
    ];
  }

  private getMockTags(category?: string, search?: string): TagSummary[] {
    const list: TagSummary[] = [
      { id: 't1', name: 'Rust', slug: 'rust', description: 'Memory safety without garbage collection, zero-cost abstractions, fearless concurrency.', category: 'Language', iconName: 'code', accentColor: '#f97316', questionCount: 1420, weeklyGrowthPercent: 14.8, isTrending: true },
      { id: 't2', name: 'Tokio', slug: 'tokio', description: 'An asynchronous runtime for the Rust programming language with work-stealing schedulers.', category: 'Framework', iconName: 'speed', accentColor: '#38bdf8', questionCount: 680, weeklyGrowthPercent: 18.2, isTrending: true },
      { id: 't3', name: 'PostgreSQL', slug: 'postgresql', description: 'Advanced open source object-relational database system with rich indexing and JSONB.', category: 'Database', iconName: 'database', accentColor: '#6366f1', questionCount: 2150, weeklyGrowthPercent: 8.5, isTrending: true },
      { id: 't4', name: 'Kubernetes', slug: 'kubernetes', description: 'Automated container deployment, scaling, and operational management at enterprise scale.', category: 'Cloud & Infra', iconName: 'cloud', accentColor: '#38bdf8', questionCount: 3100, weeklyGrowthPercent: 11.2, isTrending: false },
      { id: 't5', name: 'TypeScript', slug: 'typescript', description: 'Strongly typed programming language that builds on JavaScript, giving better tooling.', category: 'Language', iconName: 'code', accentColor: '#3b82f6', questionCount: 4200, weeklyGrowthPercent: 6.4, isTrending: false },
      { id: 't6', name: 'Docker', slug: 'docker', description: 'OS-level virtualization delivering software in packages called containers.', category: 'Cloud & Infra', iconName: 'developer_board', accentColor: '#0ea5e9', questionCount: 1840, weeklyGrowthPercent: 5.2, isTrending: false },
      { id: 't7', name: 'eBPF', slug: 'ebpf', description: 'Revolutionary kernel technology to run sandboxed programs in an OS kernel safely.', category: 'Systems', iconName: 'memory', accentColor: '#10b981', questionCount: 410, weeklyGrowthPercent: 32.5, isTrending: true },
      { id: 't8', name: 'SignalR', slug: 'signalr', description: 'Real-time bi-directional communication between server and connected web clients.', category: 'Framework', iconName: 'sync', accentColor: '#ec4899', questionCount: 520, weeklyGrowthPercent: 9.1, isTrending: false }
    ];

    let result = [...list];
    if (category && category !== 'All') {
      result = result.filter(t => t.category?.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(t => t.name.toLowerCase().includes(s) || (t.description && t.description.toLowerCase().includes(s)));
    }
    return result;
  }

  private getMockSnippets(): SavedSnippetItem[] {
    return [
      {
        id: 'snip-1',
        title: 'Rust tokio deadlock with mutex guard held across .await points in async worker thread',
        category: 'Concurrency',
        language: 'rust',
        codeContent: `use tokio::sync::Mutex;
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
}`,
        notes: 'Verified pattern for worker pools. Avoid std::sync::Mutex when lock must span async yields.',
        isPinned: true,
        tags: ['rust', 'tokio', 'concurrency'],
        createdAt: '2026-11-01T12:00:00Z',
        updatedAt: '2026-11-01T14:30:00Z'
      },
      {
        id: 'snip-2',
        title: 'PostgreSQL 16: Composite index with JSONB gin_trgm_ops operator query optimization',
        category: 'Database',
        language: 'sql',
        codeContent: `CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_tenant_events_search 
ON tenant_events USING gin (tenant_id, ((payload->>'service_name')) gin_trgm_ops);`,
        notes: 'Achieves index-only scan on composite jsonb trgm operations with sub-5ms lookup.',
        isPinned: true,
        tags: ['postgresql', 'indexing', 'jsonb'],
        createdAt: '2026-10-30T10:15:00Z',
        updatedAt: '2026-10-30T10:15:00Z'
      },
      {
        id: 'snip-3',
        title: 'Zero-copy deserialization trade-offs: rkyv vs FlatBuffers in high throughput UDP pipelines',
        category: 'Networking',
        language: 'rust',
        codeContent: `use rkyv::{Archive, Deserialize, Serialize};

#[derive(Archive, Deserialize, Serialize, Debug, PartialEq)]
#[archive(check_bytes)]
pub struct TelemetryPacket {
    pub sensor_id: u64,
    pub timestamp_ns: u64,
    pub values: Vec<f64>,
}`,
        notes: 'Rkyv zero-copy serialization allows reading directly from mmap buffer without allocation.',
        isPinned: false,
        tags: ['rust', 'networking', 'zero-copy'],
        createdAt: '2026-10-28T16:40:00Z',
        updatedAt: '2026-10-28T16:40:00Z'
      }
    ];
  }

  private getMockDiffs(): CodeDiffItem[] {
    return [
      {
        id: 'diff-1',
        title: 'Fix tokio mutex guard deadlock across yield boundaries',
        filePath: 'src/concurrency/worker_pool.rs',
        commitHash: '8f3b20e',
        author: 'alexchen',
        additions: 14,
        deletions: 6,
        language: 'rust',
        originalCode: `    // Old implementation: holds std::sync::Mutex across await
    let mut guard = self.state.lock().unwrap();
    guard.record_start();
    
    // BUG: Deadlock risk and Send trait violation
    tokio::time::sleep(timeout).await;
    
    guard.record_finish();`,
        modifiedCode: `    // New implementation: scoped drop or tokio::sync::Mutex
    {
        let mut guard = self.state.lock().unwrap();
        guard.record_start();
    } // Guard dropped cleanly before await point
    
    tokio::time::sleep(timeout).await;
    
    {
        let mut guard = self.state.lock().unwrap();
        guard.record_finish();
    }`,
        createdAt: '2026-11-02T14:15:00Z'
      }
    ];
  }

  private getMockAstComparisons(): AstComparisonItem[] {
    return [
      {
        id: 'ast-1',
        name: 'TypeScript AST: Generic Type Conditional Inference',
        description: 'Abstract Syntax Tree representation of mapped conditional types and infer keyword.',
        language: 'typescript',
        sourceCode: `type Flatten<T> = T extends Array<infer Item> ? Item : T;`,
        targetCode: `type UnpackPromise<T> = T extends Promise<infer R> ? R : T;`,
        astJson: `{
  "type": "TypeAliasDeclaration",
  "name": "Flatten",
  "typeParameters": [{ "name": "T" }],
  "type": {
    "type": "ConditionalType",
    "checkType": { "type": "TypeReference", "name": "T" },
    "extendsType": {
      "type": "TypeReference",
      "name": "Array",
      "typeArguments": [{ "type": "InferType", "typeParameter": "Item" }]
    },
    "trueType": { "type": "TypeReference", "name": "Item" },
    "falseType": { "type": "TypeReference", "name": "T" }
  }
}`,
        createdAt: '2026-11-01T08:00:00Z'
      }
    ];
  }

  private getMockProfile(): ProfileDetail {
    return {
      id: 'alex-id',
      username: 'alexchen',
      displayName: 'Alex Chen',
      email: 'alex.chen@kernel.io',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Systems Architect focusing on distributed consensus, high-throughput networking, and low-latency Rust runtimes. Maintainer of KernelFlow and open-source contributor.',
      title: 'Principal Systems Engineer',
      location: 'San Francisco, CA',
      githubHandle: 'alexchen-dev',
      reputation: 14840,
      monthlyReputationDelta: 412,
      acceptanceRate: 98.4,
      solvedCount: 142,
      articlesCount: 18,
      questionCount: 14,
      impactScore: 3800000,
      engineeringReach: '3.8M',
      devsHelpedCount: 48000,
      bountiesClaimedAmount: 4200,
      bountyPoints: 8500,
      peerRfcCount: 64,
      gistsCount: 89,
      totalContributionEvents: 1420,
      peakActivityHours: '21:00 - 03:00 UTC',
      createdAt: '2023-04-12T00:00:00Z',
      isOnline: true,
      lastActiveAt: new Date().toISOString(),
      proficiencies: [
        {
          id: 'p1',
          technology: 'Rust & Async Tokio',
          score: 98,
          tier: 'Top 0.5%',
          levelTitle: 'Level 8 • Grandmaster',
          description: 'Tokio async runtime, pinning memory layouts, SIMD vectorization.',
          reputationBonus: '+6,420 rep',
          verifiedSolutionsCount: 84,
          icon: 'terminal'
        },
        {
          id: 'p2',
          technology: 'Distributed Systems & Raft',
          score: 95,
          tier: 'Top 1%',
          levelTitle: 'Level 7 • Architect',
          description: 'Raft consensus, vector clocks, multi-region replication.',
          reputationBonus: '+3,810 rep',
          verifiedSolutionsCount: 38,
          icon: 'hub'
        },
        {
          id: 'p3',
          technology: 'Kubernetes & eBPF',
          score: 91,
          tier: 'Top 2%',
          levelTitle: 'Level 6 • Kernel Ops',
          description: 'eBPF telemetry, custom k8s operators, cgroups v2 resource quotas.',
          reputationBonus: '+2,140 rep',
          verifiedSolutionsCount: 21,
          icon: 'cloud'
        },
        {
          id: 'p4',
          technology: 'PostgreSQL & Storage',
          score: 88,
          tier: 'Top 5%',
          levelTitle: 'Level 5 • Lead Dev',
          description: 'B-Tree indexes, WAL tuning, query plan optimization, JSONB indexing.',
          reputationBonus: '+1,470 rep',
          verifiedSolutionsCount: 16,
          icon: 'database'
        }
      ],
      peerEndorsements: [
        {
          id: 'pe-1',
          authorName: 'Elena Rostova',
          authorTitle: 'VP of Distributed Systems @ CloudScale',
          authorAvatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          verifiedBadge: 'Verified Peer',
          content: "Alex's deep understanding of Rust concurrency and memory pinning helped our team eliminate microsecond tail latencies in our packet forwarding engine. Truly exceptional engineer.",
          createdAt: new Date().toISOString()
        },
        {
          id: 'pe-2',
          authorName: 'David Kim',
          authorTitle: 'Staff Infrastructure Engineer @ KernelCore',
          authorAvatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
          verifiedBadge: 'Core Contributor',
          content: 'Consistently delivers the highest quality architectural reviews. His solutions to Raft consensus partitions are gold-standard implementations across the ecosystem.',
          createdAt: new Date().toISOString()
        }
      ],
      verifiedSolutions: [
        {
          id: 'vs-1',
          title: 'Optimizing Tokio work-stealing scheduler for low-latency UDP packet processing',
          verificationBadge: 'cargo-clippy verified',
          solvedTimeAgo: 'Solved 3 days ago',
          codeSnippet: `// Pin worker threads to physical cores to avoid L3 cache misses
let core_ids = core_affinity::get_core_ids().unwrap();
let runtime = tokio::runtime::Builder::new_multi_thread()
    .worker_threads(core_ids.len())
    .on_thread_start(move || {
        let core = core_ids[tokio::task::id() % core_ids.len()];
        core_affinity::set_for_current(core);
    })
    .enable_all()
    .build()?;`,
          tags: ['rust', 'tokio', 'concurrency', 'low-latency'],
          upvotes: 142,
          views: 4120,
          createdAt: new Date().toISOString()
        },
        {
          id: 'vs-2',
          title: 'Eliminating allocation overhead in zero-copy ring buffers using io_uring',
          verificationBadge: 'cargo-clippy verified',
          solvedTimeAgo: 'Solved 2 weeks ago',
          codeSnippet: `pub struct ZeroCopyBuffer<T> {
    ring: IoUring,
    mmap_ptr: *mut T,
    capacity: usize,
}
impl<T> ZeroCopyBuffer<T> {
    pub unsafe fn submit_pinned(&mut self, fd: RawFd, slice: &[u8]) -> io::Result<()> {
        // Direct kernel submission avoiding user-space copy
    }
}`,
          tags: ['rust', 'io-uring', 'kernel', 'memory'],
          upvotes: 98,
          views: 2890,
          createdAt: new Date().toISOString()
        },
        {
          id: 'vs-3',
          title: 'Resolving deadlocks in Raft state transitions under network partition storms',
          verificationBadge: 'Formal Verification: TLA+',
          solvedTimeAgo: 'Solved 1 month ago',
          codeSnippet: `if self.current_term < candidate_term {
    self.step_down_to_follower(candidate_term);
    self.vote_granted = Some(candidate_id);
    self.persist_state()?;
}`,
          tags: ['distributed-systems', 'raft', 'consensus', 'high-availability'],
          upvotes: 184,
          views: 5410,
          createdAt: new Date().toISOString()
        }
      ],
      featuredRfcs: [
        {
          id: 'rfc-1',
          title: 'RFC #042: Formal Verification of State Machine Replication in Rust',
          slug: 'rfc-042-formal-verification-raft-rust',
          subtitle: 'Proposing a verified consensus state machine transition spec using TLA+ and Rust model checking.',
          excerpt: 'Proposing a verified consensus state machine transition spec using TLA+ and Rust model checking.',
          contentMarkdown: 'Detailed RFC specifications.',
          coverImageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
          readingTimeMinutes: 12,
          clapsCount: 412,
          bookmarkCount: 180,
          isFeatured: true,
          publishedAt: '2024-10-14T00:00:00Z',
          author: this.getCurrentUserSummary(),
          tags: ['RFC', 'Rust', 'Distributed Systems']
        },
        {
          id: 'rfc-2',
          title: 'Deep-Dive: Inside the Linux eBPF Verifier for High-Throughput Packet Filtering',
          slug: 'inside-linux-ebpf-verifier-packet-filtering',
          subtitle: 'Analyzing instruction limits, register states, and zero-overhead kernel telemetry.',
          excerpt: 'Analyzing instruction limits, register states, and zero-overhead kernel telemetry.',
          contentMarkdown: 'In-depth breakdown of Linux eBPF verifier.',
          coverImageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
          readingTimeMinutes: 18,
          clapsCount: 620,
          bookmarkCount: 295,
          isFeatured: true,
          publishedAt: '2024-11-02T00:00:00Z',
          author: this.getCurrentUserSummary(),
          tags: ['eBPF', 'Linux', 'Networking', 'Kernel']
        }
      ]
    };
  }

  private generateMockContributions(): any {
    const days: any[] = [];
    const now = new Date();
    for (let i = 364; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const rand = Math.random();
      const count = rand > 0.35 ? Math.floor(rand * 9) + 1 : 0;
      days.push({
        date: d.toISOString().split('T')[0],
        count,
        level: count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 6 ? 3 : 4
      });
    }
    return {
      totalContributions: 894,
      longestStreak: 38,
      currentStreak: 14,
      days
    };
  }

  private getMockConversations(): ChatConversationItem[] {
    return [
      {
        id: 'c-1',
        title: 'Amara Vance',
        isGroup: false,
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        updatedAt: '2026-11-03T11:45:00Z',
        unreadCount: 1,
        lastMessage: {
          content: 'Spot on. That buffer size prevents backpressure spikes during ingress bursts.',
          sentAt: '2026-11-03T11:45:00Z',
          isRead: false
        },
        participants: [
          this.getCurrentUserSummary(),
          {
            id: 'amara-id',
            username: 'amaravance',
            displayName: 'Amara Vance',
            avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
            reputation: 3920,
            isOnline: true
          }
        ]
      },
      {
        id: 'c-2',
        title: '#general-architecture',
        isGroup: true,
        channelTopic: 'System design, distributed storage, and performance trade-offs',
        updatedAt: '2026-11-03T11:20:00Z',
        unreadCount: 0,
        lastMessage: {
          content: "Awesome! That'll keep memory usage well within our 4Gi container limits.",
          sentAt: '2026-11-03T11:20:00Z',
          isRead: true
        },
        participants: [
          this.getCurrentUserSummary(),
          { id: 'amara-id', username: 'amaravance', displayName: 'Amara Vance', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', reputation: 3920, isOnline: true },
          { id: 'sophie-id', username: 'sophievarma', displayName: 'Sophie Varma', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', reputation: 4210, isOnline: true },
          { id: 'julian-id', username: 'julianchen', displayName: 'Julian Chen', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', reputation: 3150, isOnline: false }
        ]
      },
      {
        id: 'c-3',
        title: 'Sophie Varma',
        isGroup: false,
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        updatedAt: '2026-11-02T18:30:00Z',
        unreadCount: 0,
        lastMessage: {
          content: 'The trigram composite index tests are running cleanly on staging.',
          sentAt: '2026-11-02T18:30:00Z',
          isRead: true
        },
        participants: [
          this.getCurrentUserSummary(),
          {
            id: 'sophie-id',
            username: 'sophievarma',
            displayName: 'Sophie Varma',
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            reputation: 4210,
            isOnline: true
          }
        ]
      }
    ];
  }

  private getMockMessages(conversationId: string): ChatMessageItem[] {
    if (conversationId === 'c-1') {
      return [
        {
          id: 'm-1',
          conversationId: 'c-1',
          senderId: 'amara-id',
          senderUsername: 'amaravance',
          senderDisplayName: 'Amara Vance',
          senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
          content: 'Hey Alex! Checked your question regarding the Tokio Mutex lock scope. The benchmark tests on Linux 6.8 kernel look fantastic now.',
          sentAt: '2026-11-03T11:25:00Z',
          isRead: true
        },
        {
          id: 'm-2',
          conversationId: 'c-1',
          senderId: 'alex-id',
          senderUsername: 'alexchen',
          senderDisplayName: 'Alex Chen',
          senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          content: 'Thanks Amara! Dropping the guard before the await point eliminated the stall completely. Check out this snippet for the pooled channel buffer:',
          codeSnippet: `let (tx, mut rx) = mpsc::channel::<Packet>(1024);
tokio::spawn(async move {
    while let Some(packet) = rx.recv().await {
        process_packet(packet).await;
    }
});`,
          codeLanguage: 'rust',
          sentAt: '2026-11-03T11:32:00Z',
          isRead: true
        },
        {
          id: 'm-3',
          conversationId: 'c-1',
          senderId: 'amara-id',
          senderUsername: 'amaravance',
          senderDisplayName: 'Amara Vance',
          senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
          content: 'Spot on. That buffer size prevents backpressure spikes during ingress bursts.',
          sentAt: '2026-11-03T11:45:00Z',
          isRead: false
        }
      ];
    }

    return [
      {
        id: 'm-4',
        conversationId: 'c-2',
        senderId: 'sophie-id',
        senderUsername: 'sophievarma',
        senderDisplayName: 'Sophie Varma',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        content: 'Team, the PostgreSQL 16 trigram composite index tests reduced query latency from 4.2s to 3.8ms on the 45M row table!',
        sentAt: '2026-11-03T10:40:00Z',
        isRead: true
      },
      {
        id: 'm-5',
        conversationId: 'c-2',
        senderId: 'julian-id',
        senderUsername: 'julianchen',
        senderDisplayName: 'Julian Chen',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        content: "Awesome! That'll keep memory usage well within our 4Gi container limits.",
        sentAt: '2026-11-03T11:20:00Z',
        isRead: true
      }
    ];
  }
}
