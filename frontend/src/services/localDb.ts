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
    company: string;
    roleTitle: string;
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
  createdAt: string;
  likes: string[];
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

const DB_KEY = "buildspace_local_db_v1";

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

function seedDb(): LocalDb {
  const alexId = id("u");
  const rinaId = id("u");
  const recruiterId = id("u");
  const projectId = id("p");
  const postId = id("post");
  const challengeId = id("ch");

  return {
    users: [
      {
        id: alexId,
        email: "alex@buildspace.ai",
        password: "password123",
        name: "Alex Rivera",
        username: "alexcodes",
        role: "DEVELOPER",
        openToCollaborate: true,
        openToHire: true,
        githubUsername: "alexcodes",
        profile: {
          bio: "Full-stack builder shipping in public.",
          location: "Bengaluru",
          skills: ["React", "TypeScript", "Node", "Prisma"],
          badges: ["Top Builder"],
          projectsBuiltCount: 8,
          contributionCount: 42,
          streakDays: 17
        },
        pinnedProjectIds: [projectId]
      },
      {
        id: rinaId,
        email: "rina@buildspace.ai",
        password: "password123",
        name: "Rina Das",
        username: "rinadev",
        role: "DEVELOPER",
        openToCollaborate: true,
        openToHire: false,
        profile: {
          bio: "Frontend engineer focused on polished dev tooling.",
          skills: ["React", "Tailwind", "UI/UX"],
          badges: ["UI Innovator"],
          projectsBuiltCount: 6,
          contributionCount: 21,
          streakDays: 9
        },
        pinnedProjectIds: []
      },
      {
        id: recruiterId,
        email: "maya@talentforge.com",
        password: "password123",
        name: "Maya Kapoor",
        username: "maya_recruits",
        role: "RECRUITER",
        openToCollaborate: false,
        openToHire: false,
        profile: {
          bio: "Hiring builders through proof-of-work.",
          skills: ["Hiring"],
          badges: ["Hiring Partner"],
          projectsBuiltCount: 0,
          contributionCount: 0,
          streakDays: 0
        },
        recruiterProfile: {
          id: id("r"),
          company: "TalentForge",
          roleTitle: "Technical Recruiter",
          hiringFor: ["Frontend", "Backend"],
          savedTalent: []
        },
        pinnedProjectIds: []
      }
    ],
    projects: [
      {
        id: projectId,
        title: "DevPulse Analytics",
        slug: "devpulse-analytics",
        shortDescription: "Project-first analytics for developer momentum.",
        fullDescription: "Tracks build velocity, quality signals, and project growth.",
        media: [],
        githubUrl: "https://github.com/chandra-200546/buildspace_1",
        liveDemoUrl: "https://example.com",
        tags: ["react", "typescript", "ai"],
        status: "BUILDING",
        category: "Developer Tools",
        lookingForFeedback: true,
        lookingForCollaborator: true,
        rolesNeeded: ["Frontend", "ML"],
        ownerId: alexId,
        contributors: [alexId, rinaId],
        updates: [
          { id: id("upd"), dayLabel: "Day 1", title: "UI", description: "Built feed layout", media: [], createdAt: nowIso() },
          { id: id("upd"), dayLabel: "Day 2", title: "Backend", description: "Added auth + posts", media: [], createdAt: nowIso() }
        ],
        score: { qualityScore: 84, innovationScore: 82, complexityScore: 79, overallScore: 82 },
        aiReviews: []
      }
    ],
    posts: [
      {
        id: postId,
        authorId: alexId,
        projectId,
        type: "BUILD_LOG",
        text: "Day 2 done: backend auth and feed APIs complete. Looking for feedback on profile credibility UX.",
        projectTitle: "DevPulse Analytics",
        githubUrl: "https://github.com/chandra-200546/buildspace_1",
        liveDemoUrl: "https://example.com",
        media: [],
        techStack: ["react", "typescript", "node"],
        projectStage: "BUILDING",
        lookingForFeedback: true,
        lookingForCollaborators: true,
        createdAt: nowIso(),
        likes: [rinaId],
        bookmarks: [],
        comments: [],
        reposts: 0
      }
    ],
    challenges: [
      {
        id: challengeId,
        title: "Weekly AI Tools Sprint",
        description: "Build an AI-powered developer workflow tool.",
        category: "AI",
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6).toISOString(),
        badge: "AI Builder",
        reward: "Homepage spotlight",
        isActive: true,
        submissions: []
      }
    ],
    mentorChats: [
      {
        id: id("m"),
        prompt: "What should I improve in this project?",
        response: "Improve onboarding speed and add score explainability.",
        createdAt: nowIso()
      } as MentorChat
    ],
    notifications: [
      {
        id: id("n"),
        title: "Welcome to BuildSpace AI",
        message: "Show your work. Build your reputation. Get opportunities.",
        type: "SYSTEM",
        isRead: false,
        createdAt: nowIso()
      }
    ],
    collabRequests: [],
    tags: [
      { id: id("tag"), label: "#react", usage: 34 },
      { id: id("tag"), label: "#typescript", usage: 29 },
      { id: id("tag"), label: "#ai", usage: 45 },
      { id: id("tag"), label: "#buildinpublic", usage: 25 }
    ]
  };
}

function readDb() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    const seeded = seedDb();
    localStorage.setItem(DB_KEY, JSON.stringify(seeded));
    return seeded;
  }
  return JSON.parse(raw) as LocalDb;
}

function writeDb(db: LocalDb) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function withUser(userId: string, db: LocalDb) {
  return db.users.find((u) => u.id === userId);
}

function mapPost(post: LocalPost, db: LocalDb): Post {
  const author = withUser(post.authorId, db)!;
  const project = post.projectId ? db.projects.find((p) => p.id === post.projectId) : undefined;
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
      comments: post.comments.length,
      reposts: post.reposts,
      bookmarks: post.bookmarks.length
    }
  };
}

function mapProject(project: LocalProject, db: LocalDb): any {
  const owner = withUser(project.ownerId, db)!;
  return {
    ...project,
    owner: { id: owner.id, name: owner.name, username: owner.username, image: owner.image },
    score: project.score,
    updates: project.updates
  };
}

export const localDbApi = {
  getFeed(filter: string, page = 1, limit = 10) {
    const db = readDb();
    let posts = [...db.posts];
    if (filter === "trending") posts.sort((a, b) => b.likes.length - a.likes.length);
    else posts.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    if (filter === "beginner") posts = posts.filter((p) => p.techStack.some((t) => ["html", "css", "beginner", "react"].includes(t.toLowerCase())));
    const start = (page - 1) * limit;
    return posts.slice(start, start + limit).map((p) => mapPost(p, db));
  },

  createPost(payload: any) {
    const db = readDb();
    const sessionUser = getSessionUser() || db.users[0];
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
      createdAt: nowIso(),
      likes: [],
      bookmarks: [],
      comments: [],
      reposts: 0
    };
    db.posts.unshift(post);
    writeDb(db);
    return mapPost(post, db);
  },

  likePost(postId: string) {
    const db = readDb();
    const user = getSessionUser() || db.users[0];
    const post = db.posts.find((p) => p.id === postId);
    if (post && !post.likes.includes(user.id)) post.likes.push(user.id);
    writeDb(db);
  },

  bookmarkPost(postId: string) {
    const db = readDb();
    const user = getSessionUser() || db.users[0];
    const post = db.posts.find((p) => p.id === postId);
    if (post && !post.bookmarks.includes(user.id)) post.bookmarks.push(user.id);
    writeDb(db);
  },

  repostPost(postId: string) {
    const db = readDb();
    const post = db.posts.find((p) => p.id === postId);
    if (post) post.reposts += 1;
    writeDb(db);
  },

  getRightRail(): RightRail {
    const db = readDb();
    return {
      trendingTags: db.tags,
      suggestedDevelopers: db.users.filter((u) => u.role === "DEVELOPER").slice(0, 5).map((u) => ({
        id: u.id,
        username: u.username,
        name: u.name,
        image: u.image,
        profile: { skills: u.profile.skills }
      })),
      featuredProjects: db.projects.slice(0, 4).map((p) => mapProject(p, db)),
      activeChallenges: db.challenges.filter((c) => c.isActive).map((c) => ({ ...c, submissions: [] as any[] })) as Challenge[]
    };
  },

  getProjects() {
    const db = readDb();
    return db.projects.map((p) => mapProject(p, db));
  },

  getProject(slug: string) {
    const db = readDb();
    const project = db.projects.find((p) => p.slug === slug);
    if (!project) throw new Error("Project not found");
    const relatedPosts = db.posts.filter((p) => p.projectId === project.id).map((p) => mapPost(p, db));
    return { ...mapProject(project, db), posts: relatedPosts, aiReviews: project.aiReviews || [] };
  },

  getChallenges() {
    const db = readDb();
    return db.challenges.map((c) => ({
      ...c,
      submissions: c.submissions.map((s) => {
        const project = db.projects.find((p) => p.id === s.projectId)!;
        const user = db.users.find((u) => u.id === s.userId)!;
        return { id: s.id, note: s.note, isWinner: s.isWinner, project: { id: project.id, title: project.title, slug: project.slug }, user: { id: user.id, name: user.name, username: user.username, image: user.image } };
      })
    })) as Challenge[];
  },

  getMentorChats() {
    return readDb().mentorChats;
  },

  askMentor(prompt: string) {
    const db = readDb();
    const response = `Great direction. Next step: ${prompt.slice(0, 35)}... and ship one measurable improvement.`;
    const chat = { id: id("m"), prompt, response, createdAt: nowIso() } as MentorChat;
    db.mentorChats.unshift(chat);
    writeDb(db);
    return chat;
  },

  runProjectReview(projectId: string, prompt: string) {
    const db = readDb();
    const project = db.projects.find((p) => p.id === projectId);
    if (!project) throw new Error("Project not found");
    const review: AIReview = {
      id: id("air"),
      prompt,
      codeQuality: "Strong structure. Tighten input validation and loading states.",
      suggestions: ["Add optimistic UI updates", "Improve form validation", "Improve empty states"],
      improvements: ["Add route protection", "Add analytics events"],
      bugDetections: ["Potential duplicate submissions"],
      performanceTips: ["Memoize feed cards", "Paginate heavy queries"],
      createdAt: nowIso()
    };
    project.aiReviews = [review, ...(project.aiReviews || [])];
    writeDb(db);
    return review;
  },

  getNotifications() {
    const db = readDb();
    const user = getSessionUser();
    return db.notifications.filter((n) => !user || (n as any).userId === undefined || (n as any).userId === user.id);
  },

  getBookmarks(userId: string) {
    const db = readDb();
    return db.posts.filter((p) => p.bookmarks.includes(userId)).map((p) => mapPost(p, db));
  },

  searchAll(q: string) {
    const db = readDb();
    const query = q.toLowerCase();
    return {
      projects: db.projects.filter((p) => p.title.toLowerCase().includes(query) || p.tags.some((t) => t.toLowerCase().includes(query))).map((p) => mapProject(p, db)),
      users: db.users.filter((u) => u.name.toLowerCase().includes(query) || u.username.toLowerCase().includes(query)),
      posts: db.posts.filter((p) => p.text.toLowerCase().includes(query)).map((p) => mapPost(p, db))
    };
  },

  getProfile(username: string) {
    const db = readDb();
    const user = db.users.find((u) => u.username === username);
    if (!user) throw new Error("User not found");
    const ownedProjects = db.projects.filter((p) => p.ownerId === user.id).map((p) => mapProject(p, db));
    const posts = db.posts.filter((p) => p.authorId === user.id).map((p) => mapPost(p, db));
    const pinnedProjects = user.pinnedProjectIds
      .map((idValue) => db.projects.find((p) => p.id === idValue))
      .filter(Boolean)
      .map((p: any, idx) => ({ id: id("pin"), order: idx + 1, project: mapProject(p, db) }));

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
    const session = getSessionUser() || db.users[0];
    const user = db.users.find((u) => u.id === session.id)!;
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
    const session = getSessionUser() || db.users.find((u) => u.role === "RECRUITER");
    const recruiter = db.users.find((u) => u.id === session?.id && u.role === "RECRUITER") || db.users.find((u) => u.role === "RECRUITER");
    if (!recruiter?.recruiterProfile) return null;
    return {
      ...recruiter.recruiterProfile,
      user: recruiter,
      savedTalent: recruiter.recruiterProfile.savedTalent.map((s) => ({ ...s, user: db.users.find((u) => u.id === s.userId) }))
    };
  },

  searchTalent(params: { skill?: string; tag?: string; category?: string; openToHire?: boolean }) {
    const db = readDb();
    return db.users.filter((u) => {
      if (u.role !== "DEVELOPER") return false;
      if (params.openToHire && !u.openToHire) return false;
      if (params.skill && !u.profile.skills.some((s) => s.toLowerCase().includes(params.skill!.toLowerCase()))) return false;
      if (params.tag || params.category) {
        const projects = db.projects.filter((p) => p.ownerId === u.id);
        if (params.tag && !projects.some((p) => p.tags.some((t) => t.toLowerCase().includes(params.tag!.toLowerCase())))) return false;
        if (params.category && !projects.some((p) => p.category.toLowerCase().includes(params.category!.toLowerCase()))) return false;
      }
      return true;
    });
  },

  shortlistTalent(userId: string, note?: string) {
    const db = readDb();
    const recruiter = db.users.find((u) => u.role === "RECRUITER");
    if (!recruiter?.recruiterProfile) throw new Error("Recruiter not found");
    const existing = recruiter.recruiterProfile.savedTalent.find((s) => s.userId === userId);
    if (existing) existing.note = note;
    else recruiter.recruiterProfile.savedTalent.push({ id: id("short"), userId, note });
    writeDb(db);
    return { ok: true };
  },

  getCollabOpportunities() {
    const db = readDb();
    return db.projects.filter((p) => p.lookingForCollaborator).map((p) => mapProject(p, db));
  },

  sendCollabRequest(payload: any) {
    const db = readDb();
    const requester = getSessionUser() || db.users[0];
    const request = { id: id("col"), ...payload, requesterId: requester.id, status: "OPEN", createdAt: nowIso() };
    db.collabRequests.unshift(request);
    writeDb(db);
    return request;
  },

  getMyCollabRequests() {
    const db = readDb();
    const user = getSessionUser() || db.users[0];
    return db.collabRequests
      .filter((r) => r.requesterId === user.id || r.recipientId === user.id)
      .map((r) => ({
        ...r,
        project: db.projects.find((p) => p.id === r.projectId),
        requester: db.users.find((u) => u.id === r.requesterId),
        recipient: db.users.find((u) => u.id === r.recipientId)
      }));
  },

  login(email: string, password: string) {
    const db = readDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) throw new Error("Invalid credentials");
    return {
      token: `local-token-${user.id}`,
      user: { id: user.id, email: user.email, username: user.username, role: user.role, name: user.name }
    };
  },

  register(payload: any) {
    const db = readDb();
    if (db.users.some((u) => u.email === payload.email || u.username === payload.username)) {
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
        bio: "Building in public on BuildSpace AI",
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
        company: "Stealth Startup",
        roleTitle: "Talent Partner",
        hiringFor: ["Frontend", "Backend"],
        savedTalent: []
      };
    }
    db.users.push(user);
    writeDb(db);
    return { token: `local-token-${user.id}`, user: { id: user.id, email: user.email, username: user.username, role: user.role, name: user.name } };
  },

  submitChallenge(challengeId: string, projectId: string, note: string) {
    const db = readDb();
    const user = getSessionUser() || db.users[0];
    const challenge = db.challenges.find((c) => c.id === challengeId);
    if (!challenge) throw new Error("Challenge not found");
    challenge.submissions.push({ id: id("sub"), challengeId, projectId, userId: user.id, note, isWinner: false } as any);
    writeDb(db);
    return { ok: true };
  },

  createProject(payload: any) {
    const db = readDb();
    const user = getSessionUser() || db.users[0];
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
    const dbUser = db.users.find((u) => u.id === user.id);
    if (dbUser) dbUser.profile.projectsBuiltCount += 1;
    writeDb(db);
    return mapProject(project, db);
  },

  createProjectUpdate(projectId: string, payload: any) {
    const db = readDb();
    const project = db.projects.find((p) => p.id === projectId);
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
