import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../../services/api";

export function CreatePostFab() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [techStack, setTechStack] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const reset = () => {
    setText("");
    setProjectTitle("");
    setTechStack("");
    setHashtags("");
  };

  const submit = async () => {
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
      window.dispatchEvent(new Event("buildspace:post-created"));
      setOpen(false);
      reset();
      navigate("/profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-black shadow-glow transition hover:scale-105"
        aria-label="Create post"
      >
        <Plus className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 md:items-center">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-panel p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold">Create Post</h3>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-muted hover:bg-zinc-800">
                <X className="h-4 w-4" />
              </button>
            </div>

            <textarea
              className="input min-h-28 resize-none"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="What are you building?"
            />
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <input
                className="input"
                value={projectTitle}
                onChange={(event) => setProjectTitle(event.target.value)}
                placeholder="Project title"
              />
              <input
                className="input"
                value={techStack}
                onChange={(event) => setTechStack(event.target.value)}
                placeholder="Tech stack tags"
              />
              <input
                className="input"
                value={hashtags}
                onChange={(event) => setHashtags(event.target.value)}
                placeholder="Hashtags (#react,#ai)"
              />
            </div>

            <div className="mt-4 flex justify-end">
              <button onClick={submit} disabled={loading} className="btn-primary disabled:opacity-70">
                {loading ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

