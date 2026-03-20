import { useEffect, useRef, useState } from "react";
import { Bookmark, Bot, ExternalLink, Eye, GitFork, Heart, MessageCircle, ThumbsDown } from "lucide-react";
import type { Post } from "../../types";
import { addCommentToPost, bookmarkPost, dislikePost, likePost, registerPostView, repostPost, runPostAiReview } from "../../services/api";
import { Avatar } from "../common/Avatar";

type Props = {
  post: Post;
  onAction: () => void;
};

function isVideoMedia(value: string) {
  if (value.startsWith("data:video")) return true;
  return /\.(mp4|webm|ogg|mov)$/i.test(value);
}

export function FeedCard({ post, onAction }: Props) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [viewCount, setViewCount] = useState(post.views ?? post._count.views ?? 0);
  const [aiLoading, setAiLoading] = useState(false);
  const countedViewRef = useRef(false);

  useEffect(() => {
    if (countedViewRef.current) return;
    countedViewRef.current = true;
    registerPostView(post.id)
      .then(() => setViewCount((value) => value + 1))
      .catch(() => undefined);
  }, [post.id]);

  const action = async (fn: () => Promise<void>) => {
    await fn();
    onAction();
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    await addCommentToPost(post.id, commentText.trim());
    setCommentText("");
    onAction();
  };

  const runAiReview = async () => {
    setAiLoading(true);
    try {
      await runPostAiReview(post.id);
      onAction();
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <article className="panel p-4 transition hover:border-zinc-700">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <Avatar name={post.author.name} image={post.author.image} size="md" />
          <div>
            <p className="text-sm font-semibold">{post.author.name}</p>
            <p className="text-xs text-muted">@{post.author.username}</p>
          </div>
        </div>
        <span className="rounded-full border border-border px-2 py-1 text-[10px] uppercase tracking-wide text-accent">
          {post.type.replace("_", " ")}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-zinc-200">{post.text}</p>

      {Boolean(post.media?.length) && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {(post.media ?? []).slice(0, 4).map((item, index) => (
            <div key={`${item.slice(0, 30)}-${index}`} className="overflow-hidden rounded-xl border border-border bg-zinc-900/70">
              {isVideoMedia(item) ? (
                <video src={item} controls className="h-52 w-full object-cover" />
              ) : (
                <img src={item} alt={`post-media-${index + 1}`} className="h-52 w-full object-cover" />
              )}
            </div>
          ))}
        </div>
      )}

      {Boolean(post.hashtags?.length) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {(post.hashtags ?? []).slice(0, 6).map((tag) => (
            <span key={tag} className="rounded-full border border-cyan-800/50 bg-cyan-900/20 px-2 py-1 text-[10px] text-cyan-300">
              {tag}
            </span>
          ))}
        </div>
      )}

      {typeof post.matchedAudienceCount === "number" && post.matchedAudienceCount > 0 && (
        <p className="mt-2 text-xs text-emerald-300">
          Reach potential: {post.matchedAudienceCount} matching developers
          {post.matchedAudienceUsernames?.length ? ` (e.g. ${post.matchedAudienceUsernames.map((u) => `@${u}`).join(", ")})` : ""}
        </p>
      )}

      {post.project && (
        <div className="mt-3 rounded-xl border border-border bg-zinc-950/60 p-3">
          <p className="text-sm font-medium">{post.project.title}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {post.project.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-full bg-zinc-800 px-2 py-1 text-[10px] text-zinc-300">
                #{tag}
              </span>
            ))}
          </div>
          {post.project.score && (
            <p className="mt-2 text-xs text-success">Project Score: {post.project.score.overallScore}/100</p>
          )}
        </div>
      )}

      {(typeof post.aiScore === "number" || post.aiReview) && (
        <div className="mt-3 rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">AI Review</p>
            {typeof post.aiScore === "number" && <p className="text-xs text-emerald-200">AI Score: {post.aiScore}/100</p>}
          </div>
          {post.aiReview && <p className="mt-2 text-xs text-emerald-100">{post.aiReview}</p>}
        </div>
      )}

      <div className="mt-4 flex items-center gap-4 text-xs text-muted">
        <button className="flex items-center gap-1 hover:text-red-300" onClick={() => action(() => likePost(post.id))}>
          <Heart className="h-4 w-4" /> {post._count.likes}
        </button>
        <button className="flex items-center gap-1 hover:text-rose-200" onClick={() => action(() => dislikePost(post.id))}>
          <ThumbsDown className="h-4 w-4" /> {post._count.dislikes ?? 0}
        </button>
        <button className="flex items-center gap-1 hover:text-zinc-100" onClick={() => setShowComments((value) => !value)}>
          <MessageCircle className="h-4 w-4" /> {post._count.comments}
        </button>
        <button className="flex items-center gap-1 hover:text-cyan-300" onClick={() => action(() => repostPost(post.id))}>
          <GitFork className="h-4 w-4" /> {post._count.reposts}
        </button>
        <button className="flex items-center gap-1 hover:text-amber-300" onClick={() => action(() => bookmarkPost(post.id))}>
          <Bookmark className="h-4 w-4" /> {post._count.bookmarks}
        </button>
        <span className="flex items-center gap-1">
          <Eye className="h-4 w-4" /> {viewCount}
        </span>
        <button className="ml-auto flex items-center gap-1 hover:text-emerald-300" onClick={runAiReview} disabled={aiLoading}>
          <Bot className="h-4 w-4" /> {aiLoading ? "Reviewing..." : "AI Review"}
        </button>
        {(post.githubUrl || post.liveDemoUrl) && <ExternalLink className="h-4 w-4" />}
      </div>

      {showComments && (
        <div className="mt-4 space-y-3 rounded-xl border border-border/80 bg-zinc-950/50 p-3">
          <div className="space-y-2">
            {(post.comments ?? []).length === 0 && <p className="text-xs text-muted">No comments yet.</p>}
            {(post.comments ?? []).map((comment) => (
              <div key={comment.id} className="rounded-lg border border-border/70 p-2">
                <p className="text-xs text-zinc-200">
                  <span className="font-semibold">{comment.author.name}</span> <span className="text-muted">@{comment.author.username}</span>
                </p>
                <p className="mt-1 text-xs text-zinc-300">{comment.text}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="input h-9 py-1"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
            />
            <button className="btn-secondary" onClick={submitComment}>
              Comment
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
