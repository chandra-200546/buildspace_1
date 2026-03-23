import { Eye, EyeOff } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../services/api";
import { useSession } from "../hooks/useSession";
import "./AuthPage.css";

const LOGO_CANDIDATES = [
  "/fiveu-logo.jpg",
  "/fiveu-logo.jpeg",
  "/fiveu-logo.png",
  "/fiveu-logo.webp",
  "/FiveU-logo.jpg",
  "/FiveU-logo.png",
  "/fiveu.jpg",
  "/logo.jpg"
];

export function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [isSwitching, setIsSwitching] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [logoIndex, setLogoIndex] = useState(0);
  const [customLogo, setCustomLogo] = useState("");
  const [logoMissing, setLogoMissing] = useState(false);
  const nav = useNavigate();
  const { saveSession } = useSession();

  const particles = useMemo(
    () =>
      Array.from({ length: 28 }).map((_, idx) => ({
        id: idx,
        size: Math.round(Math.random() * 3 + 2),
        left: Math.round(Math.random() * 100),
        top: Math.round(Math.random() * 100),
        duration: Number((Math.random() * 8 + 8).toFixed(2)),
        delay: Number((Math.random() * -10).toFixed(2)),
        opacity: Number((Math.random() * 0.7 + 0.2).toFixed(2))
      })),
    []
  );

  useEffect(() => {
    if (mode === "signup" && !signupUsername.trim()) {
      const suggested = signupName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s_]/g, "")
        .replace(/\s+/g, "_")
        .slice(0, 16);
      setSignupUsername(suggested);
    }
  }, [mode, signupName, signupUsername]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setShowGreeting(true);
      window.setTimeout(() => setShowGreeting(false), 1800);
    }, 5000);

    const initialHide = window.setTimeout(() => setShowGreeting(false), 1800);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(initialHide);
    };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("buildspace_company_logo");
    if (saved) setCustomLogo(saved);
  }, []);

  function switchMode(nextMode: "login" | "signup") {
    if (nextMode === mode) return;
    setIsSwitching(true);
    setMode(nextMode);
    setError("");
    setSuccess("");
    setFieldErrors({});
    window.setTimeout(() => setIsSwitching(false), 760);
  }

  function validateEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (mode === "login") {
      if (!validateEmail(loginEmail)) nextErrors.loginEmail = "Please enter a valid email.";
      if (loginPassword.trim().length < 6) nextErrors.loginPassword = "Password must be at least 6 characters.";
    } else {
      if (!signupName.trim()) nextErrors.signupName = "Full name is required.";
      if (!signupUsername.trim()) nextErrors.signupUsername = "Username is required.";
      if (!validateEmail(signupEmail)) nextErrors.signupEmail = "Please enter a valid email.";
      if (signupPassword.trim().length < 6) nextErrors.signupPassword = "Password must be at least 6 characters.";
      if (signupConfirmPassword !== signupPassword) nextErrors.signupConfirmPassword = "Passwords do not match.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSuccess("");
    if (!validate()) return;

    setLoading(true);
    setError("");

    try {
      const result =
        mode === "login"
          ? await login(loginEmail, loginPassword)
          : await register({
              email: signupEmail,
              password: signupPassword,
              name: signupName,
              username: signupUsername,
              role: "DEVELOPER"
            });

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
      setSuccess(mode === "login" ? "Login successful. Redirecting..." : "Signup successful. Redirecting...");
      nav("/profile");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to authenticate.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authv2-page">
      <div className="authv2-bg-grid" />
      <div className="authv2-orb authv2-orb-1" />
      <div className="authv2-orb authv2-orb-2" />

      <div className="authv2-particles">
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="authv2-particle"
            style={
              {
                "--particle-size": `${particle.size}px`,
                "--particle-left": `${particle.left}%`,
                "--particle-top": `${particle.top}%`,
                "--particle-duration": `${particle.duration}s`,
                "--particle-delay": `${particle.delay}s`,
                "--particle-opacity": particle.opacity
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className={`authv2-shell ${mode === "signup" ? "mode-signup" : "mode-login"} ${isSwitching ? "is-switching" : ""}`}>
        <header className="authv2-header">
          <div className="authv2-brand">
            <span className="authv2-brand-dot" />
            <div>
              <h2>BuildSpace AI</h2>
              <p>Show your work. Build your reputation.</p>
            </div>
          </div>

          <div className="authv2-tabs">
            <button className={`authv2-tab-btn ${mode === "login" ? "active" : ""}`} onClick={() => switchMode("login")}>
              Login
            </button>
            <button className={`authv2-tab-btn ${mode === "signup" ? "active" : ""}`} onClick={() => switchMode("signup")}>
              Sign Up
            </button>
            <span className="authv2-tab-glider" />
          </div>
        </header>

        <div className="authv2-scene">
          <aside className="authv2-anime-zone" aria-hidden="true">
            <div className="authv2-fiveu-brand">
              <img
                src={customLogo || LOGO_CANDIDATES[logoIndex]}
                alt="FiveU Technologies Pvt Ltd"
                className="authv2-fiveu-logo-image"
                onError={() => {
                  if (customLogo) {
                    setCustomLogo("");
                    localStorage.removeItem("buildspace_company_logo");
                    setLogoIndex(0);
                    setLogoMissing(false);
                    return;
                  }
                  setLogoIndex((value) => {
                    const next = value + 1;
                    if (next >= LOGO_CANDIDATES.length) {
                      setLogoMissing(true);
                      return value;
                    }
                    return next;
                  });
                }}
              />
              {logoMissing && (
                <p className="authv2-logo-missing">Logo file not found. Add `fiveu-logo.jpg` in `frontend/public`.</p>
              )}
              <label className="authv2-logo-upload">
                Use company logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const dataUrl = String(reader.result ?? "");
                      setCustomLogo(dataUrl);
                      localStorage.setItem("buildspace_company_logo", dataUrl);
                      setLogoMissing(false);
                    };
                    reader.readAsDataURL(file);
                    event.target.value = "";
                  }}
                />
              </label>
              <p className="authv2-fiveu-tag">A FiveU Product</p>
            </div>
            <div className={`authv2-anime-figure ${showGreeting ? "greeting" : ""}`}>
              <p className={`authv2-greet-bubble ${showGreeting ? "visible" : ""}`}>WELCOME</p>
              <div className="authv2-anime-shadow" />
              <div className="authv2-anime-head">
                <span className="authv2-anime-eye left" />
                <span className="authv2-anime-eye right" />
                <span className="authv2-anime-mouth" />
                <span className="authv2-anime-hair" />
              </div>
              <div className="authv2-anime-torso" />
              <div className="authv2-anime-arm left" />
              <div className="authv2-anime-arm right" />
              <div className="authv2-anime-leg left" />
              <div className="authv2-anime-leg right" />
            </div>
          </aside>

          <div className="authv2-card-perspective">
            <div className="authv2-card">
              <section className="authv2-face authv2-face-login">
                <h3>Welcome Back</h3>
                <p>Login and continue building in public.</p>
                <form onSubmit={submit} noValidate className="authv2-form">
                  <label>Email</label>
                  <input
                    className="authv2-input"
                    value={loginEmail}
                    onChange={(event) => setLoginEmail(event.target.value)}
                    placeholder="you@example.com"
                  />
                  <small>{fieldErrors.loginEmail ?? " "}</small>

                  <label>Password</label>
                  <div className="authv2-input-wrap">
                    <input
                      className="authv2-input"
                      type={showLoginPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(event) => setLoginPassword(event.target.value)}
                      placeholder="Minimum 6 characters"
                    />
                    <button type="button" className="authv2-eye" onClick={() => setShowLoginPassword((value) => !value)}>
                      {showLoginPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <small>{fieldErrors.loginPassword ?? " "}</small>

                  {error && mode === "login" && <p className="authv2-error">{error}</p>}
                  {success && mode === "login" && <p className="authv2-success">{success}</p>}

                  <button className="authv2-submit" type="submit" disabled={loading}>
                    {loading ? "Please wait..." : "Login"}
                  </button>
                </form>
              </section>

              <section className="authv2-face authv2-face-signup">
                <h3>Create Account</h3>
                <p>Build your developer identity with projects.</p>
                <form onSubmit={submit} noValidate className="authv2-form">
                  <label>Full Name</label>
                  <input
                    className="authv2-input"
                    value={signupName}
                    onChange={(event) => setSignupName(event.target.value)}
                    placeholder="Your full name"
                  />
                  <small>{fieldErrors.signupName ?? " "}</small>

                  <label>Username</label>
                  <input
                    className="authv2-input"
                    value={signupUsername}
                    onChange={(event) => setSignupUsername(event.target.value)}
                    placeholder="unique username"
                  />
                  <small>{fieldErrors.signupUsername ?? " "}</small>

                  <label>Email</label>
                  <input
                    className="authv2-input"
                    value={signupEmail}
                    onChange={(event) => setSignupEmail(event.target.value)}
                    placeholder="you@example.com"
                  />
                  <small>{fieldErrors.signupEmail ?? " "}</small>

                  <label>Password</label>
                  <div className="authv2-input-wrap">
                    <input
                      className="authv2-input"
                      type={showSignupPassword ? "text" : "password"}
                      value={signupPassword}
                      onChange={(event) => setSignupPassword(event.target.value)}
                      placeholder="Minimum 6 characters"
                    />
                    <button type="button" className="authv2-eye" onClick={() => setShowSignupPassword((value) => !value)}>
                      {showSignupPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <small>{fieldErrors.signupPassword ?? " "}</small>

                  <label>Confirm Password</label>
                  <div className="authv2-input-wrap">
                    <input
                      className="authv2-input"
                      type={showSignupConfirmPassword ? "text" : "password"}
                      value={signupConfirmPassword}
                      onChange={(event) => setSignupConfirmPassword(event.target.value)}
                      placeholder="Re-enter password"
                    />
                    <button type="button" className="authv2-eye" onClick={() => setShowSignupConfirmPassword((value) => !value)}>
                      {showSignupConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <small>{fieldErrors.signupConfirmPassword ?? " "}</small>

                  {error && mode === "signup" && <p className="authv2-error">{error}</p>}
                  {success && mode === "signup" && <p className="authv2-success">{success}</p>}

                  <button className="authv2-submit" type="submit" disabled={loading}>
                    {loading ? "Please wait..." : "Create Account"}
                  </button>
                </form>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
