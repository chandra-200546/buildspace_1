import { useEffect, useState } from "react";
import { PageTitle } from "../components/common/PageTitle";
import { getCollabOpportunities, getMyCollabRequests, sendCollabRequest } from "../services/api";
import type { Project } from "../types";

const BUILD_TOGETHER_ROLES = ["Frontend Partner", "Backend Partner", "AI Engineer", "UI Designer"] as const;

export function CollaborationHubPage() {
  const [opportunities, setOpportunities] = useState<Project[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [sendingRole, setSendingRole] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");

  async function load() {
    const [projects, myRequests] = await Promise.all([getCollabOpportunities(), getMyCollabRequests()]);
    setOpportunities(projects);
    setRequests(myRequests);
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  async function apply(project: Project, roleNeeded: string) {
    setSendingRole(`${project.id}:${roleNeeded}`);
    setStatusMessage("");
    await sendCollabRequest({
      projectId: project.id,
      recipientId: project.owner.id,
      roleNeeded,
      message: `Interested in collaborating on ${project.title} as ${roleNeeded}.`
    });
    setStatusMessage(`Build Together request sent for ${roleNeeded}.`);
    setExpandedProjectId(null);
    setSendingRole("");
    load();
  }

  return (
    <div className="space-y-4">
      <PageTitle title="Collaboration Hub" subtitle="Find projects looking for teammates and apply instantly." />
      <section className="panel p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Build Together</p>
            <p className="mt-1 text-xs text-muted">Anyone can instantly request: Frontend Partner, Backend Partner, AI Engineer, UI Designer.</p>
          </div>
          <span className="rounded-full border border-cyan-700/50 bg-cyan-900/20 px-3 py-1 text-xs text-cyan-300">Instant Collaboration</span>
        </div>
        {statusMessage && <p className="mt-3 text-xs text-emerald-300">{statusMessage}</p>}
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        {opportunities.map((project) => (
          <article key={project.id} className="panel p-4">
            <p className="text-sm font-semibold">{project.title}</p>
            <p className="mt-1 text-xs text-muted">{project.shortDescription}</p>
            <p className="mt-2 text-xs text-accent">Roles: {project.rolesNeeded.join(", ") || "Open"}</p>
            <button
              className="btn-secondary mt-3"
              onClick={() => setExpandedProjectId((value) => (value === project.id ? null : project.id))}
            >
              Build Together
            </button>
            {expandedProjectId === project.id && (
              <div className="mt-3 space-y-2 rounded-xl border border-border/80 bg-zinc-950/40 p-3">
                <p className="text-xs text-muted">Choose role you want to join as:</p>
                <div className="flex flex-wrap gap-2">
                  {BUILD_TOGETHER_ROLES.map((role) => {
                    const isSending = sendingRole === `${project.id}:${role}`;
                    return (
                      <button
                        key={role}
                        className="rounded-full border border-border px-3 py-1 text-xs text-zinc-200 transition hover:bg-zinc-900 disabled:opacity-60"
                        onClick={() => apply(project, role)}
                        disabled={Boolean(sendingRole)}
                      >
                        {isSending ? "Sending..." : role}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </article>
        ))}
      </section>

      <section className="panel p-4">
        <h3 className="text-sm font-semibold">My Collaboration Requests</h3>
        <div className="mt-3 space-y-2 text-sm text-muted">
          {requests.map((item) => (
            <p key={item.id}>
              @{item.requester.username} {"->"} @{item.recipient.username} on {item.project.title} as {item.roleNeeded} ({item.status})
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
