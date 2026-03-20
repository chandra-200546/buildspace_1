import { useEffect, useState } from "react";
import { PageTitle } from "../components/common/PageTitle";
import { getChallenges, getProjects, submitChallenge } from "../services/api";
import type { Challenge, Project } from "../types";

export function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    getChallenges().then(setChallenges).catch(() => setChallenges([]));
    getProjects().then(setProjects).catch(() => setProjects([]));
  }, []);

  async function submit(challengeId: string) {
    const project = projects[0];
    if (!project) return;
    await submitChallenge(challengeId, project.id, "Submission from BuildSpace AI interface");
    setChallenges(await getChallenges());
  }

  return (
    <div className="space-y-4">
      <PageTitle title="Project Challenges" subtitle="Weekly themed challenges with badge rewards and winner highlights." />

      <div className="space-y-3">
        {challenges.map((challenge) => (
          <article key={challenge.id} className="panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{challenge.title}</p>
                <p className="mt-1 text-xs text-muted">{challenge.description}</p>
              </div>
              <span className="rounded-full bg-accent/15 px-3 py-1 text-[10px] text-accent">{challenge.badge}</span>
            </div>
            <p className="mt-2 text-xs text-warning">Reward: {challenge.reward}</p>
            <button className="btn-secondary mt-3" onClick={() => submit(challenge.id)}>Submit Project</button>

            <div className="mt-4 border-t border-border pt-3">
              <p className="text-xs uppercase tracking-wide text-muted">Submissions</p>
              {challenge.submissions.map((item) => (
                <p key={item.id} className="mt-2 text-sm text-zinc-300">
                  {item.user.name} - {item.project.title} {item.isWinner ? "(Winner)" : ""}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
