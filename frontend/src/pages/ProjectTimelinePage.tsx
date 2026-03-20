import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { EmptyState } from "../components/common/EmptyState";
import { PageTitle } from "../components/common/PageTitle";
import api, { createProjectUpdate } from "../services/api";
import type { ProjectUpdate } from "../types";

export function ProjectTimelinePage() {
  const { projectId = "" } = useParams();
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [dayLabel, setDayLabel] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function load() {
    const { data } = await api.get<ProjectUpdate[]>(`/api/projects/${projectId}/timeline`);
    setUpdates(data);
  }

  useEffect(() => {
    if (projectId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function submit() {
    await createProjectUpdate(projectId, { dayLabel, title, description, media: [] });
    setDescription("");
    load();
  }

  return (
    <div className="space-y-4">
      <PageTitle title="Build in Public Timeline" subtitle="Group daily progress under one project journey." />
      <section className="panel grid gap-3 p-4 md:grid-cols-3">
        <input className="input" value={dayLabel} onChange={(e) => setDayLabel(e.target.value)} />
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button className="btn-primary" onClick={submit}>Add Progress Update</button>
        <textarea
          className="input md:col-span-3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What did you ship today?"
        />
      </section>

      {updates.length === 0 ? (
        <EmptyState title="No updates yet" description="Add your first build log entry." />
      ) : (
        <section className="space-y-3">
          {updates.map((update) => (
            <article key={update.id} className="panel p-4">
              <p className="text-xs text-accent">{update.dayLabel}</p>
              <p className="text-sm font-semibold">{update.title}</p>
              <p className="mt-1 text-sm text-muted">{update.description}</p>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
