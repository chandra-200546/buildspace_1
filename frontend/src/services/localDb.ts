import type { AIReview, Challenge, MentorChat, Notification, Post, Project, RightRail } from "../types";

type Role = "DEVELOPER" | "RECRUITER" | "ADMIN";

type LocalUser = {
  id: string;
  email: string;
  password: string;
  name: string;
  username: string;
  role: Role;
  image?: string;
  githubUsername?: string;
  portfolioUrl?: string;
  openToCollaborate: boolean;
  openToHire: boolean;
  profile: {
    bio?: string;
    location?: string;
    skills: string[];
    badges: string[];
    projectsBuiltCount: number;
    contributionCount: number;
    streakDays: number;
  };
  recruiterProfile?: {
    id: string;
    company?: string;
    roleTitle?: string;
    hiringFor: string[];
    savedTalent: Array<{ id: string; userId: string; note?: string }>;
  };
  pinnedProjectIds: string[];
};

type LocalPost = {
  id: string;
  authorId: string;
  projectId?: string;
  type: Post["type"];
  text: string;
  projectTitle?: string;
  githubUrl?: string;
  liveDemoUrl?: string;
  media: string[];
  techStack: string[];
  projectStage?: Post["projectStage"];
  lookingForFeedback: boolean;
  lookingForCollaborators: boolean;
  hashtags: string[];
  aiReview?: string;
  aiScore?: number;
  createdAt: string;
  views: number;
  likes: string[];
  dislikes: string[];
  bookmarks: string[];
  comments: Array<{ id: string; authorId: string; text: string; createdAt: string }>;
  reposts: number;
};

type LocalProject = Omit<Project, "owner" | "score" | "updates"> & {
  ownerId: string;
  contributors: string[];
  updates: any[];
  score: any;
  aiReviews: AIReview[];
};

type LocalChallenge = Omit<Challenge, "submissions"> & {
  submissions: Array<{ id: string; projectId: string; userId: string; note?: string; isWinner: boolean }>;
};

type LocalDb = {
  users: LocalUser[];
  posts: LocalPost[];
  projects: LocalProject[];
  challenges: LocalChallenge[];
  mentorChats: MentorChat[];
  notifications: Notification[];
  collabRequests: any[];
  tags: Array<{ id: string; label: string; usage: number }>;
};

const DB_KEY = "buildspace_local_db_v2";

function id(prefix: string) {
  const uid = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  return `${prefix}_${uid}`;
}

function nowIso() {
  return new Date().toISOString();
}

function getSessionUser() {
  const raw = localStorage.getItem("buildspace_user");
  return raw ? JSON.parse(raw) : null;
}

function requireSessionUser(db: LocalDb) {
  const session = getSessionUser();
  if (!session?.id) throw new Error("Please login to continue.");
  const user = db.users.find((entry) => entry.id === session.id);
  if (!user) throw new Error("Session is invalid. Please login again.");
  return user;
}

function scoreFromProject(project: Partial<LocalProject>) {
  const tags = project.tags?.length ?? 0;
  const updates = project.updates?.length ?? 0;
  const members = project.contributors?.length ?? 1;
  const qualityScore = Math.min(100, 55 + tags * 6 + (project.liveDemoUrl ? 10 : 0));
  const innovationScore = Math.min(100, 52 + tags * 4 + members * 6);
  const complexityScore = Math.min(100, 50 + updates * 8 + (project.githubUrl ? 8 : 0));
  const overallScore = Math.round((qualityScore + innovationScore + complexityScore) / 3);
  return { qualityScore, innovationScore, complexityScore, overallScore };
}

function createEmptyDb(): LocalDb {
  return {
    users: [],
    posts: [],
    projects: [],
    challenges: [],
    mentorChats: [],
    notifications: [],
    collabRequests: [],
    tags: []
  };
}

function readDb() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    const emptyDb = createEmptyDb();
    localStorage.setItem(DB_KEY, JSON.stringify(emptyDb));
    return emptyDb;
  }
  return JSON.parse(raw) as LocalDb;
}

function writeDb(db: LocalDb) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function withUser(userId: string, db: LocalDb) {
  return db.users.find((entry) => entry.id === userId);
}

function normalizeHashtag(value: string) {
  const cleaned = value.trim().toLowerCase().replace(/[^a-z0-9_#]/g, "");
  if (!cleaned) return "";
  return cleaned.startsWith("#") ? cleaned : `#${cleaned}`;
}

function extractHashtagsFromText(text: string) {
  const matches = text.match(/#[a-zA-Z0-9_]+/g) ?? [];
  return matches.map((match) => normalizeHashtag(match)).filter(Boolean);
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function buildUserInterest(userId: string, db: LocalDb) {
  const weights = new Map<string, number>();

  const add = (tag: string, score: number) => {
    const normalized = normalizeHashtag(tag);
    if (!normalized) return;
    weights.set(normalized, (weights.get(normalized) ?? 0) + score);
  };

  const user = db.users.find((entry) => entry.id === userId);
  if (!user) return weights;

  user.profile.skills.forEach((skill) => add(skill, 3));
  db.projects.filter((entry) => entry.ownerId === userId).forEach((project) => project.tags.forEach((tag) => add(tag, 2)));
  db.posts.filter((entry) => entry.authorId === userId).forEach((post) => (post.hashtags ?? []).forEach((tag) => add(tag, 2)));
  db.posts.filter((entry) => entry.likes.includes(userId) || entry.bookmarks.includes(userId)).forEach((post) => (post.hashtags ?? []).forEach((tag) => add(tag, 1)));

  return weights;
}

function computeAudienceMatch(hashtags: string[], authorId: string, db: LocalDb) {
  const normalizedTags = uniqueValues(hashtags.map((tag) => normalizeHashtag(tag)));
  if (normalizedTags.length === 0) return { matchedAudienceCount: 0, matchedAudienceUsernames: [] as string[] };

  const candidates = db.users
    .filter((entry) => entry.role === "DEVELOPER" && entry.id !== authorId)
    .map((entry) => {
      const interest = buildUserInterest(entry.id, db);
      const score = normalizedTags.reduce((sum, tag) => sum + (interest.get(tag) ?? 0), 0);
      return { username: entry.username, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return {
    matchedAudienceCount: candidates.length,
    matchedAudienceUsernames: candidates.slice(0, 3).map((entry) => entry.username)
  };
}

function mapPost(post: LocalPost, db: LocalDb): Post {
  const author = withUser(post.authorId, db);
  if (!author) throw new Error("Post author not found");
  const project = post.projectId ? db.projects.find((entry) => entry.id === post.projectId) : undefined;

  const mappedComments = (post.comments ?? [])
    .map((comment) => {
      const commentAuthor = withUser(comment.authorId, db);
      if (!commentAuthor) return null;
      return {
        id: comment.id,
        text: comment.text,
        createdAt: comment.createdAt,
        author: {
          id: commentAuthor.id,
          name: commentAuthor.name,
          username: commentAuthor.username,
          image: commentAuthor.image
        }
      };
    })
    .filter(Boolean) as Post["comments"];

  return {
    id: post.id,
    text: post.text,
    type: post.type,
    projectTitle: post.projectTitle,
    projectStage: post.projectStage,
    techStack: post.techStack,
    media: post.media,
    githubUrl: post.githubUrl,
    liveDemoUrl: post.liveDemoUrl,
    lookingForFeedback: post.lookingForFeedback,
    lookingForCollaborators: post.lookingForCollaborators,
    hashtags: post.hashtags ?? [],
    ...computeAudienceMatch(post.hashtags ?? [], post.authorId, db),
    aiReview: post.aiReview,
    aiScore: post.aiScore,
    views: post.views ?? 0,
    comments: mappedComments,
    createdAt: post.createdAt,
    author: { id: author.id, name: author.name, username: author.username, image: author.image },
    project: project
      ? {
          id: project.id,
          title: project.title,
          slug: project.slug,
          status: project.status,
          tags: project.tags,
          score: project.score
        }
      : undefined,
    _count: {
      likes: post.likes.length,
      dislikes: (post.dislikes ?? []).length,
      comments: (post.comments ?? []).length,
      reposts: post.reposts,
      bookmarks: post.bookmarks.length,
      views: post.views ?? 0
    }
  };
}

function mapProject(project: LocalProject, db: LocalDb): any {
  const owner = withUser(project.ownerId, db);
  if (!owner) throw new Error("Project owner not found");
  return {
    ...project,
    owner: { id: owner.id, name: owner.name, username: owner.username, image: owner.image },
    score: project.score,
    updates: project.updates
  };
}

function upsertTag(db: LocalDb, value: string) {
  const normalized = value.startsWith("#") ? value : `#${value.toLowerCase()}`;
  const existing = db.tags.find((tag) => tag.label === normalized);
  if (existing) {
    existing.usage += 1;
  } else {
    db.tags.push({ id: id("tag"), label: normalized, usage: 1 });
  }
}

export const localDbApi = {
  getFeed(filter: string, page = 1, limit = 10) {
    const db = readDb();
    let posts = [...db.posts];
    if (filter === "trending") posts.sort((a, b) => b.likes.length - a.likes.length);
    else posts.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

    const start = (page - 1) * limit;
    return posts.slice(start, start + limit).map((entry) => mapPost(entry, db));
  },

  createPost(payload: any) {
    const db = readDb();
    const sessionUser = requireSessionUser(db);
    const fromText = extractHashtagsFromText(payload.text ?? "");
    const fromTechStack = (payload.techStack ?? []).map((tag: string) => normalizeHashtag(tag));
    const fromInput = (payload.hashtags ?? []).map((tag: string) => normalizeHashtag(tag));
    const hashtags = uniqueValues([...fromText, ...fromTechStack, ...fromInput]);

    const post: LocalPost = {
      id: id("post"),
      authorId: sessionUser.id,
      projectId: payload.projectId,
      type: payload.type || "UPDATE",
      text: payload.text,
      projectTitle: payload.projectTitle,
      githubUrl: payload.githubUrl,
      liveDemoUrl: payload.liveDemoUrl,
      media: payload.media || [],
      techStack: payload.techStack || [],
      projectStage: payload.projectStage,
      lookingForFeedback: Boolean(payload.lookingForFeedback),
      lookingForCollaborators: Boolean(payload.lookingForCollaborators),
      hashtags,
      aiReview: undefined,
      aiScore: undefined,
      createdAt: nowIso(),
      views: 0,
      likes: [],
      dislikes: [],
      bookmarks: [],
      comments: [],
      reposts: 0
    };

    db.posts.unshift(post);
    post.hashtags.forEach((tag) => upsertTag(db, tag));
    writeDb(db);
    return mapPost(post, db);
  },

  likePost(postId: string) {
    const db = readDb();
    const user = requireSessionUser(db);
    const post = db.posts.find((entry) => entry.id === postId);
    if (post && !post.likes.includes(user.id)) {
      post.dislikes = post.dislikes ?? [];
      post.likes.push(user.id);
      post.dislikes = (post.dislikes ?? []).filter((entry) => entry !== user.id);
    }
    writeDb(db);
  },

  dislikePost(postId: string) {
    const db = readDb();
    const user = requireSessionUser(db);
    const post = db.posts.find((entry) => entry.id === postId);
    if (post) {
      post.dislikes = post.dislikes ?? [];
    }
    if (post && !post.dislikes.includes(user.id)) {
      post.dislikes.push(user.id);
      post.likes = post.likes.filter((entry) => entry !== user.id);
    }
    writeDb(db);
  },

  bookmarkPost(postId: string) {
    const db = readDb();
    const user = requireSessionUser(db);
    const post = db.posts.find((entry) => entry.id === postId);
    if (post && !post.bookmarks.includes(user.id)) post.bookmarks.push(user.id);
    writeDb(db);
  },

  repostPost(postId: string) {
    const db = readDb();
    const post = db.posts.find((entry) => entry.id === postId);
    if (post) post.reposts += 1;
    writeDb(db);
  },

  addComment(postId: string, text: string) {
    const db = readDb();
    const user = requireSessionUser(db);
    const post = db.posts.find((entry) => entry.id === postId);
    if (!post) throw new Error("Post not found");
    post.comments.unshift({
      id: id("c"),
      authorId: user.id,
      text,
      createdAt: nowIso()
    });
    writeDb(db);
    return mapPost(post, db);
  },

  registerView(postId: string) {
    const db = readDb();
    const post = db.posts.find((entry) => entry.id === postId);
    if (!post) return;
    post.views = (post.views ?? 0) + 1;
    writeDb(db);
  },

  runPostAIReview(postId: string) {
    const db = readDb();
    const post = db.posts.find((entry) => entry.id === postId);
    if (!post) throw new Error("Post not found");

    const hashtagBonus = (post.hashtags ?? []).length * 4;
    const techBonus = (post.techStack ?? []).length * 3;
    const textBonus = Math.min(25, Math.floor((post.text?.length ?? 0) / 12));
    const interactionBonus = Math.min(20, post.likes.length + (post.comments?.length ?? 0));
    const aiScore = Math.min(100, 35 + hashtagBonus + techBonus + textBonus + interactionBonus);

    post.aiScore = aiScore;
    post.aiReview =
      aiScore >= 80
        ? "High signal post. Strong clarity, relevant tags, and good engagement potential."
        : aiScore >= 60
          ? "Good post. Improve with more concrete progress metrics and sharper hashtags."
          : "Low signal. Add specific outcomes, stack context, and focused hashtags to improve reach.";

    writeDb(db);
    return mapPost(post, db);
  },

  getRightRail(): RightRail {
    const db = readDb();
    return {
      trendingTags: [...db.tags].sort((a, b) => b.usage - a.usage).slice(0, 8),
      suggestedDevelopers: db.users
        .filter((entry) => entry.role === "DEVELOPER")
        .slice(0, 5)
        .map((entry) => ({
          id: entry.id,
          username: entry.username,
          name: entry.name,
          image: entry.image,
          profile: { skills: entry.profile.skills }
        })),
      featuredProjects: [...db.projects].slice(0, 4).map((entry) => mapProject(entry, db)),
      activeChallenges: db.challenges.filter((entry) => entry.isActive).map((entry) => ({ ...entry, submissions: [] as any[] })) as Challenge[]
    };
  },

  getProjects() {
    const db = readDb();
    return db.projects.map((entry) => mapProject(entry, db));
  },

  getProject(slug: string) {
    const db = readDb();
    const project = db.projects.find((entry) => entry.slug === slug);
    if (!project) throw new Error("Project not found");
    const relatedPosts = db.posts.filter((entry) => entry.projectId === project.id).map((entry) => mapPost(entry, db));
    return { ...mapProject(project, db), posts: relatedPosts, aiReviews: project.aiReviews || [] };
  },

  getChallenges() {
    const db = readDb();
    return db.challenges.map((entry) => ({
      ...entry,
      submissions: entry.submissions
        .map((submission) => {
          const project = db.projects.find((projectEntry) => projectEntry.id === submission.projectId);
          const user = db.users.find((userEntry) => userEntry.id === submission.userId);
          if (!project || !user) return null;
          return {
            id: submission.id,
            note: submission.note,
            isWinner: submission.isWinner,
            project: { id: project.id, title: project.title, slug: project.slug },
            user: { id: user.id, name: user.name, username: user.username, image: user.image }
          };
        })
        .filter(Boolean)
    })) as Challenge[];
  },

  getMentorChats() {
    const db = readDb();
    const user = getSessionUser();
    if (!user?.id) return [];
    return db.mentorChats.filter((chat: any) => !chat.userId || chat.userId === user.id);
  },

  askMentor(prompt: string) {
    const db = readDb();
    const user = requireSessionUser(db);
    const response = `Next step: prioritize one measurable improvement for "${prompt.slice(0, 30)}" this week.`;
    const chat = { id: id("m"), userId: user.id, prompt, response, createdAt: nowIso() } as MentorChat & { userId: string };
    db.mentorChats.unshift(chat as any);
    writeDb(db);
    return chat;
  },

  runProjectReview(projectId: string, prompt: string) {
    const db = readDb();
    const project = db.projects.find((entry) => entry.id === projectId);
    if (!project) throw new Error("Project not found");

    const review: AIReview = {
      id: id("air"),
      prompt,
      codeQuality: "Review completed using local rules engine.",
      suggestions: ["Improve edge-case handling", "Add validation for all form fields"],
      improvements: ["Document API contracts", "Strengthen loading and empty states"],
      bugDetections: ["Check duplicate submission handling"],
      performanceTips: ["Use pagination for heavy feeds", "Memoize expensive list renders"],
      createdAt: nowIso()
    };

    project.aiReviews = [review, ...(project.aiReviews || [])];
    writeDb(db);
    return review;
  },

  getNotifications() {
    const db = readDb();
    const user = getSessionUser();
    if (!user?.id) return [];
    return db.notifications.filter((entry: any) => !entry.userId || entry.userId === user.id);
  },

  getBookmarks(userId: string) {
    const db = readDb();
    return db.posts.filter((entry) => entry.bookmarks.includes(userId)).map((entry) => mapPost(entry, db));
  },

  searchAll(query: string) {
    const db = readDb();
    const q = query.toLowerCase();
    return {
      projects: db.projects.filter((entry) => entry.title.toLowerCase().includes(q) || entry.tags.some((tag) => tag.toLowerCase().includes(q))).map((entry) => mapProject(entry, db)),
      users: db.users.filter((entry) => entry.name.toLowerCase().includes(q) || entry.username.toLowerCase().includes(q)),
      posts: db.posts
        .filter((entry) => entry.text.toLowerCase().includes(q) || (entry.hashtags ?? []).some((tag) => tag.toLowerCase().includes(q)))
        .map((entry) => mapPost(entry, db))
    };
  },

  getProfile(username: string) {
    const db = readDb();
    const user = db.users.find((entry) => entry.username === username);
    if (!user) throw new Error("User not found");

    const ownedProjects = db.projects.filter((entry) => entry.ownerId === user.id).map((entry) => mapProject(entry, db));
    const posts = db.posts.filter((entry) => entry.authorId === user.id).map((entry) => mapPost(entry, db));
    const pinnedProjects = user.pinnedProjectIds
      .map((projectId) => db.projects.find((entry) => entry.id === projectId))
      .filter(Boolean)
      .map((entry: any, idx) => ({ id: id("pin"), order: idx + 1, project: mapProject(entry, db) }));

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      image: user.image,
      openToCollaborate: user.openToCollaborate,
      openToHire: user.openToHire,
      githubUsername: user.githubUsername,
      portfolioUrl: user.portfolioUrl,
      profile: user.profile,
      ownedProjects,
      pinnedProjects,
      posts
    };
  },

  updateProfile(payload: any) {
    const db = readDb();
    const user = requireSessionUser(db);

    user.name = payload.name ?? user.name;
    user.githubUsername = payload.githubUsername ?? user.githubUsername;
    user.portfolioUrl = payload.portfolioUrl ?? user.portfolioUrl;
    user.openToCollaborate = payload.openToCollaborate ?? user.openToCollaborate;
    user.openToHire = payload.openToHire ?? user.openToHire;
    user.profile = {
      ...user.profile,
      bio: payload.bio ?? user.profile.bio,
      skills: payload.skills ?? user.profile.skills,
      badges: payload.badges ?? user.profile.badges
    };

    writeDb(db);
    return this.getProfile(user.username);
  },

  getRecruiterDashboard() {
    const db = readDb();
    const session = getSessionUser();
    if (!session?.id) return null;

    const recruiter = db.users.find((entry) => entry.id === session.id && entry.role === "RECRUITER");
    if (!recruiter?.recruiterProfile) return null;

    return {
      ...recruiter.recruiterProfile,
      user: recruiter,
      savedTalent: recruiter.recruiterProfile.savedTalent
        .map((entry) => ({ ...entry, user: db.users.find((userEntry) => userEntry.id === entry.userId) }))
        .filter((entry) => entry.user)
    };
  },

  searchTalent(params: { skill?: string; tag?: string; category?: string; openToHire?: boolean }) {
    const db = readDb();
    return db.users.filter((entry) => {
      if (entry.role !== "DEVELOPER") return false;
      if (params.openToHire && !entry.openToHire) return false;
      if (params.skill && !entry.profile.skills.some((skill) => skill.toLowerCase().includes(params.skill!.toLowerCase()))) return false;

      if (params.tag || params.category) {
        const projects = db.projects.filter((projectEntry) => projectEntry.ownerId === entry.id);
        if (params.tag && !projects.some((projectEntry) => projectEntry.tags.some((tag) => tag.toLowerCase().includes(params.tag!.toLowerCase())))) return false;
        if (params.category && !projects.some((projectEntry) => projectEntry.category.toLowerCase().includes(params.category!.toLowerCase()))) return false;
      }

      return true;
    });
  },

  shortlistTalent(userId: string, note?: string) {
    const db = readDb();
    const recruiter = requireSessionUser(db);
    if (recruiter.role !== "RECRUITER") throw new Error("Recruiter access required");

    if (!recruiter.recruiterProfile) {
      recruiter.recruiterProfile = { id: id("r"), hiringFor: [], savedTalent: [] };
    }

    const existing = recruiter.recruiterProfile.savedTalent.find((entry) => entry.userId === userId);
    if (existing) existing.note = note;
    else recruiter.recruiterProfile.savedTalent.push({ id: id("short"), userId, note });

    writeDb(db);
    return { ok: true };
  },

  getCollabOpportunities() {
    const db = readDb();
    return db.projects.filter((entry) => entry.lookingForCollaborator).map((entry) => mapProject(entry, db));
  },

  sendCollabRequest(payload: any) {
    const db = readDb();
    const requester = requireSessionUser(db);
    const request = { id: id("col"), ...payload, requesterId: requester.id, status: "OPEN", createdAt: nowIso() };
    db.collabRequests.unshift(request);
    writeDb(db);
    return request;
  },

  getMyCollabRequests() {
    const db = readDb();
    const user = requireSessionUser(db);

    return db.collabRequests
      .filter((entry) => entry.requesterId === user.id || entry.recipientId === user.id)
      .map((entry) => ({
        ...entry,
        project: db.projects.find((projectEntry) => projectEntry.id === entry.projectId),
        requester: db.users.find((userEntry) => userEntry.id === entry.requesterId),
        recipient: db.users.find((userEntry) => userEntry.id === entry.recipientId)
      }));
  },

  login(email: string, password: string) {
    const db = readDb();
    const user = db.users.find((entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.password === password);
    if (!user) throw new Error("Invalid credentials");

    return {
      token: `local-token-${user.id}`,
      user: { id: user.id, email: user.email, username: user.username, role: user.role, name: user.name }
    };
  },

  register(payload: any) {
    const db = readDb();
    if (db.users.some((entry) => entry.email === payload.email || entry.username === payload.username)) {
      throw new Error("Email or username already exists");
    }

    const user: LocalUser = {
      id: id("u"),
      email: payload.email,
      password: payload.password,
      name: payload.name,
      username: payload.username,
      role: payload.role || "DEVELOPER",
      openToCollaborate: false,
      openToHire: false,
      profile: {
        bio: "",
        skills: [],
        badges: [],
        projectsBuiltCount: 0,
        contributionCount: 0,
        streakDays: 0
      },
      pinnedProjectIds: []
    };

    if (user.role === "RECRUITER") {
      user.recruiterProfile = {
        id: id("r"),
        company: "",
        roleTitle: "",
        hiringFor: [],
        savedTalent: []
      };
    }

    db.users.push(user);
    writeDb(db);

    return {
      token: `local-token-${user.id}`,
      user: { id: user.id, email: user.email, username: user.username, role: user.role, name: user.name }
    };
  },

  submitChallenge(challengeId: string, projectId: string, note: string) {
    const db = readDb();
    const user = requireSessionUser(db);
    const challenge = db.challenges.find((entry) => entry.id === challengeId);
    if (!challenge) throw new Error("Challenge not found");

    challenge.submissions.push({ id: id("sub"), projectId, userId: user.id, note, isWinner: false } as any);
    writeDb(db);
    return { ok: true };
  },

  createProject(payload: any) {
    const db = readDb();
    const user = requireSessionUser(db);

    const slug = String(payload.title || "project")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") + `-${Date.now().toString().slice(-4)}`;

    const project: LocalProject = {
      id: id("p"),
      title: payload.title,
      slug,
      shortDescription: payload.shortDescription,
      fullDescription: payload.fullDescription,
      media: payload.media || [],
      githubUrl: payload.githubUrl,
      liveDemoUrl: payload.liveDemoUrl,
      tags: payload.tags || [],
      status: payload.status || "BUILDING",
      category: payload.category || "Web",
      lookingForFeedback: Boolean(payload.lookingForFeedback),
      lookingForCollaborator: Boolean(payload.lookingForCollaborator),
      rolesNeeded: payload.rolesNeeded || [],
      ownerId: user.id,
      contributors: [user.id],
      updates: [],
      score: scoreFromProject(payload),
      aiReviews: []
    };

    db.projects.unshift(project);
    user.profile.projectsBuiltCount += 1;
    project.tags.forEach((tag) => upsertTag(db, tag));
    writeDb(db);
    return mapProject(project, db);
  },

  createProjectUpdate(projectId: string, payload: any) {
    const db = readDb();
    const project = db.projects.find((entry) => entry.id === projectId);
    if (!project) throw new Error("Project not found");

    const update = {
      id: id("upd"),
      dayLabel: payload.dayLabel,
      title: payload.title,
      description: payload.description,
      media: payload.media || [],
      createdAt: nowIso()
    };

    project.updates.push(update);
    project.score = scoreFromProject(project);
    writeDb(db);
    return update;
  }
};
