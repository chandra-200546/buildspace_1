import { Bookmark, ExternalLink, GitFork, Heart, MessageCircle } from "lucide-react";
import type { Post } from "../../types";
import { bookmarkPost, likePost, repostPost } from "../../services/api";

type Props = {
  post: Post;
  onAction: () => void;
};

export function FeedCard({ post, onAction }: Props) {
  const action = async (fn: () => Promise<void>) => {
    await fn();
    onAction();
  };

  return (
    <article className="panel p-4 transition hover:border-zinc-700">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">{post.author.name}</p>
          <p className="text-xs text-muted">@{post.author.username}</p>
        </div>
        <span className="rounded-full border border-border px-2 py-1 text-[10px] uppercase tracking-wide text-accent">
          {post.type.replace("_", " ")}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-zinc-200">{post.text}</p>

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

      <div className="mt-4 flex items-center gap-4 text-xs text-muted">
        <button className="flex items-center gap-1 hover:text-red-300" onClick={() => action(() => likePost(post.id))}>
          <Heart className="h-4 w-4" /> {post._count.likes}
        </button>
        <span className="flex items-center gap-1">
          <MessageCircle className="h-4 w-4" /> {post._count.comments}
        </span>
        <button className="flex items-center gap-1 hover:text-cyan-300" onClick={() => action(() => repostPost(post.id))}>
          <GitFork className="h-4 w-4" /> {post._count.reposts}
        </button>
        <button className="flex items-center gap-1 hover:text-amber-300" onClick={() => action(() => bookmarkPost(post.id))}>
          <Bookmark className="h-4 w-4" /> {post._count.bookmarks}
        </button>
        {(post.githubUrl || post.liveDemoUrl) && <ExternalLink className="ml-auto h-4 w-4" />}
      </div>
    </article>
  );
}
