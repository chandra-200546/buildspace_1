import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageTitle } from "../components/common/PageTitle";
import { updateProfile } from "../services/api";

export function EditProfilePage() {
  const nav = useNavigate();
  const [name, setName] = useState("Alex Rivera");
  const [bio, setBio] = useState("Building AI-powered developer tools in public.");
  const [skills, setSkills] = useState("React,TypeScript,Node,Prisma");
  const [githubUsername, setGithubUsername] = useState("alexcodes");
  const [portfolioUrl, setPortfolioUrl] = useState("https://alex.dev");
  const [openToCollaborate, setOpenToCollaborate] = useState(true);
  const [openToHire, setOpenToHire] = useState(true);

  async function submit() {
    await updateProfile({
      name,
      bio,
      skills: skills.split(",").map((skill) => skill.trim()),
      badges: ["Top Builder"],
      githubUsername,
      portfolioUrl,
      openToCollaborate,
      openToHire
    });
    nav("/profile");
  }

  return (
    <div className="space-y-4">
      <PageTitle title="Edit Profile" subtitle="Shape your proof-of-work identity." />
      <section className="panel space-y-3 p-4">
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <textarea className="input min-h-28" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Bio" />
        <input className="input" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Skills" />
        <input className="input" value={githubUsername} onChange={(e) => setGithubUsername(e.target.value)} placeholder="GitHub username" />
        <input className="input" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="Portfolio URL" />

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={openToCollaborate} onChange={(e) => setOpenToCollaborate(e.target.checked)} />
          Open to collaborate
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={openToHire} onChange={(e) => setOpenToHire(e.target.checked)} />
          Open to hire
        </label>

        <button className="btn-primary" onClick={submit}>Save Profile</button>
      </section>
    </div>
  );
}
