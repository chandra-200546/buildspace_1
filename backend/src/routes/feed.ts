import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/", async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const skip = (page - 1) * limit;
  const filter = String(req.query.filter ?? "latest");

  const posts = await prisma.post.findMany({
    take: limit,
    skip,
    orderBy:
      filter === "trending"
        ? [{ likes: { _count: "desc" } }, { createdAt: "desc" }]
        : { createdAt: "desc" },
    where: filter === "beginner" ? { techStack: { hasSome: ["beginner", "html", "css"] } } : {},
    include: {
      author: { select: { id: true, name: true, username: true, image: true } },
      project: { select: { id: true, title: true, slug: true, status: true, tags: true, score: true } },
      _count: { select: { likes: true, comments: true, reposts: true, bookmarks: true } }
    }
  });

  res.json({ page, limit, items: posts });
});

router.post("/", requireAuth, async (req, res) => {
  const input = z
    .object({
      text: z.string().min(1),
      type: z.enum(["UPDATE", "PROJECT_LAUNCH", "BUILD_LOG", "CHALLENGE_SUBMISSION", "COLLAB_REQUEST"]).default("UPDATE"),
      projectId: z.string().optional(),
      projectTitle: z.string().optional(),
      githubUrl: z.string().url().optional(),
      liveDemoUrl: z.string().url().optional(),
      media: z.array(z.string().url()).default([]),
      techStack: z.array(z.string()).default([]),
      projectStage: z.enum(["IDEA", "BUILDING", "LAUNCHED"]).optional(),
      lookingForFeedback: z.boolean().default(false),
      lookingForCollaborators: z.boolean().default(false)
    })
    .parse(req.body);

  const post = await prisma.post.create({
    data: {
      ...input,
      authorId: req.user!.id
    },
    include: {
      author: { select: { id: true, name: true, username: true, image: true } },
      _count: { select: { likes: true, comments: true, reposts: true, bookmarks: true } }
    }
  });

  res.status(201).json(post);
});

router.post("/:postId/like", requireAuth, async (req, res) => {
  const { postId } = req.params;
  await prisma.like.upsert({
    where: { postId_userId: { postId, userId: req.user!.id } },
    create: { postId, userId: req.user!.id },
    update: {}
  });
  res.json({ ok: true });
});

router.post("/:postId/bookmark", requireAuth, async (req, res) => {
  const { postId } = req.params;
  await prisma.bookmark.upsert({
    where: { postId_userId: { postId, userId: req.user!.id } },
    create: { postId, userId: req.user!.id },
    update: {}
  });
  res.json({ ok: true });
});

router.post("/:postId/comment", requireAuth, async (req, res) => {
  const { postId } = req.params;
  const input = z.object({ text: z.string().min(1) }).parse(req.body);

  const comment = await prisma.comment.create({
    data: { postId, authorId: req.user!.id, text: input.text },
    include: { author: { select: { id: true, username: true, name: true, image: true } } }
  });

  res.status(201).json(comment);
});

router.post("/:postId/repost", requireAuth, async (req, res) => {
  const { postId } = req.params;
  const source = await prisma.post.findUnique({ where: { id: postId } });
  if (!source) {
    return res.status(404).json({ message: "Post not found" });
  }

  const repost = await prisma.post.create({
    data: {
      authorId: req.user!.id,
      type: source.type,
      text: source.text,
      projectId: source.projectId,
      projectTitle: source.projectTitle,
      githubUrl: source.githubUrl ?? undefined,
      liveDemoUrl: source.liveDemoUrl ?? undefined,
      media: source.media,
      techStack: source.techStack,
      projectStage: source.projectStage ?? undefined,
      lookingForFeedback: source.lookingForFeedback,
      lookingForCollaborators: source.lookingForCollaborators,
      repostOfId: source.id
    }
  });

  res.status(201).json(repost);
});

export default router;
