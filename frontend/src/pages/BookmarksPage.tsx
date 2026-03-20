import { useEffect, useState } from "react";
import { FeedCard } from "../components/feed/FeedCard";
import { EmptyState } from "../components/common/EmptyState";
import { PageTitle } from "../components/common/PageTitle";
import { getBookmarks } from "../services/api";
import { useSession } from "../hooks/useSession";
import type { Post } from "../types";

export function BookmarksPage() {
  const { user } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    getBookmarks(user.id).then(setPosts).catch(() => setPosts([]));
  }, [user?.id]);

  return (
    <div className="space-y-4">
      <PageTitle title="Bookmarks" subtitle="Saved projects and updates for later." />
      {posts.length === 0 ? (
        <EmptyState title="No bookmarks" description="Bookmark posts from feed to curate your learning list." />
      ) : (
        posts.map((post) => <FeedCard key={post.id} post={post} onAction={() => {}} />)
      )}
    </div>
  );
}
