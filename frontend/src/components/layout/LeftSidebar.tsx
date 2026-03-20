import { NavLink } from "react-router-dom";
import { Bookmark, Bot, BriefcaseBusiness, Compass, Flame, Home, MessageSquare, PlusSquare } from "lucide-react";

const navItems = [
  { to: "/profile", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/challenges", label: "Challenges", icon: Flame },
  { to: "/collaborate", label: "Collaborate", icon: BriefcaseBusiness },
  { to: "/notifications", label: "Notifications", icon: MessageSquare },
  { to: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { to: "/ai-mentor", label: "AI Mentor", icon: Bot }
];

export function LeftSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-border px-4 py-6 lg:block">
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-bold tracking-tight">BuildSpace AI</h1>
        <p className="mt-1 text-xs text-muted">Show your work. Build your reputation. Get opportunities.</p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                  isActive ? "bg-accent/15 text-accent" : "text-zinc-200 hover:bg-zinc-900"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <button className="btn-primary mt-8 flex w-full items-center justify-center gap-2">
        <PlusSquare className="h-4 w-4" />
        Post Project
      </button>
    </aside>
  );
}
