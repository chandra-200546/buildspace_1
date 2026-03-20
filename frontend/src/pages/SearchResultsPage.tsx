import { useState } from "react";
import { Link } from "react-router-dom";
import { PageTitle } from "../components/common/PageTitle";
import { searchAll } from "../services/api";

export function SearchResultsPage() {
  const [query, setQuery] = useState("ai");
  const [results, setResults] = useState<any | null>(null);

  async function run() {
    setResults(await searchAll(query));
  }

  return (
    <div className="space-y-4">
      <PageTitle title="Search" subtitle="Find developers, projects, and build updates." />
      <section className="panel flex gap-2 p-4">
        <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className="btn-primary" onClick={run}>Search</button>
      </section>

      {results && (
        <section className="grid gap-4 md:grid-cols-3">
          <div className="panel p-4">
            <p className="text-sm font-semibold">Projects</p>
            {(results.projects ?? []).map((project: any) => (
              <Link className="mt-2 block text-sm text-accent" key={project.id} to={`/project/${project.slug}`}>
                {project.title}
              </Link>
            ))}
          </div>
          <div className="panel p-4">
            <p className="text-sm font-semibold">Developers</p>
            {(results.users ?? []).map((user: any) => (
              <p className="mt-2 text-sm" key={user.id}>@{user.username}</p>
            ))}
          </div>
          <div className="panel p-4">
            <p className="text-sm font-semibold">Posts</p>
            {(results.posts ?? []).map((post: any) => (
              <p className="mt-2 text-sm text-muted" key={post.id}>{post.text}</p>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
