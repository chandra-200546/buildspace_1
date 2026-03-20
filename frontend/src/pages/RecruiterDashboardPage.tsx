import { useEffect, useState } from "react";
import { PageTitle } from "../components/common/PageTitle";
import { getRecruiterDashboard, searchTalent, shortlistTalent } from "../services/api";

export function RecruiterDashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [skill, setSkill] = useState("");
  const [openToHire, setOpenToHire] = useState(false);

  useEffect(() => {
    getRecruiterDashboard().then(setDashboard).catch(() => setDashboard(null));
  }, []);

  async function runSearch() {
    const users = await searchTalent({ skill, openToHire });
    setResults(users);
  }

  async function saveTalent(userId: string) {
    await shortlistTalent(userId);
    setDashboard(await getRecruiterDashboard());
  }

  return (
    <div className="space-y-4">
      <PageTitle title="Recruiter Dashboard" subtitle="Search talent by skills, project stack, and hire readiness." />

      <section className="panel flex flex-wrap items-center gap-3 p-4">
        <input className="input max-w-sm" value={skill} onChange={(e) => setSkill(e.target.value)} placeholder="Skill" />
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={openToHire} onChange={(e) => setOpenToHire(e.target.checked)} /> Open to hire only
        </label>
        <button className="btn-primary" onClick={runSearch}>Search Developers</button>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        {results.map((user) => (
          <article key={user.id} className="panel p-4">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-xs text-muted">@{user.username}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(user.profile?.skills ?? []).slice(0, 5).map((entry: string) => (
                <span key={entry} className="rounded-full border border-border px-2 py-1 text-[10px] text-muted">{entry}</span>
              ))}
            </div>
            <button className="btn-secondary mt-3" onClick={() => saveTalent(user.id)}>Shortlist</button>
          </article>
        ))}
      </section>

      <section className="panel p-4">
        <h3 className="text-sm font-semibold">Saved Talent</h3>
        <div className="mt-3 space-y-2 text-sm text-muted">
          {(dashboard?.savedTalent ?? []).map((item: any) => (
            <p key={item.id}>@{item.user.username} - {item.note}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
