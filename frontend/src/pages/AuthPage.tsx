import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../services/api";
import { useSession } from "../hooks/useSession";

export function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"DEVELOPER" | "RECRUITER">("DEVELOPER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { saveSession } = useSession();

  async function submit() {
    setLoading(true);
    setError("");

    try {
      const result =
        mode === "login"
          ? await login(email, password)
          : await register({ email, password, name, username, role });

      saveSession(
        {
          id: result.user.id,
          email: result.user.email,
          username: result.user.username,
          role: result.user.role,
          name: result.user.name
        },
        result.token
      );
      nav("/home");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to authenticate.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
      <div className="panel w-full p-6">
        <h2 className="text-2xl font-semibold">Welcome to BuildSpace AI</h2>
        <p className="mt-1 text-sm text-muted">Project-first identity for developers.</p>

        <div className="mt-4 flex gap-2">
          <button className={`btn-secondary ${mode === "login" ? "border-accent text-accent" : ""}`} onClick={() => setMode("login")}>Login</button>
          <button className={`btn-secondary ${mode === "register" ? "border-accent text-accent" : ""}`} onClick={() => setMode("register")}>Register</button>
        </div>

        {mode === "register" && (
          <>
            <input className="input mt-4" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
            <input className="input mt-3" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
            <select className="input mt-3" value={role} onChange={(e) => setRole(e.target.value as "DEVELOPER" | "RECRUITER")}>
              <option value="DEVELOPER">Developer</option>
              <option value="RECRUITER">Recruiter</option>
            </select>
          </>
        )}

        <input className="input mt-4" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input className="input mt-3" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />

        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

        <button onClick={submit} disabled={loading} className="btn-primary mt-4 w-full">
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
        </button>
      </div>
    </div>
  );
}
