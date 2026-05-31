import Link from "next/link";
import { RoleSwitcher } from "./RoleSwitcher";
import type { DashboardVariant } from "./DashboardShell";

const topbarStyles: Record<DashboardVariant, string> = {
  default: "border-[#102A54] bg-[#FFF7E2]/92 shadow-[0_4px_0_rgba(16,42,84,0.08)]",
  teacher: "border-[#4FB8FF]/30 bg-[#071E63]/88 shadow-[0_12px_30px_rgba(0,0,0,0.18)]",
  parent: "border-[#D8E4F0] bg-white/92 shadow-[0_12px_28px_rgba(16,42,84,0.06)]",
  admin: "border-[#FFCF17]/30 bg-[#07111F]/88 shadow-[0_12px_30px_rgba(0,0,0,0.22)]",
};

const eyebrowStyles: Record<DashboardVariant, string> = {
  default: "text-[#FF6B57]",
  teacher: "text-[#FFCF17]",
  parent: "text-[#4F6B88]",
  admin: "text-[#FFCF17]",
};

const titleStyles: Record<DashboardVariant, string> = {
  default: "text-[#102A54]",
  teacher: "text-white",
  parent: "text-[#102A54]",
  admin: "text-white",
};

const loginStyles: Record<DashboardVariant, string> = {
  default: "border-[#102A54] bg-[#FFD95A] text-[#102A54] shadow-[3px_3px_0_#102A54]",
  teacher: "border-white/20 bg-[#FFCF17] text-[#102A54] shadow-[0_10px_20px_rgba(255,207,23,0.18)]",
  parent: "border-[#D8E4F0] bg-[#EEF6FF] text-[#102A54] shadow-[0_8px_20px_rgba(16,42,84,0.08)]",
  admin: "border-white/20 bg-[#FFCF17] text-[#102A54] shadow-[0_10px_20px_rgba(255,207,23,0.16)]",
};

export function Topbar({
  title,
  variant = "default",
}: {
  title: string;
  variant?: DashboardVariant;
}) {
  return (
    <header className={`sticky top-0 z-20 border-b px-4 py-3 backdrop-blur lg:px-6 ${topbarStyles[variant]}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className={`truncate text-[0.65rem] font-black uppercase tracking-[0.18em] sm:text-xs ${eyebrowStyles[variant]}`}>
            AiGenius Tuition Centre
          </p>
          <h1 className={`truncate text-lg font-black sm:text-2xl ${titleStyles[variant]}`}>{title}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <RoleSwitcher variant={variant} />
          <Link
            href="/login"
            className={`rounded-full border px-3 py-2 text-xs font-black transition hover:-translate-y-0.5 sm:px-4 sm:text-sm ${loginStyles[variant]}`}
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
