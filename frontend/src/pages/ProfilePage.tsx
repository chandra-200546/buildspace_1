import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "../components/common/Avatar";
import { EmptyState } from "../components/common/EmptyState";
import { FeedCard } from "../components/feed/FeedCard";
import { getFeed, getProfile } from "../services/api";
import { useSession } from "../hooks/useSession";

export function ProfilePage() {
  const { user } = useSession();
  const username = useMemo(() => user?.username || "", [user]);
  const [profile, setProfile] = useState<any>(null);
  const [homePosts, setHomePosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"posts" | "home">("posts");

  async function loadProfile() {
    if (!username) return;
    const data = await getProfile(username);
    setProfile(data);
  }

  useEffect(() => {
    if (!username) return;
    loadProfile().catch(() => setProfile(null));
  }, [username]);

  useEffect(() => {
    getFeed("latest", 1, 20).then(setHomePosts).catch(() => setHomePosts([]));
  }, []);

  if (!username) {
    return <EmptyState title="Profile unavailable" description="Login to create and view your profile." />;
  }

  if (!profile) {
    return <EmptyState title="Profile unavailable" description="Create your account and profile data to view this page." />;
  }

  return (
    <div className="space-y-4">
      <section className="panel p-4">
        <div className="h-28 rounded-2xl bg-gradient-to-r from-cyan-900/40 via-zinc-900 to-emerald-900/40" />
        <div className="-mt-10 flex items-end justify-between gap-3 px-2">
          <Avatar name={profile.name} image={profile.image} size="xl" />
          <Link to="/profile/edit" className="btn-secondary">
            Edit Profile
          </Link>
        </div>
        <div className="mt-3 px-2">
          <p className="text-xl font-semibold">{profile.name}</p>
          <p className="text-sm text-muted">@{profile.username}</p>
          <p className="mt-3 text-sm text-zinc-200">{profile.profile?.bio || "No bio yet."}</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(profile.profile?.skills ?? []).map((skill: string) => (
            <span key={skill} className="rounded-full border border-border px-3 py-1 text-xs text-muted">{skill}</span>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-xl border border-border p-3">
            <p className="text-muted">Projects</p>
            <p className="mt-1 text-xl font-semibold">{profile.profile?.projectsBuiltCount ?? 0}</p>
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="text-muted">Contributions</p>
            <p className="mt-1 text-xl font-semibold">{profile.profile?.contributionCount ?? 0}</p>
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="text-muted">Streak</p>
            <p className="mt-1 text-xl font-semibold">{profile.profile?.streakDays ?? 0}</p>
          </div>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="flex border-b border-border">
          <button
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${activeTab === "posts" ? "border-b-2 border-accent text-text" : "text-muted hover:bg-zinc-900/60"}`}
            onClick={() => setActiveTab("posts")}
          >
            Posts
          </button>
          <button
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${activeTab === "home" ? "border-b-2 border-accent text-text" : "text-muted hover:bg-zinc-900/60"}`}
            onClick={() => setActiveTab("home")}
          >
            Home
          </button>
        </div>

        <div className="space-y-3 p-4">
          {activeTab === "posts" && (profile.posts ?? []).length === 0 && (
            <EmptyState title="No posts yet" description="Your posts will appear here." />
          )}
          {activeTab === "posts" && (profile.posts ?? []).map((post: any) => (
            <FeedCard key={post.id} post={post} onAction={() => loadProfile().catch(() => undefined)} />
          ))}

          {activeTab === "home" && homePosts.length === 0 && (
            <EmptyState title="No posts in home feed" description="Everyone's posts will appear here." />
          )}
          {activeTab === "home" && homePosts.map((post: any) => (
            <FeedCard key={post.id} post={post} onAction={() => getFeed("latest", 1, 20).then(setHomePosts).catch(() => undefined)} />
          ))}
        </div>
      </section>

      <section className="panel p-4">
        <h3 className="text-sm font-semibold">Pinned Projects</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {(profile.pinnedProjects ?? []).map((pinned: any) => (
            <Link key={pinned.project.id} to={`/project/${pinned.project.slug}`} className="rounded-xl border border-border p-3">
              <p className="text-sm font-medium">{pinned.project.title}</p>
              <p className="mt-1 text-xs text-muted">Score {pinned.project.score?.overallScore ?? "--"}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
