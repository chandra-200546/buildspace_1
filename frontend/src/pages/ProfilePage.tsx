import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "../components/common/Avatar";
import { EmptyState } from "../components/common/EmptyState";
import { getProfile } from "../services/api";
import { useSession } from "../hooks/useSession";

export function ProfilePage() {
  const { user } = useSession();
  const username = useMemo(() => user?.username || "", [user]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!username) return;
    getProfile(username).then(setProfile).catch(() => setProfile(null));
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
