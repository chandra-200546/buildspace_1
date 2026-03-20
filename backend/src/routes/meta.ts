import { Router } from "express";
import { prisma } from "../prisma.js";

const router = Router();

router.get("/right-rail", async (_req, res) => {
  const [trendingTags, suggestedDevelopers, featuredProjects, activeChallenges] = await Promise.all([
    prisma.tag.findMany({ orderBy: { usage: "desc" }, take: 8 }),
    prisma.user.findMany({
      where: { role: "DEVELOPER" },
      select: { id: true, username: true, name: true, image: true, profile: { select: { skills: true } } },
      take: 5
    }),
    prisma.project.findMany({ include: { score: true, owner: { select: { username: true, name: true } } }, take: 4 }),
    prisma.challenge.findMany({ where: { isActive: true }, take: 4, orderBy: { deadline: "asc" } })
  ]);

  res.json({ trendingTags, suggestedDevelopers, featuredProjects, activeChallenges });
});

router.get("/bookmarks", async (req, res) => {
  const userId = String(req.query.userId ?? "");
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    include: {
      post: {
        include: {
          author: { select: { id: true, username: true, name: true, image: true } },
          _count: { select: { likes: true, comments: true, reposts: true, bookmarks: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  res.json(bookmarks.map((bookmark: any) => bookmark.post));
});

export default router;
