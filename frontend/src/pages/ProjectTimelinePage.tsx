import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { EmptyState } from "../components/common/EmptyState";
import { PageTitle } from "../components/common/PageTitle";
import { createProjectUpdate, getProjectTimeline } from "../services/api";
import type { ProjectUpdate } from "../types";

export function ProjectTimelinePage() {
  const { projectId = "" } = useParams();
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [dayLabel, setDayLabel] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const data = await getProjectTimeline(projectId);
    setUpdates(data);
  }

  useEffect(() => {
    if (projectId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function submit() {
    if (!dayLabel.trim() || !title.trim() || !description.trim()) {
      setError("Day label, title, and description are required.");
      return;
    }
    await createProjectUpdate(projectId, { dayLabel, title, description, media: [] });
    setDayLabel("");
    setTitle("");
    setDescription("");
    setError("");
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
        {error && <p className="text-xs text-red-400 md:col-span-3">{error}</p>}
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
