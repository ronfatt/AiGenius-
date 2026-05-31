import type { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { Topbar } from "./Topbar";

export function DashboardShell({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <main className="min-h-screen bg-[#FFF7E2] bg-[radial-gradient(circle_at_10%_8%,#FFD95A55,transparent_24%),radial-gradient(circle_at_90%_12%,#7BE0C355,transparent_24%),linear-gradient(145deg,#FFF7E2_0%,#FFFDF3_48%,#EEF2F5_100%)] text-[#102A54]">
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="min-w-0 flex-1">
          <Topbar title={title} />
          <div className="mx-auto max-w-7xl px-3 pb-28 pt-4 sm:px-4 lg:px-6 lg:pb-8">
            {children}
          </div>
        </div>
      </div>
      <MobileBottomNav />
    </main>
  );
}
