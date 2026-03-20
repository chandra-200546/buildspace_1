import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/common/EmptyState";
import { PageTitle } from "../components/common/PageTitle";
import { getProfile } from "../services/api";
import { useSession } from "../hooks/useSession";

export function ProfilePage() {
  const { user } = useSession();
  const username = useMemo(() => user?.username || (import.meta.env.VITE_DEFAULT_USERNAME as string), [user]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!username) return;
    getProfile(username).then(setProfile).catch(() => setProfile(null));
  }, [username]);

  if (!profile) {
    return <EmptyState title="Profile unavailable" description="Login and create profile data to view this page." />;
  }

  return (
    <div className="space-y-4">
      <PageTitle title={profile.name} subtitle={`@${profile.username}`} />

      <section className="panel p-4">
        <p className="text-sm text-zinc-200">{profile.profile?.bio}</p>
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
        <div className="mt-4">
          <Link to="/profile/edit" className="btn-secondary">Edit Profile</Link>
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
