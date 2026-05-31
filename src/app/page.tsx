import Link from "next/link";
import { BrandMark, FeaturePill, PhoneShell, StatCard } from "@/components/ui";

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_32%),linear-gradient(135deg,#ffffff_0%,#f8fbff_44%,#f3e8ff_100%)]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-5 sm:px-8 lg:px-10">
        <nav className="flex items-center justify-between">
          <BrandMark />
          <Link
            href="/login"
            className="rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-sm font-bold text-blue-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Enter app
          </Link>
        </nav>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-6">
          <div>
            <div className="mb-5 flex flex-wrap gap-2">
              <FeaturePill label="Mobile-first" />
              <FeaturePill label="Gamified learning" />
              <FeaturePill label="For tuition centres" />
            </div>

            <p className="text-sm font-extrabold uppercase tracking-[0.26em] text-amber-500">
              AiGenius Tuition Centre
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl font-black leading-[0.96] text-slate-950 sm:text-6xl lg:text-7xl">
              AiGenius Pet Learning System
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              A premium, child-friendly learning academy where students grow a
              digital pet by completing homework, attending class, and earning
              rewards.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="rounded-full bg-blue-600 px-6 py-4 text-center text-base font-black text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Choose your role
              </Link>
              <Link
                href="/student"
                className="rounded-full border border-purple-100 bg-white px-6 py-4 text-center text-base font-black text-purple-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                Preview student app
              </Link>
            </div>

            <div className="mt-9 grid grid-cols-3 gap-3">
              <StatCard value="4" label="role portals" />
              <StatCard value="3s" label="teacher actions" />
              <StatCard value="XP" label="pet growth" />
            </div>
          </div>

          <PhoneShell title="Student Preview" subtitle="Today at academy">
            <div className="rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-700 p-5 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-blue-100">Pet Level 8</p>
                  <h2 className="text-3xl font-black">Nova Pup</h2>
                </div>
                <div className="grid h-20 w-20 place-items-center rounded-[2rem] bg-white/20 text-5xl shadow-inner">
                  ✦
                </div>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-3/4 rounded-full bg-amber-300" />
              </div>
              <p className="mt-2 text-sm font-bold text-blue-50">740 / 1000 XP</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <StatCard value="128" label="Star Coins" />
              <StatCard value="5" label="tasks today" />
            </div>
            <div className="mt-4 rounded-3xl border border-blue-100 bg-white p-4 shadow-sm">
              <p className="text-sm font-black text-slate-900">Next task</p>
              <p className="mt-1 text-sm text-slate-500">Complete Math Drill 04</p>
            </div>
          </PhoneShell>
        </div>
      </section>
    </main>
  );
}
