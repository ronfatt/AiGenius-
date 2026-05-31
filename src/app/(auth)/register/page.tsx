import Image from "next/image";
import Link from "next/link";
import { registerAction } from "./actions";

const roles = [
  {
    value: "student",
    label: "Student",
    description: "Daily quests, pet growth, cards, exploration, and rewards.",
    tone: "from-[#4FB8FF] to-[#8B38FF]",
  },
  {
    value: "parent",
    label: "Parent",
    description: "Reports, teacher comments, attendance, and learning progress.",
    tone: "from-[#FFCF17] to-[#FF6B57]",
  },
  {
    value: "teacher",
    label: "Teacher",
    description: "English tasks, class monitoring, rewards, and interventions.",
    tone: "from-[#39D353] to-[#4FB8FF]",
  },
];

export default async function RegisterPage({
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-white/25 bg-white/10">
                <Image src="/aigenius-logo.png" alt="AiGenius" width={96} height={96} className="h-full w-full object-cover" priority />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FFCF17]">
                  AiGenius
                </p>
                <h1 className="text-xl font-black">Join StarPet</h1>
              </div>
            </div>
            <Link href="/login" className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-black">
              Login
            </Link>
          </div>

          <div className="mt-5 rounded-[2rem] border border-white/15 bg-gradient-to-b from-[#12389B] to-[#09256B] p-4 text-center shadow-[0_20px_48px_rgba(0,0,0,0.28)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FFCF17]">
              Instant MVP access
            </p>
            <h2 className="mt-2 text-4xl font-black leading-tight">
              Create your academy account
            </h2>
            <div className="relative mx-auto mt-5 h-72 w-72 max-w-full">
              <div className="absolute inset-x-8 bottom-3 h-10 rounded-full bg-black/25 blur-xl" />
              <Image
                src="/pets/pet02_emotion/pet02_happy.png"
                alt="Academy pet"
                width={360}
                height={360}
                className="pet-bounce relative z-10 h-full w-full rounded-[2.2rem] object-cover drop-shadow-[0_22px_32px_rgba(0,0,0,0.35)]"
                priority
              />
            </div>
          </div>

          <div className="mt-4 rounded-[1.8rem] border border-white/15 bg-gradient-to-br from-[#153DB5] via-[#4D20AA] to-[#102A8E] p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/55">
              Code system
            </p>
            <p className="mt-1 text-2xl font-black">5-letter access codes</p>
            <p className="mt-2 text-sm font-bold leading-6 text-white/62">
              Students, parents, and teachers receive simple 5-letter codes for linking and monitoring.
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-[0_18px_52px_rgba(0,0,0,0.2)] backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFCF17]">
            Register
          </p>
          <h2 className="mt-2 text-3xl font-black sm:text-5xl">Start learning today</h2>
          <p className="mt-3 text-sm font-bold leading-6 text-white/62">
            Registration creates a confirmed Supabase account immediately. No email verification is required for this MVP.
          </p>

          <form action={registerAction} className="mt-6 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-black">
                Full name
                <input
                  name="name"
                  required
                  className="min-h-14 rounded-2xl border border-white/15 bg-[#071E63]/70 px-4 text-sm font-bold text-white outline-none placeholder:text-white/35 focus:border-[#FFCF17]"
                  placeholder="Alyssa Tan"
                />
              </label>

              <label className="grid gap-2 text-sm font-black">
                Email
                <input
                  name="email"
                  type="email"
                  required
                  className="min-h-14 rounded-2xl border border-white/15 bg-[#071E63]/70 px-4 text-sm font-bold text-white outline-none placeholder:text-white/35 focus:border-[#FFCF17]"
                  placeholder="student@example.com"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-black">
                Password
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className="min-h-14 rounded-2xl border border-white/15 bg-[#071E63]/70 px-4 text-sm font-bold text-white outline-none placeholder:text-white/35 focus:border-[#FFCF17]"
                  placeholder="At least 6 characters"
                />
              </label>

              <label className="grid gap-2 text-sm font-black">
                Student school grade
                <select
                  name="schoolGrade"
                  defaultValue="Year 5"
                  className="min-h-14 rounded-2xl border border-white/15 bg-[#071E63]/70 px-4 text-sm font-bold text-white outline-none focus:border-[#FFCF17]"
                >
                  {["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"].map((grade) => (
                    <option key={grade} value={grade} className="text-[#102A54]">
                      {grade}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {roles.map((role) => (
                <label
                  key={role.value}
                  className={`rounded-[1.5rem] border border-white/15 bg-gradient-to-br ${role.tone} p-4 shadow-[0_16px_38px_rgba(0,0,0,0.2)]`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    defaultChecked={role.value === "student"}
                    className="mr-2"
                  />
                  <span className="text-sm font-black">{role.label}</span>
                  <p className="mt-2 text-xs font-bold leading-5 text-white/75">
                    {role.description}
                  </p>
                </label>
              ))}
            </div>

            {error ? (
              <p className="rounded-2xl bg-[#FF6B57] p-3 text-sm font-black">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="min-h-14 rounded-2xl bg-gradient-to-r from-[#8B38FF] to-[#4FB8FF] px-5 text-sm font-black text-white shadow-[0_14px_30px_rgba(79,184,255,0.25)] transition hover:-translate-y-0.5"
            >
              Register and enter
            </button>
          </form>

          <p className="mt-5 text-xs font-bold leading-6 text-white/50">
            Admin registration stays separate for centre safety. Create admins manually in Supabase or the admin portal later.
          </p>
        </section>
      </div>
    </main>
  );
}
