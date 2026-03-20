# BuildSpace AI

Tagline: **Show your work. Build your reputation. Get opportunities.**

BuildSpace AI is a project-first social network for developers with an X-style feed focused on real projects, build logs, AI reviews, collaboration, and recruiter discovery.

## Workspace Structure

- `frontend/` - React + TypeScript + Vite + Tailwind client
- `backend/` - Express + Prisma + PostgreSQL (Neon-ready) API

## Features Included

- X-style developer feed with post composer, likes, comments, repost, bookmark
- Project model with score system (quality, innovation, complexity)
- Build-in-public timeline (project updates by day)
- Skill-based profile with badges, status flags, pinned projects
- Recruiter dashboard with talent search + shortlist
- Collaboration hub with open opportunities + request flow
- Weekly challenges and submission flow
- AI Mentor chat (mock response + DB persistence)
- AI Project Review (mock analysis + DB persistence)
- Search page (projects/users/posts)
- Notifications and bookmarks views
- Seed data for users, projects, posts, interactions, challenges, recruiter data

## Prerequisites

- Node.js 20+
- npm 10+
- A Neon PostgreSQL database URL

## 1) Backend Setup

```bash
cd backend
cp .env.example .env
```

Update `.env`:

- `DATABASE_URL` => Neon connection string
- `JWT_SECRET` => secure random string
- `CLIENT_ORIGIN` => `http://localhost:5173`

Install and prepare DB:

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run dev
```

Backend runs on `http://localhost:4000`.

## 2) Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Demo Login (after seeding)

- Developer: `alex@buildspace.ai` / `password123`
- Recruiter: `maya@talentforge.com` / `password123`

## API Modules

- `/api/auth`
- `/api/feed`
- `/api/projects`
- `/api/profiles`
- `/api/recruiter`
- `/api/collaboration`
- `/api/challenges`
- `/api/ai`
- `/api/notifications`
- `/api/meta`
- `/api/search`

## Notes

- AI features currently use mocked generators, but schema and API are ready to attach real OpenAI integrations.
- File/media upload fields are schema-ready (URL-based). You can plug UploadThing or Cloudinary into create-post/create-project flows.
- This repository follows the requested two-folder architecture (`frontend` and `backend`).
