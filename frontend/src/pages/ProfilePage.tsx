import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Avatar } from "../components/common/Avatar";
import { EmptyState } from "../components/common/EmptyState";
import { FeedCard } from "../components/feed/FeedCard";
import { followUser, getFeed, getProfile, unfollowUser, updateProfile } from "../services/api";
import { useSession } from "../hooks/useSession";

export function ProfilePage() {
  const { user } = useSession();
  const params = useParams();
  const username = useMemo(() => params.username || user?.username || "", [params.username, user?.username]);
  const [profile, setProfile] = useState<any>(null);
  const [homePosts, setHomePosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"posts" | "home">("posts");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const isOwnProfile = Boolean(user?.id && profile?.id && user.id === profile.id);

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("Failed to read image"));
      reader.readAsDataURL(file);
    });

  async function loadProfile() {
    if (!username) return;
    const data = await getProfile(username);
    setProfile(data);
  }

  async function refreshHomeFeed() {
    const items = await getFeed("latest", 1, 20);
    setHomePosts(items);
  }

  useEffect(() => {
    if (!username) return;
    loadProfile().catch(() => setProfile(null));
  }, [username]);

  useEffect(() => {
    refreshHomeFeed().catch(() => setHomePosts([]));
  }, []);

  useEffect(() => {
    const handlePostCreated = () => {
      loadProfile().catch(() => undefined);
      refreshHomeFeed().catch(() => undefined);
    };

    window.addEventListener("buildspace:post-created", handlePostCreated);
    return () => window.removeEventListener("buildspace:post-created", handlePostCreated);
  }, [username]);

  if (!username) {
    return <EmptyState title="Profile unavailable" description="Login to create and view your profile." />;
  }

  if (!profile) {
    return <EmptyState title="Profile unavailable" description="Create your account and profile data to view this page." />;
  }

  return (
    <div className="space-y-4">
      <section className="panel p-4">
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setUploadingCover(true);
            try {
              const coverImage = await fileToDataUrl(file);
              await updateProfile({ coverImage });
              await loadProfile();
            } finally {
              setUploadingCover(false);
              event.target.value = "";
            }
          }}
        />
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setUploadingAvatar(true);
            try {
              const image = await fileToDataUrl(file);
              await updateProfile({ image });
              await loadProfile();
            } finally {
              setUploadingAvatar(false);
              event.target.value = "";
            }
          }}
        />
        <button
          className="group relative block h-28 w-full overflow-hidden rounded-2xl border border-border"
          onClick={() => {
            if (isOwnProfile) coverInputRef.current?.click();
          }}
          type="button"
        >
          {profile.coverImage ? (
            <img src={profile.coverImage} alt="Profile cover" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-cyan-900/40 via-zinc-900 to-emerald-900/40" />
          )}
          {isOwnProfile && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-xs text-white opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
              {uploadingCover ? "Updating cover..." : "Click to edit cover"}
            </span>
          )}
        </button>
        <div className="-mt-10 flex items-end justify-between gap-3 px-2">
          <button
            className="group relative rounded-full"
            onClick={() => {
              if (isOwnProfile) avatarInputRef.current?.click();
            }}
            type="button"
          >
            <Avatar name={profile.name} image={profile.image} size="xl" />
            {isOwnProfile && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-[10px] text-white opacity-0 transition group-hover:bg-black/45 group-hover:opacity-100">
                {uploadingAvatar ? "Updating..." : "Edit"}
              </span>
            )}
          </button>
          {isOwnProfile ? (
            <Link to="/profile/edit" className="btn-secondary">
              Edit Profile
            </Link>
          ) : (
            <button
              className={`btn-secondary ${profile.viewerFollowing ? "border-emerald-500/60 text-emerald-300" : ""}`}
              onClick={async () => {
                setFollowLoading(true);
                try {
                  if (profile.viewerFollowing) {
                    await unfollowUser(profile.id);
                  } else {
                    await followUser(profile.id);
                  }
                  await loadProfile();
                } finally {
                  setFollowLoading(false);
                }
              }}
              disabled={followLoading}
            >
              {followLoading
                ? "Please wait..."
                : profile.viewerFollowing
                  ? "Following"
                  : profile.followsViewer
                    ? "Follow back"
                    : "Follow"}
            </button>
          )}
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
        <div className="mt-3 flex items-center gap-5 px-2 text-sm">
          <p><span className="font-semibold">{profile.followingCount ?? 0}</span> <span className="text-muted">Following</span></p>
          <p><span className="font-semibold">{profile.followerCount ?? 0}</span> <span className="text-muted">Followers</span></p>
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
            <FeedCard key={post.id} post={post} onAction={() => refreshHomeFeed().catch(() => undefined)} />
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
