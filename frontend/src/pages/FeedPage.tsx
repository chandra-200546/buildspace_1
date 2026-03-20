import { useEffect, useState } from "react";
import { FeedCard } from "../components/feed/FeedCard";
import { PostComposer } from "../components/feed/PostComposer";
import { EmptyState } from "../components/common/EmptyState";
import { PageTitle } from "../components/common/PageTitle";
import { SegmentedControl } from "../components/common/SegmentedControl";
import { getFeed } from "../services/api";
import type { FeedFilter, Post } from "../types";

export function FeedPage() {
  const [filter, setFilter] = useState<FeedFilter>("latest");
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  async function load(reset = false) {
    setLoading(true);
    try {
      const nextPage = reset ? 1 : page;
      const data = await getFeed(filter, nextPage, 8);
      setPosts(reset ? data : [...posts, ...data]);
      setPage(nextPage + 1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(1);
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  return (
    <div className="space-y-4">
      <PageTitle title="Home Feed" subtitle="Projects, progress logs, launches, and collaboration requests." />

      <SegmentedControl
        value={filter}
        onChange={setFilter}
        items={[
          { value: "latest", label: "Latest Builds" },
          { value: "trending", label: "Trending Projects" },
          { value: "beginner", label: "Beginner Friendly" }
        ]}
      />

      <PostComposer onCreated={() => load(true)} />

      {posts.length === 0 && !loading ? (
        <EmptyState title="No posts yet" description="Start building in public and your updates will appear here." />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <FeedCard key={post.id} post={post} onAction={() => load(true)} />
          ))}
        </div>
      )}

      <div className="flex justify-center py-4">
        <button onClick={() => load()} disabled={loading} className="btn-secondary">
          {loading ? "Loading..." : "Load More"}
        </button>
      </div>
    </div>
  );
}
