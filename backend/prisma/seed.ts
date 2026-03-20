import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { generateProjectScore } from "../src/services/scoring.js";

const prisma = new PrismaClient();

async function main() {
  await prisma.shortlist.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.aIMentorChat.deleteMany();
  await prisma.aIReview.deleteMany();
  await prisma.projectScore.deleteMany();
  await prisma.collaborationRequest.deleteMany();
  await prisma.challengeSubmission.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.post.deleteMany();
  await prisma.projectUpdate.deleteMany();
  await prisma.pinnedProject.deleteMany();
  await prisma.project.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.recruiterProfile.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const [alex, rina, sam, recruiter] = await Promise.all([
    prisma.user.create({
      data: {
        email: "alex@buildspace.ai",
        passwordHash,
        name: "Alex Rivera",
        username: "alexcodes",
        role: "DEVELOPER",
        image: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39",
        githubUsername: "alexcodes",
        portfolioUrl: "https://alex.dev",
        openToCollaborate: true,
        openToHire: true,
        profile: {
          create: {
            bio: "Full-stack developer building AI-first SaaS products in public.",
            location: "Bengaluru",
            skills: ["React", "TypeScript", "Node", "Prisma", "PostgreSQL"],
            badges: ["Top Builder", "Challenge Winner"],
            projectsBuiltCount: 14,
            contributionCount: 96,
            streakDays: 31,
            featuredHeadline: "Shipping products weekly"
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        email: "rina@buildspace.ai",
        passwordHash,
        name: "Rina Das",
        username: "rinadev",
        role: "DEVELOPER",
        image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f",
        githubUsername: "rinadev",
        openToCollaborate: true,
        openToHire: false,
        profile: {
          create: {
            bio: "Frontend engineer turning complex systems into clean user experiences.",
            location: "Hyderabad",
            skills: ["React", "Tailwind", "UI/UX", "Framer Motion"],
            badges: ["UI Innovator"],
            projectsBuiltCount: 11,
            contributionCount: 73,
            streakDays: 18,
            featuredHeadline: "Design-minded engineer"
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        email: "sam@buildspace.ai",
        passwordHash,
        name: "Sam Patel",
        username: "sambuilds",
        role: "DEVELOPER",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
        githubUsername: "sambuilds",
        openToCollaborate: false,
        openToHire: true,
        profile: {
          create: {
            bio: "Backend + ML engineer focused on performance and reliability.",
            location: "Pune",
            skills: ["Python", "FastAPI", "PostgreSQL", "ML", "Docker"],
            badges: ["Performance Pro"],
            projectsBuiltCount: 19,
            contributionCount: 121,
            streakDays: 42,
            featuredHeadline: "Scaling APIs and AI pipelines"
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        email: "maya@talentforge.com",
        passwordHash,
        name: "Maya Kapoor",
        username: "maya_recruits",
        role: "RECRUITER",
        image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df",
        recruiterProfile: {
          create: {
            company: "TalentForge Labs",
            roleTitle: "Senior Technical Recruiter",
            hiringFor: ["Frontend", "Backend", "ML Engineer"]
          }
        },
        profile: {
          create: {
            bio: "Hiring builders with strong proof-of-work projects.",
            skills: ["Hiring", "Talent Strategy"],
            badges: ["Hiring Partner"]
          }
        }
      }
    })
  ]);

  const pulse = await prisma.project.create({
    data: {
      title: "DevPulse Analytics",
      slug: "devpulse-analytics",
      shortDescription: "Track developer productivity and release health in one dashboard.",
      fullDescription: "DevPulse is a project-first analytics layer for engineering teams. It combines deployment velocity, bug flow, and roadmap confidence into one AI-guided dashboard.",
      media: [
        "https://images.unsplash.com/photo-1551281044-8a5002f5c9d1",
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6"
      ],
      githubUrl: "https://github.com/chandra-200546/buildspace_1",
      liveDemoUrl: "https://devpulse-demo.vercel.app",
      tags: ["react", "node", "analytics", "ai"],
      status: "BUILDING",
      category: "Developer Tools",
      lookingForFeedback: true,
      lookingForCollaborator: true,
      rolesNeeded: ["Frontend", "ML"],
      ownerId: alex.id,
      contributors: { connect: [{ id: alex.id }, { id: rina.id }] }
    }
  });

  const mentor = await prisma.project.create({
    data: {
      title: "DeployMentor",
      slug: "deploymentor",
      shortDescription: "AI coach for deployment readiness and incident prevention.",
      fullDescription: "DeployMentor helps teams detect release risk and improve post-deploy reliability with practical, context-aware recommendations.",
      media: ["https://images.unsplash.com/photo-1518770660439-4636190af475"],
      githubUrl: "https://github.com/chandra-200546/buildspace_1",
      liveDemoUrl: "https://deploymentor.app",
      tags: ["nextjs", "prisma", "postgres", "ai"],
      status: "LAUNCHED",
      category: "AI Productivity",
      lookingForFeedback: false,
      lookingForCollaborator: false,
      rolesNeeded: [],
      ownerId: sam.id,
      contributors: { connect: [{ id: sam.id }] }
    }
  });

  await prisma.projectUpdate.createMany({
    data: [
      {
        projectId: pulse.id,
        dayLabel: "Day 1",
        title: "UI foundation shipped",
        description: "Built a feed-driven UI with sidebars and high-density project cards.",
        media: []
      },
      {
        projectId: pulse.id,
        dayLabel: "Day 2",
        title: "API + Prisma integration",
        description: "Connected feed, likes, and project updates to PostgreSQL.",
        media: []
      },
      {
        projectId: pulse.id,
        dayLabel: "Day 3",
        title: "Recruiter filters",
        description: "Added skill and project-category filters for hiring discovery.",
        media: []
      }
    ]
  });

  const scorePulse = generateProjectScore({
    tagsCount: 4,
    hasLiveDemo: true,
    hasGithub: true,
    updatesCount: 3,
    collaboratorsCount: 2
  });

  const scoreMentor = generateProjectScore({
    tagsCount: 4,
    hasLiveDemo: true,
    hasGithub: true,
    updatesCount: 1,
    collaboratorsCount: 1
  });

  await prisma.projectScore.createMany({
    data: [
      { projectId: pulse.id, ...scorePulse },
      { projectId: mentor.id, ...scoreMentor }
    ]
  });

  await prisma.pinnedProject.createMany({
    data: [
      { userId: alex.id, projectId: pulse.id, order: 1 },
      { userId: sam.id, projectId: mentor.id, order: 1 }
    ]
  });

  await prisma.post.createMany({
    data: [
      {
        authorId: alex.id,
        projectId: pulse.id,
        type: "BUILD_LOG",
        text: "Day 3: Added recruiter filters by skill and project category. Looking for feedback on ranking quality.",
        projectTitle: pulse.title,
        githubUrl: pulse.githubUrl,
        liveDemoUrl: pulse.liveDemoUrl,
        media: [],
        techStack: ["react", "typescript", "prisma"],
        projectStage: "BUILDING",
        lookingForFeedback: true,
        lookingForCollaborators: true
      },
      {
        authorId: sam.id,
        projectId: mentor.id,
        type: "PROJECT_LAUNCH",
        text: "DeployMentor is live. AI release-readiness checks are now in beta.",
        projectTitle: mentor.title,
        githubUrl: mentor.githubUrl,
        liveDemoUrl: mentor.liveDemoUrl,
        media: [],
        techStack: ["nextjs", "postgres", "ai"],
        projectStage: "LAUNCHED",
        lookingForFeedback: false,
        lookingForCollaborators: false
      }
    ]
  });

  const posts = await prisma.post.findMany();
  await prisma.like.createMany({
    data: [
      { postId: posts[0].id, userId: rina.id },
      { postId: posts[0].id, userId: sam.id },
      { postId: posts[1].id, userId: alex.id }
    ]
  });

  await prisma.comment.createMany({
    data: [
      { postId: posts[0].id, authorId: rina.id, text: "Great momentum. Add score explainability in the UI." },
      { postId: posts[1].id, authorId: alex.id, text: "Love this. Any plans for incident retros integration?" }
    ]
  });

  await prisma.bookmark.create({ data: { postId: posts[1].id, userId: alex.id } });

  await prisma.challenge.createMany({
    data: [
      {
        title: "Weekly AI Tools Sprint",
        description: "Build a developer tool that uses AI to speed up workflows.",
        category: "AI",
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6),
        badge: "AI Builder",
        reward: "$500 + Feature Spotlight",
        isActive: true
      },
      {
        title: "Build in Public Marathon",
        description: "Post 5 days of consecutive project updates and measurable progress.",
        category: "Build in Public",
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9),
        badge: "Consistency Pro",
        reward: "Homepage Feature",
        isActive: true
      }
    ]
  });

  const challenge = await prisma.challenge.findFirstOrThrow();

  await prisma.challengeSubmission.create({
    data: {
      challengeId: challenge.id,
      projectId: pulse.id,
      userId: alex.id,
      note: "Submitted with daily logs and score improvements."
    }
  });

  await prisma.collaborationRequest.create({
    data: {
      projectId: pulse.id,
      requesterId: alex.id,
      recipientId: sam.id,
      roleNeeded: "ML Engineer",
      message: "Need help on recommendation ranking model for project discovery."
    }
  });

  const recruiterProfile = await prisma.recruiterProfile.findUniqueOrThrow({ where: { userId: recruiter.id } });
  await prisma.shortlist.create({
    data: {
      recruiterProfileId: recruiterProfile.id,
      userId: alex.id,
      note: "Strong public proof-of-work and consistency."
    }
  });

  await prisma.tag.createMany({
    data: [
      { label: "#react", usage: 44 },
      { label: "#nextjs", usage: 39 },
      { label: "#ai", usage: 62 },
      { label: "#prisma", usage: 18 },
      { label: "#devtools", usage: 27 },
      { label: "#buildinpublic", usage: 52 }
    ]
  });

  await prisma.aIReview.create({
    data: {
      projectId: pulse.id,
      prompt: "Review architecture and performance risks",
      codeQuality: "Well-structured feature modules with clear ownership.",
      suggestions: ["Add optimistic updates", "Improve route-level caching"],
      improvements: ["Introduce background jobs for heavy analytics"],
      bugDetections: ["Potential duplicate challenge submissions on retries"],
      performanceTips: ["Add DB index on Post.createdAt and Project.tags"]
    }
  });

  await prisma.aIMentorChat.create({
    data: {
      userId: alex.id,
      prompt: "What should I improve in this project?",
      response: "Improve onboarding in the first 2 minutes and add benchmark proof on project cards."
    }
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: alex.id,
        type: "SYSTEM",
        title: "Welcome to BuildSpace AI",
        message: "Show your work. Build your reputation. Get opportunities."
      },
      {
        userId: sam.id,
        type: "COLLAB",
        title: "Collaboration Request",
        message: "Alex invited you to join DevPulse Analytics."
      }
    ]
  });

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
