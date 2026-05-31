import Image from "next/image";
import Link from "next/link";
import { demoAccounts } from "@/lib/demo-auth";
import { loginAction } from "./actions";

const roles = [
  {
    name: "Student",
    description: "Learn, earn rewards, and grow your pet.",
    tone: "from-[#4FB8FF] to-[#8B38FF]",
    icon: "S",
  },
  {
    name: "Teacher",
    description: "Assign quests and monitor English progress.",
    tone: "from-[#39D353] to-[#4FB8FF]",
    icon: "T",
  },
  {
    name: "Parent",
    description: "Check reports, attendance, and teacher notes.",
    tone: "from-[#FFCF17] to-[#FF6B57]",
    icon: "P",
  },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <main className="min-h-screen overflow-hidden bg-[#071E63] bg-[radial-gradient(circle_at_18%_8%,rgba(79,184,255,0.55),transparent_28%),radial-gradient(circle_at_82%_16%,rgba(139,56,255,0.45),transparent_24%),linear-gradient(180deg,#061956_0%,#0B2F86_48%,#142C7D_100%)] px-4 py-5 text-white sm:px-6 lg:p-8">
      <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[430px_1fr] lg:items-start">
        <section className="relative mx-auto w-full max-w-[430px] overflow-hidden rounded-[2.2rem] border border-white/20 bg-[#08256F]/85 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.22)_0_1px,transparent_2px),radial-gradient(circle_at_72%_30%,rgba(255,255,255,0.16)_0_1px,transparent_2px),radial-gradient(circle_at_42%_72%,rgba(255,255,255,0.12)_0_1px,transparent_2px)]" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-white/25 bg-white/10">
                <Image src="/aigenius-logo.png" alt="AiGenius" width={96} height={96} className="h-full w-full object-cover" priority />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FFCF17]">
                  AiGenius
                </p>
                <h1 className="text-xl font-black">StarPet Academy</h1>
              </div>
            </div>
            <Link href="/admin/login" className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-black">
              Admin
            </Link>
          </div>

          <div className="relative z-10 mt-5 rounded-[2rem] border border-white/15 bg-gradient-to-b from-[#12389B] to-[#09256B] p-4 text-center shadow-[0_20px_48px_rgba(0,0,0,0.28)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FFCF17]">
              Learn · Play · Evolve
            </p>
            <h2 className="mt-2 text-4xl font-black leading-tight">
              English learning with pet rewards
            </h2>
            <div className="relative mx-auto mt-5 h-72 w-72 max-w-full">
              <div className="absolute inset-x-8 bottom-3 h-10 rounded-full bg-black/25 blur-xl" />
              <Image
                src="/pets/pet01_emotion/pet01_excited.png"
                alt="StarPet"
                width={360}
                height={360}
                className="pet-bounce relative z-10 h-full w-full rounded-[2.2rem] object-cover drop-shadow-[0_22px_32px_rgba(0,0,0,0.35)]"
                priority
              />
            </div>
          </div>

          <div className="relative z-10 mt-4 grid gap-2">
            {roles.map((role) => (
              <div key={role.name} className="flex items-center gap-3 rounded-[1.5rem] border border-white/15 bg-white/10 p-3">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${role.tone} text-lg font-black shadow-[0_12px_24px_rgba(0,0,0,0.22)]`}>
                  {role.icon}
                </span>
                <div>
                  <p className="font-black">{role.name}</p>
                  <p className="text-xs font-bold leading-5 text-white/60">{role.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid content-start gap-4">
          <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-[0_18px_52px_rgba(0,0,0,0.2)] backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFCF17]">
              Student · Parent · Teacher
            </p>
            <h2 className="mt-2 text-3xl font-black sm:text-5xl">Login to continue</h2>
            <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-white/62">
              One shared entrance for learning, reports, and teaching. Admin access stays separate for centre safety.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-[0_18px_52px_rgba(0,0,0,0.18)] backdrop-blur">
            <form action={loginAction} className="grid gap-4">
              <label className="grid gap-2 text-sm font-black">
                Email
                <input
                  name="email"
                  type="email"
                  required
                  className="min-h-14 rounded-2xl border border-white/15 bg-[#071E63]/70 px-4 text-sm font-bold text-white outline-none placeholder:text-white/35 focus:border-[#FFCF17]"
                  placeholder="student@aigenius.test"
                />
              </label>
              <label className="grid gap-2 text-sm font-black">
                Password
                <input
                  name="password"
                  type="password"
                  required
                  className="min-h-14 rounded-2xl border border-white/15 bg-[#071E63]/70 px-4 text-sm font-bold text-white outline-none placeholder:text-white/35 focus:border-[#FFCF17]"
                  placeholder="Password"
                />
              </label>
              {error ? (
                <p className="rounded-2xl bg-[#FF6B57] p-3 text-sm font-black text-white">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                className="min-h-14 rounded-2xl bg-gradient-to-r from-[#8B38FF] to-[#4FB8FF] px-5 text-sm font-black text-white shadow-[0_14px_30px_rgba(79,184,255,0.25)] transition hover:-translate-y-0.5"
              >
                Login
              </button>
            </form>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/register" className="rounded-2xl bg-[#FFCF17] px-5 py-4 text-center text-sm font-black text-[#102A54]">
                Create account
              </Link>
              <Link href="/" className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-center text-sm font-black text-white">
                Back to landing
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-[0_18px_52px_rgba(0,0,0,0.18)] backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFCF17]">
              Demo login
            </p>
            <div className="mt-3 grid gap-2 text-sm font-bold leading-6 text-white/68">
              {demoAccounts
                .filter((account) => account.role !== "admin")
                .map((account) => (
                  <p key={account.email}>
                    {account.role}: {account.email} / {account.password}
                  </p>
                ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
