import { useEffect, useState } from "react";

type SessionUser = {
  id: string;
  username: string;
  role: "DEVELOPER" | "RECRUITER" | "ADMIN";
  name: string;
  email: string;
};

export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("buildspace_user");
    if (raw) {
      setUser(JSON.parse(raw));
    }
  }, []);

  const saveSession = (sessionUser: SessionUser, token: string) => {
    localStorage.setItem("buildspace_user", JSON.stringify(sessionUser));
    localStorage.setItem("buildspace_token", token);
    setUser(sessionUser);
  };

  const clearSession = () => {
    localStorage.removeItem("buildspace_user");
    localStorage.removeItem("buildspace_token");
    setUser(null);
  };

  return { user, saveSession, clearSession };
}
