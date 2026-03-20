import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "Missing DATABASE_URL. Create backend/.env from backend/.env.example and set your Neon/PostgreSQL connection string."
  );
}

export const prisma = new PrismaClient();
