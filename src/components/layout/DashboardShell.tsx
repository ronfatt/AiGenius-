import type { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { Topbar } from "./Topbar";

export type DashboardVariant = "default" | "teacher" | "parent" | "admin";

const shellStyles: Record<DashboardVariant, string> = {
  default:
    "bg-[#FFF7E2] bg-[radial-gradient(circle_at_10%_8%,#FFD95A55,transparent_24%),radial-gradient(circle_at_90%_12%,#7BE0C355,transparent_24%),linear-gradient(145deg,#FFF7E2_0%,#FFFDF3_48%,#EEF2F5_100%)] text-[#102A54]",
  teacher:
    "bg-[#071E63] bg-[radial-gradient(circle_at_12%_10%,rgba(79,184,255,0.34),transparent_26%),radial-gradient(circle_at_86%_8%,rgba(123,224,195,0.22),transparent_24%),linear-gradient(145deg,#061956_0%,#0B2F86_44%,#EEF2F5_44%,#F8FBFF_100%)] text-[#102A54]",
  parent:
    "bg-[#F7FAFC] bg-[radial-gradient(circle_at_12%_8%,rgba(79,184,255,0.18),transparent_24%),linear-gradient(145deg,#F8FBFF_0%,#FFFFFF_48%,#EEF2F5_100%)] text-[#102A54]",
  admin:
    "bg-[#07111F] bg-[radial-gradient(circle_at_14%_10%,rgba(79,184,255,0.32),transparent_26%),radial-gradient(circle_at_88%_10%,rgba(255,207,23,0.18),transparent_22%),linear-gradient(145deg,#07111F_0%,#102A54_44%,#EEF2F5_44%,#FFFFFF_100%)] text-[#102A54]",
};

export function DashboardShell({
  children,
  title,
  immersive = false,
  variant = "default",
}: {
  children: ReactNode;
  title: string;
  immersive?: boolean;
  variant?: DashboardVariant;
}) {
  if (immersive) {
    return (
      <main className="min-h-screen bg-[#071E63] text-[#102A54]">
        {children}
        <MobileBottomNav />
      </main>
    );
  }

  return (
    <main className={`min-h-screen ${shellStyles[variant]}`}>
      <div className="flex min-h-screen">
        <AppSidebar variant={variant} />
        <div className="min-w-0 flex-1">
          <Topbar title={title} variant={variant} />
          <div className="mx-auto max-w-7xl px-3 pb-28 pt-4 sm:px-4 lg:px-6 lg:pb-8">
            {children}
          </div>
        </div>
      </div>
      <MobileBottomNav />
    </main>
  );
}
