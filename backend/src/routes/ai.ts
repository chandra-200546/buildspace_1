import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { generateMockAIReview, generateMockMentorResponse } from "../services/ai.js";

const router = Router();

router.post("/project-review", requireAuth, async (req, res) => {
  const input = z.object({ projectId: z.string(), prompt: z.string().min(5) }).parse(req.body);
  const mock = generateMockAIReview(input.prompt);

  const review = await prisma.aIReview.create({
    data: {
      projectId: input.projectId,
      prompt: input.prompt,
      ...mock
    }
  });

  res.status(201).json(review);
});

router.get("/project-review/:projectId", requireAuth, async (req, res) => {
  const reviews = await prisma.aIReview.findMany({
    where: { projectId: req.params.projectId },
    orderBy: { createdAt: "desc" }
  });

  res.json(reviews);
});

router.post("/mentor", requireAuth, async (req, res) => {
  const input = z.object({ prompt: z.string().min(5) }).parse(req.body);
  const response = generateMockMentorResponse(input.prompt);

  const chat = await prisma.aIMentorChat.create({
    data: {
      userId: req.user!.id,
      prompt: input.prompt,
      response
    }
  });

  res.status(201).json(chat);
});

router.get("/mentor", requireAuth, async (req, res) => {
  const chats = await prisma.aIMentorChat.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" }
  });

  res.json(chats);
});

export default router;
