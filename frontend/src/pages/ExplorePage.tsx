import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/common/EmptyState";
import { PageTitle } from "../components/common/PageTitle";
import { getProjects, sendCollabRequest } from "../services/api";
import type { Project } from "../types";

const BUILD_TOGETHER_ROLES = ["Frontend Partner", "Backend Partner", "AI Engineer", "UI Designer"] as const;

export function ExplorePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [sendingRole, setSendingRole] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    getProjects().then(setProjects).catch(() => setProjects([]));
  }, []);

  const sessionUser = (() => {
    const raw = localStorage.getItem("buildspace_user");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as { id: string };
    } catch {
      return null;
    }
  })();

  async function requestBuildTogether(project: Project, roleNeeded: string) {
    setSendingRole(`${project.id}:${roleNeeded}`);
    setStatusMessage("");
    try {
      await sendCollabRequest({
        projectId: project.id,
        recipientId: project.owner.id,
        roleNeeded,
        message: `Build Together request: ${roleNeeded} for ${project.title}`
      });
      setStatusMessage(`Request sent to @${project.owner.username} for ${roleNeeded}.`);
      setExpandedProjectId(null);
    } finally {
      setSendingRole("");
    }
  }

  return (
    <div className="space-y-4">
      <PageTitle title="Explore" subtitle="Discover launches, build logs, and top-scoring projects." />
      {statusMessage && (
        <div className="rounded-xl border border-emerald-700/50 bg-emerald-900/20 px-3 py-2 text-xs text-emerald-300">
          {statusMessage}
        </div>
      )}

      {projects.length === 0 ? (
        <EmptyState title="No projects available" description="Seed data or publish your first project to explore." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {projects.map((project) => (
            <article key={project.id} className="panel p-4 transition hover:border-accent/50">
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
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to={`/project/${project.slug}`} className="btn-secondary">
                  View Project
                </Link>
                <button
                  className="btn-secondary"
                  onClick={() => setExpandedProjectId((value) => (value === project.id ? null : project.id))}
                  disabled={!sessionUser || sessionUser.id === project.owner.id}
                >
                  Build Together
                </button>
              </div>
              {expandedProjectId === project.id && (
                <div className="mt-3 rounded-xl border border-border/80 bg-zinc-950/40 p-3">
                  {!sessionUser ? (
                    <p className="text-xs text-red-300">Login to send Build Together requests.</p>
                  ) : sessionUser.id === project.owner.id ? (
                    <p className="text-xs text-muted">You are the owner of this project.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {BUILD_TOGETHER_ROLES.map((role) => {
                        const isSending = sendingRole === `${project.id}:${role}`;
                        return (
                          <button
                            key={role}
                            className="rounded-full border border-border px-3 py-1 text-xs text-zinc-200 transition hover:bg-zinc-900 disabled:opacity-60"
                            onClick={() => requestBuildTogether(project, role)}
                            disabled={Boolean(sendingRole)}
                          >
                            {isSending ? "Sending..." : role}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
