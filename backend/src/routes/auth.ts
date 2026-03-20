import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { signToken } from "../utils/jwt.js";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  username: z.string().min(3),
  role: z.enum(["DEVELOPER", "RECRUITER"]).default("DEVELOPER")
});

router.post("/register", async (req, res) => {
  const input = registerSchema.parse(req.body);
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: input.email }, { username: input.username }]
    }
  });

  if (existing) {
    return res.status(409).json({ message: "Email or username already exists" });
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name,
      username: input.username,
      role: input.role,
      profile: {
        create: {
          bio: "Building in public on BuildSpace AI",
          skills: [],
          badges: []
        }
      },
      ...(input.role === "RECRUITER"
        ? {
            recruiterProfile: {
              create: {
                company: "Stealth Startup",
                roleTitle: "Talent Partner",
                hiringFor: ["Frontend", "Backend"]
              }
            }
          }
        : {})
    }
  });

  const token = signToken({
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role
  });

  res.status(201).json({ token, user });
});

router.post("/login", async (req, res) => {
  const input = z
    .object({ email: z.string().email(), password: z.string().min(6) })
    .parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signToken({
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role
  });

  res.json({ token, user });
});

export default router;
