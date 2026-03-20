export type AuthUser = {
  id: string;
  email: string;
  username: string;
  role: "DEVELOPER" | "RECRUITER" | "ADMIN";
};
