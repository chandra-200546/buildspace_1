import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/", async (_req, res) => {
  const challenges = await prisma.challenge.findMany({
    include: {
      submissions: {
        include: {
          project: { select: { id: true, title: true, slug: true } },
          user: { select: { id: true, username: true, name: true, image: true } }
        }
      }
    },
    orderBy: { deadline: "asc" }
  });

  res.json(challenges);
});

router.post("/", requireAuth, async (req, res) => {
  const input = z
    .object({
      title: z.string().min(3),
      description: z.string().min(10),
      category: z.string().min(2),
      deadline: z.string(),
      badge: z.string().min(2),
      reward: z.string().min(2)
    })
    .parse(req.body);

  const challenge = await prisma.challenge.create({
    data: {
      ...input,
      deadline: new Date(input.deadline)
    }
  });

  res.status(201).json(challenge);
});

router.post("/:challengeId/submit", requireAuth, async (req, res) => {
  const input = z.object({ projectId: z.string(), note: z.string().optional() }).parse(req.body);

  const submission = await prisma.challengeSubmission.create({
    data: {
      challengeId: req.params.challengeId,
      projectId: input.projectId,
      userId: req.user!.id,
      note: input.note
    }
  });

  res.status(201).json(submission);
});

router.patch("/submission/:submissionId/winner", requireAuth, async (req, res) => {
  const submission = await prisma.challengeSubmission.update({
    where: { id: req.params.submissionId },
    data: { isWinner: true },
    include: { user: true, challenge: true }
  });

  await prisma.notification.create({
    data: {
      userId: submission.userId,
      type: "CHALLENGE",
      title: "Challenge Winner",
      message: `You won ${submission.challenge.title}.`
    }
  });

  res.json(submission);
});

export default router;
