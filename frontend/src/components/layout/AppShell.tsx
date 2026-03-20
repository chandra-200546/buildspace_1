import { useEffect, useState, type ReactNode } from "react";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { getRightRail } from "../../services/api";
import type { RightRail } from "../../types";

type Props = {
  children: ReactNode;
};

export function AppShell({ children }: Props) {
  const [rightRail, setRightRail] = useState<RightRail | null>(null);

  useEffect(() => {
    getRightRail().then(setRightRail).catch(() => setRightRail(null));
  }, []);

  return (
    <div className="mx-auto flex min-h-screen max-w-[1500px]">
      <LeftSidebar />
      <main className="min-h-screen flex-1 border-x border-border px-3 py-6 md:px-6">{children}</main>
      <RightSidebar data={rightRail} />
    </div>
  );
}
