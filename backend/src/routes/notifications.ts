import { Router } from "express";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  res.json(notifications);
});

router.patch("/:id/read", requireAuth, async (req, res) => {
  const notification = await prisma.notification.update({
    where: { id: req.params.id },
    data: { isRead: true }
  });

  res.json(notification);
});

export default router;
