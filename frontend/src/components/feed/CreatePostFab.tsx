import { Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../../services/api";

async function filesToDataUrls(files: FileList | null) {
  if (!files || files.length === 0) return [] as string[];
  const tasks = Array.from(files).map(
    (file) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(new Error("Failed to read media file"));
        reader.readAsDataURL(file);
      })
  );
  return Promise.all(tasks);
}

export function CreatePostFab() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [techStack, setTechStack] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [media, setMedia] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const draftKey = useMemo(() => {
    const raw = localStorage.getItem("buildspace_user");
    if (!raw) return "buildspace_post_draft_guest";
    try {
      const session = JSON.parse(raw);
      return `buildspace_post_draft_${session?.id ?? "guest"}`;
    } catch {
      return "buildspace_post_draft_guest";
    }
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(draftKey);
    if (!raw) return;
    try {
      const draft = JSON.parse(raw);
      if (draft?.text) setText(String(draft.text));
      if (draft?.projectTitle) setProjectTitle(String(draft.projectTitle));
      if (draft?.techStack) setTechStack(String(draft.techStack));
      if (draft?.hashtags) setHashtags(String(draft.hashtags));
      if (Array.isArray(draft?.media)) setMedia(draft.media.slice(0, 6));
    } catch {
      localStorage.removeItem(draftKey);
    }
  }, [draftKey]);

  useEffect(() => {
    const hasContent = text.trim() || projectTitle.trim() || techStack.trim() || hashtags.trim() || media.length > 0;
    if (!hasContent) {
      localStorage.removeItem(draftKey);
      return;
    }

    localStorage.setItem(
      draftKey,
      JSON.stringify({
        text,
        projectTitle,
        techStack,
        hashtags,
        media
      })
    );
  }, [draftKey, hashtags, media, projectTitle, techStack, text]);

  const reset = () => {
    setText("");
    setProjectTitle("");
    setTechStack("");
    setHashtags("");
    setMedia([]);
    localStorage.removeItem(draftKey);
  };

  const submit = async () => {
    if (!text.trim()) {
      setError("Post text is required.");
      return;
    }

    setLoading(true);
    setError("");
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
        media
      });
      window.dispatchEvent(new Event("buildspace:post-created"));
      setOpen(false);
      reset();
      navigate("/profile");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to create post.";
      if (message.toLowerCase().includes("login")) {
        setError("Please login first, then try posting again.");
      } else if (message.toLowerCase().includes("quota")) {
        setError("Media is too large for local storage. Try fewer/smaller files.");
      } else {
        setError(message);
      }
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
            <p className="mb-3 text-xs text-muted">Draft auto-saves locally.</p>

            <textarea
              className="input min-h-28 resize-none"
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                if (error) setError("");
              }}
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

            <div className="mt-3 space-y-2">
              <label className="block text-xs text-muted">Add media (photos/videos)</label>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className="input cursor-pointer py-2"
                onChange={async (event) => {
                  const dataUrls = await filesToDataUrls(event.target.files);
                  setMedia(dataUrls.slice(0, 6));
                  if (error) setError("");
                }}
              />
              {media.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {media.map((item, index) => (
                    <div key={`${item.slice(0, 30)}-${index}`} className="overflow-hidden rounded-lg border border-border">
                      {item.startsWith("data:video") ? (
                        <video src={item} className="h-24 w-full object-cover" muted />
                      ) : (
                        <img src={item} alt={`media-${index + 1}`} className="h-24 w-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

            <div className="mt-4 flex justify-end">
              <button onClick={submit} disabled={loading || !text.trim()} className="btn-primary disabled:opacity-70">
                {loading ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
