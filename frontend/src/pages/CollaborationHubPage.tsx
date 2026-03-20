import { useEffect, useState } from "react";
import { PageTitle } from "../components/common/PageTitle";
import { getCollabOpportunities, getMyCollabRequests, sendCollabRequest } from "../services/api";
import type { Project } from "../types";

export function CollaborationHubPage() {
  const [opportunities, setOpportunities] = useState<Project[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

  async function load() {
    const [projects, myRequests] = await Promise.all([getCollabOpportunities(), getMyCollabRequests()]);
    setOpportunities(projects);
    setRequests(myRequests);
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  async function apply(project: Project) {
    await sendCollabRequest({
      projectId: project.id,
      recipientId: project.owner.id,
      roleNeeded: project.rolesNeeded[0] || "Frontend",
      message: `Interested in collaborating on ${project.title}`
    });
    load();
  }

  return (
    <div className="space-y-4">
      <PageTitle title="Collaboration Hub" subtitle="Find projects looking for teammates and apply instantly." />

      <section className="grid gap-3 md:grid-cols-2">
        {opportunities.map((project) => (
          <article key={project.id} className="panel p-4">
            <p className="text-sm font-semibold">{project.title}</p>
            <p className="mt-1 text-xs text-muted">{project.shortDescription}</p>
            <p className="mt-2 text-xs text-accent">Roles: {project.rolesNeeded.join(", ") || "Open"}</p>
            <button className="btn-secondary mt-3" onClick={() => apply(project)}>Apply / Request</button>
          </article>
        ))}
      </section>

      <section className="panel p-4">
        <h3 className="text-sm font-semibold">My Collaboration Requests</h3>
        <div className="mt-3 space-y-2 text-sm text-muted">
          {requests.map((item) => (
            <p key={item.id}>
              {item.requester.username} ? {item.recipient.username} on {item.project.title} ({item.status})
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
