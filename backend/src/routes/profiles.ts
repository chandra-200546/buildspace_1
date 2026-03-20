import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/:username", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { username: req.params.username },
    include: {
      profile: true,
      ownedProjects: { include: { score: true, updates: true } },
      pinnedProjects: {
        include: {
          project: {
            include: { score: true, owner: { select: { username: true, name: true, image: true } } }
          }
        },
        orderBy: { order: "asc" }
      },
      posts: {
        orderBy: { createdAt: "desc" },
        include: {
          project: { select: { title: true, slug: true } },
          _count: { select: { likes: true, comments: true, reposts: true, bookmarks: true } }
        }
      }
    }
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});

router.patch("/me", requireAuth, async (req, res) => {
  const input = z
    .object({
      name: z.string().min(2).optional(),
      bio: z.string().optional(),
      image: z.string().url().optional(),
      skills: z.array(z.string()).optional(),
      badges: z.array(z.string()).optional(),
      githubUsername: z.string().optional(),
      portfolioUrl: z.string().url().optional(),
      openToCollaborate: z.boolean().optional(),
      openToHire: z.boolean().optional()
    })
    .parse(req.body);

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      name: input.name,
      image: input.image,
      githubUsername: input.githubUsername,
      portfolioUrl: input.portfolioUrl,
      openToCollaborate: input.openToCollaborate,
      openToHire: input.openToHire,
      profile: {
        upsert: {
          create: {
            bio: input.bio,
            skills: input.skills ?? [],
            badges: input.badges ?? []
          },
          update: {
            bio: input.bio,
            skills: input.skills,
            badges: input.badges
          }
        }
      }
    },
    include: { profile: true }
  });

  res.json(user);
});

router.get("/search/developers", async (req, res) => {
  const q = String(req.query.q ?? "");
  const skill = String(req.query.skill ?? "");
  const openToHire = String(req.query.openToHire ?? "false") === "true";

  const users = await prisma.user.findMany({
    where: {
      role: "DEVELOPER",
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { username: { contains: q, mode: "insensitive" } }
            ]
          }
        : {}),
      ...(openToHire ? { openToHire: true } : {}),
      ...(skill
        ? {
            profile: {
              skills: { has: skill }
            }
          }
        : {})
    },
    include: {
      profile: true,
      ownedProjects: { include: { score: true }, take: 3 }
    },
    take: 30
  });

  res.json(users);
});

export default router;
