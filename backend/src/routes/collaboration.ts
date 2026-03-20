import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/opportunities", async (_req, res) => {
  const projects = await prisma.project.findMany({
    where: { lookingForCollaborator: true },
    include: {
      owner: { select: { id: true, username: true, name: true, image: true } },
      score: true
    },
    orderBy: { updatedAt: "desc" }
  });

  res.json(projects);
});

router.post("/request", requireAuth, async (req, res) => {
  const input = z
    .object({
      projectId: z.string(),
      recipientId: z.string(),
      roleNeeded: z.string().min(2),
      message: z.string().min(5)
    })
    .parse(req.body);

  const request = await prisma.collaborationRequest.create({
    data: {
      ...input,
      requesterId: req.user!.id
    }
  });

  await prisma.notification.create({
    data: {
      userId: input.recipientId,
      type: "COLLAB",
      title: "New collaboration request",
      message: `${req.user!.username} invited you to collaborate as ${input.roleNeeded}.`
    }
  });

  res.status(201).json(request);
});

router.patch("/request/:id", requireAuth, async (req, res) => {
  const input = z.object({ status: z.enum(["OPEN", "ACCEPTED", "REJECTED"]) }).parse(req.body);
  const request = await prisma.collaborationRequest.update({
    where: { id: req.params.id },
    data: { status: input.status }
  });

  if (input.status === "ACCEPTED") {
    await prisma.project.update({
      where: { id: request.projectId },
      data: { contributors: { connect: { id: request.recipientId } } }
    });
  }

  res.json(request);
});

router.get("/my-requests", requireAuth, async (req, res) => {
  const requests = await prisma.collaborationRequest.findMany({
    where: {
      OR: [{ requesterId: req.user!.id }, { recipientId: req.user!.id }]
    },
    include: {
      project: { select: { id: true, title: true, slug: true } },
      requester: { select: { id: true, username: true, name: true } },
      recipient: { select: { id: true, username: true, name: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  res.json(requests);
});

export default router;
