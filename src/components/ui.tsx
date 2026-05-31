import Link from "next/link";
import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function BrandMark() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="grid h-12 w-12 place-items-center rounded-[1.25rem] border-2 border-[#102A54] bg-gradient-to-br from-[#4FB8FF] via-[#7BE0C3] to-[#FFD95A] text-lg font-black text-[#102A54] shadow-[4px_4px_0_#102A54]">
        AI
      </div>
      <div>
        <p className="text-sm font-black leading-tight text-[#102A54]">
          AiGenius
        </p>
        <p className="text-xs font-bold leading-tight text-[#102A54]/65">
          Pet Learning System
        </p>
      </div>
    </Link>
  );
}

export function AppFrame({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <main className="min-h-screen bg-[#FFF7E2] bg-[radial-gradient(circle_at_12%_10%,#FFD95A55,transparent_26%),radial-gradient(circle_at_86%_8%,#7BE0C355,transparent_24%),linear-gradient(135deg,#FFF7E2_0%,#FFFDF3_48%,#EEF2F5_100%)] px-4 py-5 text-[#102A54] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4">
          <BrandMark />
          <Link
            href="/login"
            className="rounded-full border-2 border-[#102A54] bg-[#FFF7E2] px-4 py-2 text-sm font-black text-[#102A54] shadow-[3px_3px_0_#102A54] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#102A54]"
          >
            Roles
          </Link>
        </header>
        <section className="py-6">
          <p className="inline-flex rounded-full border-2 border-[#102A54] bg-[#FFD95A] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#102A54]">
            {subtitle}
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[#102A54] sm:text-4xl">
            {title}
          </h1>
        </section>
        {children}
      </div>
    </main>
  );
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <section
      className={`rounded-[1.6rem] border-2 border-[#102A54] bg-[#FFFEF8] p-5 shadow-[5px_5px_0_rgba(16,42,84,0.12)] ${className}`}
    >
      {children}
    </section>
  );
}

export function ActionButton({
  children,
  tone = "blue",
}: {
  children: ReactNode;
  tone?: "blue" | "purple" | "gold";
}) {
  const tones = {
    blue: "bg-[#4FB8FF] text-[#102A54]",
    purple: "bg-[#7BE0C3] text-[#102A54]",
    gold: "bg-[#FFD95A] text-[#102A54]",
  };

  return (
    <button
      type="button"
      className={`min-h-14 rounded-2xl border-2 border-[#102A54] px-5 text-sm font-black shadow-[4px_4px_0_#102A54] transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#102A54] active:translate-y-0 active:shadow-[2px_2px_0_#102A54] ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

export function FeaturePill({ label }: { label: string }) {
  return (
    <span className="rounded-full border-2 border-[#102A54] bg-[#EEF2F5] px-3 py-2 text-xs font-black text-[#102A54] shadow-[2px_2px_0_#102A54] backdrop-blur">
      {label}
    </span>
  );
}

export function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[1.4rem] border-2 border-[#102A54] bg-[#FFFEF8] p-4 shadow-[4px_4px_0_rgba(16,42,84,0.12)]">
      <p className="text-2xl font-black text-[#102A54]">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#102A54]/60">
        {label}
      </p>
    </div>
  );
}

export function PhoneShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto w-full max-w-sm rounded-[2.5rem] border-4 border-[#102A54] bg-[#102A54] p-3 shadow-[10px_10px_0_rgba(16,42,84,0.16)]">
      <div className="rounded-[2rem] bg-[#FFF7E2] p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FF6B57]">
              {subtitle}
            </p>
            <p className="text-xl font-black text-[#102A54]">{title}</p>
          </div>
          <div className="h-10 w-10 rounded-full border-2 border-[#102A54] bg-gradient-to-br from-[#FFD95A] to-[#FFB199]" />
        </div>
        {children}
      </div>
    </div>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-4 overflow-hidden rounded-full border-2 border-[#102A54] bg-[#EEF2F5]">
      <div
        className="progress-fill h-full rounded-full bg-gradient-to-r from-[#7BE0C3] via-[#4FB8FF] to-[#FFD95A]"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function ListRow({
  title,
  meta,
  badge,
}: {
  title: string;
  meta: string;
  badge?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-[#102A54]/15 bg-[#FFF7E2] p-4">
      <div>
        <p className="font-black text-[#102A54]">{title}</p>
        <p className="mt-1 text-sm font-medium text-[#102A54]/60">{meta}</p>
      </div>
      {badge ? (
        <span className="shrink-0 rounded-full border-2 border-[#102A54] bg-[#FFD95A] px-3 py-1 text-xs font-black text-[#102A54]">
          {badge}
        </span>
      ) : null}
    </div>
  );
}
