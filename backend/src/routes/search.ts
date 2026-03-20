import { Router } from "express";
import { prisma } from "../prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  const q = String(req.query.q ?? "");

  const [projects, users, posts] = await Promise.all([
    prisma.project.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { tags: { has: q.toLowerCase() } }
        ]
      },
      include: { owner: { select: { username: true, name: true, image: true } }, score: true },
      take: 20
    }),
    prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { username: { contains: q, mode: "insensitive" } }
        ]
      },
      include: { profile: true },
      take: 20
    }),
    prisma.post.findMany({
      where: { text: { contains: q, mode: "insensitive" } },
      include: {
        author: { select: { username: true, name: true, image: true } },
        _count: { select: { likes: true, comments: true, reposts: true, bookmarks: true } }
      },
      take: 20
    })
  ]);

  res.json({ projects, users, posts });
});

export default router;
