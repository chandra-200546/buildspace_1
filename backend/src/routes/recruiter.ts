import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/dashboard", requireAuth, async (req, res) => {
  if (req.user!.role !== "RECRUITER" && req.user!.role !== "ADMIN") {
    return res.status(403).json({ message: "Recruiter access required" });
  }

  const recruiter = await prisma.recruiterProfile.findUnique({
    where: { userId: req.user!.id },
    include: {
      user: { include: { profile: true } },
      savedTalent: {
        include: {
          user: {
            include: { profile: true, ownedProjects: { include: { score: true }, take: 3 } }
          }
        }
      }
    }
  });

  res.json(recruiter);
});

router.get("/search", requireAuth, async (req, res) => {
  const skill = String(req.query.skill ?? "");
  const tag = String(req.query.tag ?? "");
  const category = String(req.query.category ?? "");
  const openToHire = String(req.query.openToHire ?? "false") === "true";

  const users = await prisma.user.findMany({
    where: {
      role: "DEVELOPER",
      ...(openToHire ? { openToHire: true } : {}),
      ...(skill ? { profile: { skills: { has: skill } } } : {}),
      ...(tag || category
        ? {
            ownedProjects: {
              some: {
                ...(tag ? { tags: { has: tag } } : {}),
                ...(category ? { category: { equals: category, mode: "insensitive" } } : {})
              }
            }
          }
        : {})
    },
    include: {
      profile: true,
      ownedProjects: { include: { score: true }, take: 5 }
    },
    take: 40
  });

  res.json(users);
});

router.post("/shortlist", requireAuth, async (req, res) => {
  const input = z.object({ userId: z.string(), note: z.string().optional() }).parse(req.body);

  const recruiter = await prisma.recruiterProfile.findUnique({ where: { userId: req.user!.id } });
  if (!recruiter) {
    return res.status(404).json({ message: "Recruiter profile not found" });
  }

  const shortlist = await prisma.shortlist.upsert({
    where: {
      recruiterProfileId_userId: {
        recruiterProfileId: recruiter.id,
        userId: input.userId
      }
    },
    create: {
      recruiterProfileId: recruiter.id,
      userId: input.userId,
      note: input.note
    },
    update: { note: input.note }
  });

  res.status(201).json(shortlist);
});

export default router;
