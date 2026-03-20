import { Router } from "express";
import slugify from "slugify";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { generateProjectScore } from "../services/scoring.js";

const router = Router();

router.get("/", async (_req, res) => {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { id: true, name: true, username: true, image: true } },
      score: true,
      updates: { orderBy: { createdAt: "asc" } },
      _count: { select: { contributors: true, posts: true } }
    }
  });
  res.json(projects);
});

router.get("/:slug", async (req, res) => {
  const project = await prisma.project.findUnique({
    where: { slug: req.params.slug },
    include: {
      owner: { select: { id: true, name: true, username: true, image: true } },
      contributors: { select: { id: true, name: true, username: true, image: true } },
      updates: { orderBy: { createdAt: "asc" } },
      score: true,
      aiReviews: { orderBy: { createdAt: "desc" }, take: 5 },
      posts: {
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, name: true, username: true, image: true } },
          _count: { select: { likes: true, comments: true, reposts: true, bookmarks: true } }
        }
      }
    }
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  res.json(project);
});

router.post("/", requireAuth, async (req, res) => {
  const input = z
    .object({
      title: z.string().min(3),
      shortDescription: z.string().min(10),
      fullDescription: z.string().min(20),
      media: z.array(z.string().url()).default([]),
      githubUrl: z.string().url().optional(),
      liveDemoUrl: z.string().url().optional(),
      tags: z.array(z.string()).default([]),
      status: z.enum(["IDEA", "BUILDING", "LAUNCHED"]).default("BUILDING"),
      category: z.string().default("Web"),
      rolesNeeded: z.array(z.string()).default([]),
      lookingForFeedback: z.boolean().default(false),
      lookingForCollaborator: z.boolean().default(false)
    })
    .parse(req.body);

  const slug = slugify(input.title, { lower: true, strict: true }) + `-${Date.now().toString().slice(-4)}`;

  const project = await prisma.project.create({
    data: {
      ...input,
      slug,
      ownerId: req.user!.id,
      contributors: { connect: { id: req.user!.id } }
    },
    include: { score: true }
  });

  const score = generateProjectScore({
    tagsCount: project.tags.length,
    hasLiveDemo: Boolean(project.liveDemoUrl),
    hasGithub: Boolean(project.githubUrl),
    updatesCount: 0,
    collaboratorsCount: 1
  });

  await prisma.projectScore.create({ data: { ...score, projectId: project.id } });

  res.status(201).json(project);
});

router.post("/:projectId/updates", requireAuth, async (req, res) => {
  const { projectId } = req.params;
  const input = z
    .object({
      dayLabel: z.string().min(2),
      title: z.string().min(3),
      description: z.string().min(5),
      media: z.array(z.string().url()).default([])
    })
    .parse(req.body);

  const update = await prisma.projectUpdate.create({
    data: {
      ...input,
      projectId
    }
  });

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { contributors: true, updates: true }
  });

  if (project) {
    const score = generateProjectScore({
      tagsCount: project.tags.length,
      hasLiveDemo: Boolean(project.liveDemoUrl),
      hasGithub: Boolean(project.githubUrl),
      updatesCount: project.updates.length,
      collaboratorsCount: project.contributors.length
    });

    await prisma.projectScore.upsert({
      where: { projectId },
      create: { ...score, projectId },
      update: score
    });
  }

  res.status(201).json(update);
});

router.get("/:projectId/timeline", async (req, res) => {
  const updates = await prisma.projectUpdate.findMany({
    where: { projectId: req.params.projectId },
    orderBy: { createdAt: "asc" }
  });

  res.json(updates);
});

export default router;
