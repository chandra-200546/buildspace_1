import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/common/EmptyState";
import { PageTitle } from "../components/common/PageTitle";
import { getProjects } from "../services/api";
import type { Project } from "../types";

export function ExplorePage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    getProjects().then(setProjects).catch(() => setProjects([]));
  }, []);

  return (
    <div className="space-y-4">
      <PageTitle title="Explore" subtitle="Discover launches, build logs, and top-scoring projects." />

      {projects.length === 0 ? (
        <EmptyState title="No projects available" description="Seed data or publish your first project to explore." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {projects.map((project) => (
            <Link to={`/project/${project.slug}`} key={project.id} className="panel p-4 transition hover:border-accent/50">
              <p className="text-sm font-semibold">{project.title}</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted">{project.shortDescription}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="rounded-full bg-zinc-800 px-2 py-1 text-[10px] text-zinc-300">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-muted">@{project.owner.username}</span>
                <span className="text-success">Score {project.score?.overallScore ?? "--"}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
