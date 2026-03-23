import { PrismaClient } from "@prisma/client";

const defaultLocalDatabaseUrl = "postgresql://postgres:postgres@localhost:5432/buildspace_ai?schema=public";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = defaultLocalDatabaseUrl;
  console.warn(
    "DATABASE_URL was not set. Falling back to local PostgreSQL default: postgresql://postgres:postgres@localhost:5432/buildspace_ai?schema=public"
  );
}

export const prisma = new PrismaClient();
