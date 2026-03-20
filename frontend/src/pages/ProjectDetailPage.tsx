import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { EmptyState } from "../components/common/EmptyState";
import { PageTitle } from "../components/common/PageTitle";
import { getProject } from "../services/api";
import type { AIReview, Post, Project } from "../types";

type ProjectDetail = Project & { posts: Post[]; aiReviews: AIReview[] };

export function ProjectDetailPage() {
  const { slug = "" } = useParams();
  const [project, setProject] = useState<ProjectDetail | null>(null);

  useEffect(() => {
    getProject(slug).then(setProject).catch(() => setProject(null));
  }, [slug]);

  if (!project) {
    return <EmptyState title="Project not found" description="This project may have been removed." />;
  }

  return (
    <div className="space-y-4">
      <PageTitle title={project.title} subtitle={project.shortDescription} />

      <section className="panel p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs text-muted">Quality</p>
            <p className="text-xl font-semibold">{project.score?.qualityScore ?? "--"}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Innovation</p>
            <p className="text-xl font-semibold">{project.score?.innovationScore ?? "--"}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Complexity</p>
            <p className="text-xl font-semibold">{project.score?.complexityScore ?? "--"}</p>
          </div>
        </div>

        <p className="mt-4 text-sm text-zinc-300">{project.fullDescription}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-border px-3 py-1 text-xs text-muted">#{tag}</span>
          ))}
        </div>

        <div className="mt-4 flex gap-3">
          <Link to={`/timeline/${project.id}`} className="btn-secondary">View Build Timeline</Link>
          <Link to="/ai-review" className="btn-primary">Run AI Review</Link>
        </div>
      </section>

      <section className="panel p-4">
        <h3 className="text-sm font-semibold">Build Updates</h3>
        <div className="mt-3 space-y-3">
          {project.updates?.map((update) => (
            <div key={update.id} className="rounded-xl border border-border p-3">
              <p className="text-xs text-accent">{update.dayLabel}</p>
              <p className="text-sm font-medium">{update.title}</p>
              <p className="mt-1 text-xs text-muted">{update.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel p-4">
        <h3 className="text-sm font-semibold">AI Reviews</h3>
        <div className="mt-3 space-y-3">
          {project.aiReviews?.map((review) => (
            <div key={review.id} className="rounded-xl border border-border p-3">
              <p className="text-xs text-muted">{review.prompt}</p>
              <p className="mt-2 text-sm text-zinc-200">{review.codeQuality}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
