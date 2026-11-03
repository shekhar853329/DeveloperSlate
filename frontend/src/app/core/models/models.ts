export interface UserSummary {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  reputation: number;
  title?: string;
  bio?: string;
  isOnline?: boolean;
}

export interface TagSummary {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  iconName?: string;
  accentColor: string;
  questionCount?: number;
  weeklyGrowthPercent?: number;
  isTrending?: boolean;
}

export interface AnswerItem {
  id: string;
  contentMarkdown: string;
  codeSnippet?: string;
  language?: string;
  upvotes: number;
  downvotes: number;
  score: number;
  isAccepted: boolean;
  createdAt: string;
  author: UserSummary;
}

export interface QuestionItem {
  id: string;
  title: string;
  slug: string;
  contentMarkdown: string;
  codeSnippet?: string;
  language?: string;
  upvotes: number;
  downvotes: number;
  score: number;
  viewCount: number;
  isSolved: boolean;
  acceptedAnswerId?: string;
  createdAt: string;
  updatedAt?: string;
  answerCount: number;
  author: UserSummary;
  tags: TagSummary[];
  answers?: AnswerItem[];
}

export interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  excerpt: string;
  contentMarkdown: string;
  coverImageUrl: string;
  readingTimeMinutes: number;
  clapsCount: number;
  bookmarkCount: number;
  isFeatured: boolean;
  publishedAt: string;
  author: UserSummary;
  tags: string[];
}

export interface SavedSnippetItem {
  id: string;
  title: string;
  category: string;
  language: string;
  codeContent: string;
  notes: string;
  isPinned: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CodeDiffItem {
  id: string;
  title: string;
  filePath: string;
  commitHash: string;
  author: string;
  additions: number;
  deletions: number;
  originalCode: string;
  modifiedCode: string;
  language: string;
  createdAt: string;
}

export interface AstComparisonItem {
  id: string;
  name: string;
  description: string;
  language: string;
  sourceCode: string;
  targetCode: string;
  astJson: string;
  createdAt: string;
}

export interface UserProficiencyItem {
  id: string;
  technology: string;
  score: number;
  tier: string;
  levelTitle?: string;
  description?: string;
  reputationBonus?: string;
  verifiedSolutionsCount: number;
  icon: string;
}

export interface PeerEndorsementItem {
  id: string;
  authorName: string;
  authorTitle: string;
  authorAvatarUrl: string;
  content: string;
  verifiedBadge: string;
  createdAt: string;
}

export interface ProfileVerifiedSolutionItem {
  id: string;
  title: string;
  verificationBadge: string;
  solvedTimeAgo: string;
  codeSnippet: string;
  tags: string[];
  upvotes: number;
  views: number;
  createdAt: string;
}

export interface ProfileDetail extends UserSummary {
  location: string;
  email: string;
  githubHandle: string;
  monthlyReputationDelta: number;
  acceptanceRate: number;
  solvedCount: number;
  articlesCount: number;
  questionCount: number;
  impactScore: number;
  engineeringReach: string;
  devsHelpedCount: number;
  bountiesClaimedAmount: number;
  bountyPoints: number;
  peerRfcCount: number;
  gistsCount: number;
  totalContributionEvents: number;
  peakActivityHours: string;
  createdAt: string;
  lastActiveAt?: string;
  proficiencies: UserProficiencyItem[];
  peerEndorsements: PeerEndorsementItem[];
  verifiedSolutions: ProfileVerifiedSolutionItem[];
  featuredRfcs?: BlogPostItem[];
}

export interface ChatMessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  senderUsername: string;
  senderDisplayName: string;
  senderAvatar: string;
  content: string;
  codeSnippet?: string;
  codeLanguage?: string;
  sentAt: string;
  isRead: boolean;
}

export interface ChatConversationItem {
  id: string;
  title: string;
  isGroup: boolean;
  channelTopic?: string;
  avatarUrl?: string;
  updatedAt: string;
  unreadCount?: number;
  lastMessage?: {
    content: string;
    sentAt: string;
    isRead: boolean;
  };
  participants: UserSummary[];
}

