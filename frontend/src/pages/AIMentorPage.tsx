import { useEffect, useState } from "react";
import { PageTitle } from "../components/common/PageTitle";
import { askMentor, getMentorChats } from "../services/api";
import type { MentorChat } from "../types";

export function AIMentorPage() {
  const [prompt, setPrompt] = useState("What should I improve in this project?");
  const [chats, setChats] = useState<MentorChat[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    const data = await getMentorChats();
    setChats(data);
  }

  useEffect(() => {
    load().catch(() => setChats([]));
  }, []);

  async function submit() {
    setLoading(true);
    try {
      await askMentor(prompt);
      setPrompt("");
      await load();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <PageTitle title="AI Mentor" subtitle="Ask for project feedback, growth strategy, and next-build ideas." />

      <section className="panel space-y-3 p-4">
        <textarea
          className="input min-h-28"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="What project should I build next?"
        />
        <button className="btn-primary" onClick={submit} disabled={loading}>
          {loading ? "Thinking..." : "Ask Mentor"}
        </button>
      </section>

      <section className="space-y-3">
        {chats.map((chat) => (
          <article key={chat.id} className="panel p-4">
            <p className="text-xs text-muted">You</p>
            <p className="mt-1 text-sm">{chat.prompt}</p>
            <p className="mt-3 text-xs text-accent">AI Mentor</p>
            <p className="mt-1 text-sm text-zinc-200">{chat.response}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
