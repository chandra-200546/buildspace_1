import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 text-center">
      <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs text-accent">Project-first social network</span>
      <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight">
        BuildSpace AI
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-zinc-300">
        Show your work. Build your reputation. Get opportunities.
      </p>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Build in public, get AI feedback, attract collaborators, and get discovered by recruiters through real projects.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/auth" className="btn-primary">Get Started (Login / Sign up)</Link>
        <Link to="/home" className="btn-secondary">View Demo Feed</Link>
      </div>
    </div>
  );
}
