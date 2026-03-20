import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageTitle } from "../components/common/PageTitle";
import { createProject } from "../services/api";

export function CreateProjectPage() {
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<"IDEA" | "BUILDING" | "LAUNCHED">("BUILDING");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const project = await createProject({
        title,
        shortDescription,
        fullDescription,
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        media: [],
        status,
        category: "Developer Tools",
        rolesNeeded: ["Frontend"],
        lookingForFeedback: true,
        lookingForCollaborator: true
      });
      nav(`/project/${project.slug}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <PageTitle title="Create Project" subtitle="Launch polished project cards in minutes." />
      <section className="panel space-y-3 p-4">
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project title" />
        <input
          className="input"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          placeholder="Short description"
        />
        <textarea
          className="input min-h-32"
          value={fullDescription}
          onChange={(e) => setFullDescription(e.target.value)}
          placeholder="Full description"
        />
        <input className="input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags" />
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value as "IDEA" | "BUILDING" | "LAUNCHED")}>
          <option value="IDEA">Idea</option>
          <option value="BUILDING">Building</option>
          <option value="LAUNCHED">Launched</option>
        </select>
        <button onClick={submit} disabled={loading} className="btn-primary">
          {loading ? "Creating..." : "Create Project"}
        </button>
      </section>
    </div>
  );
}
