import { useState } from "react";
import { createPost } from "../../services/api";

type Props = {
  onCreated: () => void;
};

export function PostComposer({ onCreated }: Props) {
  const [text, setText] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [techStack, setTechStack] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await createPost({
        text,
        projectTitle,
        type: "UPDATE",
        techStack: techStack
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        hashtags: hashtags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        media: []
      });
      setText("");
      setProjectTitle("");
      setTechStack("");
      setHashtags("");
      onCreated();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel p-4">
      <h3 className="mb-3 text-sm font-semibold text-zinc-100">What are you building?</h3>
      <textarea
        className="input min-h-28 resize-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share project progress, launch, or collaboration request..."
      />
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <input
          className="input"
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          placeholder="Project title (optional)"
        />
        <input
          className="input"
          value={techStack}
          onChange={(e) => setTechStack(e.target.value)}
          placeholder="Tech stack tags (comma separated)"
        />
        <input
          className="input"
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
          placeholder="Hashtags (e.g. #react,#buildinpublic)"
        />
      </div>
      <div className="mt-3 flex justify-end">
        <button onClick={submit} disabled={loading} className="btn-primary disabled:opacity-60">
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </section>
  );
}
