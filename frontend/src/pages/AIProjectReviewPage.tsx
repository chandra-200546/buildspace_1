import { useEffect, useState } from "react";
import { PageTitle } from "../components/common/PageTitle";
import { getProjects, runProjectReview } from "../services/api";
import type { AIReview, Project } from "../types";

export function AIProjectReviewPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [prompt, setPrompt] = useState("Review code quality and suggest performance improvements.");
  const [review, setReview] = useState<AIReview | null>(null);

  useEffect(() => {
    getProjects()
      .then((items) => {
        setProjects(items);
        if (items[0]) setProjectId(items[0].id);
      })
      .catch(() => setProjects([]));
  }, []);

  async function submit() {
    if (!projectId) return;
    const data = await runProjectReview(projectId, prompt);
    setReview(data);
  }

  return (
    <div className="space-y-4">
      <PageTitle title="AI Project Review" subtitle="Premium AI feedback flow, backend-ready for real LLM integration." />

      <section className="panel space-y-3 p-4">
        <select className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>{project.title}</option>
          ))}
        </select>
        <textarea className="input min-h-24" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <button className="btn-primary" onClick={submit}>Run Mock AI Review</button>
      </section>

      {review && (
        <section className="panel space-y-3 p-4">
          <p className="text-sm text-zinc-200">{review.codeQuality}</p>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Suggestions</p>
            {review.suggestions.map((item) => (
              <p key={item} className="mt-1 text-sm">- {item}</p>
            ))}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Bug Detections</p>
            {review.bugDetections.map((item) => (
              <p key={item} className="mt-1 text-sm">- {item}</p>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
