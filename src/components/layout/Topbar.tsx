import Link from "next/link";
import { RoleSwitcher } from "./RoleSwitcher";

export function Topbar({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-20 border-b-4 border-[#102A54] bg-[#FFF7E2]/92 px-4 py-3 shadow-[0_4px_0_rgba(16,42,84,0.08)] backdrop-blur lg:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[0.65rem] font-black uppercase tracking-[0.18em] text-[#FF6B57] sm:text-xs">
            AiGenius Tuition Centre
          </p>
          <h1 className="truncate text-lg font-black text-[#102A54] sm:text-2xl">{title}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <RoleSwitcher />
          <Link
            href="/login"
            className="rounded-full border-2 border-[#102A54] bg-[#FFD95A] px-3 py-2 text-xs font-black text-[#102A54] shadow-[3px_3px_0_#102A54] transition hover:-translate-y-0.5 sm:px-4 sm:text-sm"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
