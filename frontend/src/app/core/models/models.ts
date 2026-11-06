export interface ScreenPermissionStatus {
  canRead: boolean;
  canWrite: boolean;
}

export interface UserSummary {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  reputation: number;
  title?: string;
  email?: string;
  bio?: string;
  isOnline?: boolean;
  roles?: string[];
  permissions?: Record<string, ScreenPermissionStatus>;
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

export interface ScreenDefinition {
  key: string;
  name: string;
  category: string;
  description: string;
}

export interface RoleScreenPermissionItem {
  id?: string;
  screenKey: string;
  screenName: string;
  screenCategory: string;
  description?: string;
  canRead: boolean;
  canWrite: boolean;
}

export interface RoleItem {
  id: string;
  name: string;
  description: string;
  isSystemRole: boolean;
  createdAt?: string;
  userCount: number;
  permissions: RoleScreenPermissionItem[];
}

export interface UserRoleAssignment {
  id: string;
  name: string;
  isSystemRole?: boolean;
  assignedAt?: string;
}

export interface UserWithRolesItem {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  title: string;
  reputation: number;
  solvedCount: number;
  githubHandle?: string;
  location?: string;
  isOnline: boolean;
  lastActiveAt?: string;
  createdAt: string;
  roles: UserRoleAssignment[];
  effectivePermissions?: Record<string, ScreenPermissionStatus>;
}

