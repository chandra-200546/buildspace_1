import type { RightRail } from "../../types";
import { Avatar } from "../common/Avatar";

type Props = {
  data: RightRail | null;
};

export function RightSidebar({ data }: Props) {
  return (
    <aside className="sticky top-0 hidden h-screen w-80 shrink-0 space-y-4 overflow-y-auto border-l border-border px-4 py-6 xl:block">
      <section className="panel p-4">
        <h3 className="text-sm font-semibold">Trending Tech Tags</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {data?.trendingTags?.map((tag) => (
            <span key={tag.id} className="rounded-full border border-border px-3 py-1 text-xs text-muted">
              {tag.label}
            </span>
          ))}
        </div>
      </section>

      <section className="panel p-4">
        <h3 className="text-sm font-semibold">Suggested Developers</h3>
        <div className="mt-3 space-y-3">
          {data?.suggestedDevelopers?.map((dev) => (
            <div key={dev.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar name={dev.name} image={dev.image} size="sm" />
                <div>
                  <p className="text-sm font-medium">{dev.name}</p>
                  <p className="text-xs text-muted">@{dev.username}</p>
                </div>
              </div>
              <span className="rounded-full bg-zinc-800 px-2 py-1 text-[10px] text-muted">
                {(dev.profile?.skills ?? []).slice(0, 1).join(" ") || "Builder"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel p-4">
        <h3 className="text-sm font-semibold">Active Challenges</h3>
        <div className="mt-3 space-y-2">
          {data?.activeChallenges?.map((challenge) => (
            <div key={challenge.id} className="rounded-xl border border-border p-3">
              <p className="text-sm font-medium">{challenge.title}</p>
              <p className="mt-1 text-xs text-muted">{challenge.badge}</p>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
