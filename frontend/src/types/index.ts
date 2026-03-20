export type FeedFilter = "latest" | "trending" | "beginner";

export type UserLite = {
  id: string;
  name: string;
  username: string;
  image?: string;
};

export type ProjectScore = {
  qualityScore: number;
  innovationScore: number;
  complexityScore: number;
  overallScore: number;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  media: string[];
  githubUrl?: string;
  liveDemoUrl?: string;
  tags: string[];
  status: "IDEA" | "BUILDING" | "LAUNCHED";
  category: string;
  lookingForFeedback: boolean;
  lookingForCollaborator: boolean;
  rolesNeeded: string[];
  owner: UserLite;
  score?: ProjectScore;
  updates?: ProjectUpdate[];
};

export type ProjectUpdate = {
  id: string;
  dayLabel: string;
  title: string;
  description: string;
  media: string[];
  createdAt: string;
};

export type Post = {
  id: string;
  text: string;
  type: "UPDATE" | "PROJECT_LAUNCH" | "BUILD_LOG" | "CHALLENGE_SUBMISSION" | "COLLAB_REQUEST";
  projectTitle?: string;
  projectStage?: "IDEA" | "BUILDING" | "LAUNCHED";
  techStack: string[];
  media: string[];
  githubUrl?: string;
  liveDemoUrl?: string;
  lookingForFeedback: boolean;
  lookingForCollaborators: boolean;
  hashtags?: string[];
  matchedAudienceCount?: number;
  matchedAudienceUsernames?: string[];
  aiReview?: string;
  aiScore?: number;
  views?: number;
  comments?: Array<{
    id: string;
    text: string;
    createdAt: string;
    author: UserLite;
  }>;
  createdAt: string;
  author: UserLite;
  project?: Pick<Project, "id" | "title" | "slug" | "status" | "tags" | "score">;
  _count: {
    likes: number;
    dislikes?: number;
    comments: number;
    reposts: number;
    bookmarks: number;
    views?: number;
  };
};

export type Challenge = {
  id: string;
  title: string;
  description: string;
  category: string;
  deadline: string;
  badge: string;
  reward: string;
  isActive: boolean;
  submissions: ChallengeSubmission[];
};

export type ChallengeSubmission = {
  id: string;
  note?: string;
  isWinner: boolean;
  project: { id: string; title: string; slug: string };
  user: UserLite;
};

export type MentorChat = {
  id: string;
  prompt: string;
  response: string;
  createdAt: string;
};

export type AIReview = {
  id: string;
  prompt: string;
  codeQuality: string;
  suggestions: string[];
  improvements: string[];
  bugDetections: string[];
  performanceTips: string[];
  createdAt: string;
};

export type RightRail = {
  trendingTags: Array<{ id: string; label: string; usage: number }>;
  suggestedDevelopers: Array<{
    id: string;
    username: string;
    name: string;
    image?: string;
    profile?: { skills: string[] };
  }>;
  featuredProjects: Project[];
  activeChallenges: Challenge[];
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: string;
};
