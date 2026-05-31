import Link from "next/link";
import { BrandMark } from "@/components/ui";
import { demoAccounts } from "@/lib/demo-auth";
import { loginAction } from "./actions";

const roles = [
  {
    name: "Teacher",
    href: "/teacher",
    description: "Assign English quests, review progress, and reward students.",
    accent: "bg-[#7BE0C3]",
  },
  {
    name: "Student",
    href: "/student",
    description: "Complete English missions, grow your pet, and earn Star Coins.",
    accent: "bg-[#FFD95A]",
  },
  {
    name: "Parent",
    href: "/parent",
    description: "View child progress, CEFR target, reports, and teacher notes.",
    accent: "bg-[#FFB199]",
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
    <main className="min-h-screen bg-[#FFF7E2] bg-[radial-gradient(circle_at_12%_10%,#FFD95A55,transparent_26%),radial-gradient(circle_at_86%_8%,#7BE0C355,transparent_24%),linear-gradient(135deg,#FFF7E2_0%,#FFFDF3_48%,#EEF2F5_100%)] px-5 py-6 text-[#102A54]">
      <div className="mx-auto max-w-5xl">
        <nav className="flex items-center justify-between gap-4">
          <BrandMark />
          <Link
            href="/admin/login"
            className="rounded-full border-2 border-[#102A54] bg-[#FFFEF8] px-4 py-2 text-xs font-black text-[#102A54] shadow-[3px_3px_0_#102A54] transition hover:-translate-y-0.5"
          >
            Admin portal
          </Link>
        </nav>

        <section className="py-10 text-center">
          <p className="inline-flex rounded-full border-2 border-[#102A54] bg-[#FFD95A] px-4 py-2 text-xs font-black uppercase tracking-[0.16em]">
            Student · Parent · Teacher
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            Welcome to AiGenius English Pet Learning
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base font-bold leading-7 text-[#102A54]/65">
            One shared login page for learning, reports, and teaching. Admin
            access is separated for safer centre management.
          </p>
        </section>

        <section className="mx-auto mb-6 max-w-xl rounded-[2rem] border-4 border-[#102A54] bg-[#FFFEF8] p-5 shadow-[8px_8px_0_rgba(16,42,84,0.14)]">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF6B57]">
            Sign in
          </p>
          <form action={loginAction} className="mt-4 grid gap-3">
            <label className="grid gap-2 text-sm font-black">
              Email
              <input
                name="email"
                type="email"
                required
                className="rounded-2xl border-2 border-[#102A54] bg-[#FFF7E2] px-4 py-3 text-sm font-bold outline-none focus:bg-white"
                placeholder="teacher@student-parent.test"
              />
            </label>
            <label className="grid gap-2 text-sm font-black">
              Password
              <input
                name="password"
                type="password"
                required
                className="rounded-2xl border-2 border-[#102A54] bg-[#FFF7E2] px-4 py-3 text-sm font-bold outline-none focus:bg-white"
                placeholder="Password"
              />
            </label>
            {error ? (
              <p className="rounded-2xl border-2 border-[#102A54] bg-[#FFB199] p-3 text-sm font-black text-[#102A54]">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              className="rounded-2xl border-2 border-[#102A54] bg-[#FFD95A] px-5 py-4 text-sm font-black shadow-[4px_4px_0_#102A54] transition hover:-translate-y-0.5"
            >
              Login and continue
            </button>
          </form>
          <div className="mt-5 rounded-2xl border-2 border-[#102A54]/20 bg-[#EEF2F5] p-4">
            <p className="text-xs font-black uppercase tracking-wide text-[#102A54]/60">
              Demo login
            </p>
            <div className="mt-3 grid gap-2 text-sm font-bold text-[#102A54]/75">
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

        <div className="grid gap-4 lg:grid-cols-3">
          {roles.map((role) => (
            <div
              key={role.name}
              className="rounded-[1.8rem] border-4 border-[#102A54] bg-[#FFFEF8] p-5 shadow-[6px_6px_0_rgba(16,42,84,0.14)]"
            >
              <div
                className={`grid h-16 w-16 place-items-center rounded-[1.3rem] border-2 border-[#102A54] ${role.accent} text-2xl font-black shadow-[4px_4px_0_#102A54]`}
              >
                {role.name.slice(0, 1)}
              </div>
              <h2 className="mt-5 text-2xl font-black">{role.name}</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-[#102A54]/65">
                {role.description}
              </p>
              <p className="mt-5 inline-flex rounded-full border-2 border-[#102A54] bg-[#FFF7E2] px-4 py-2 text-sm font-black">
                Redirects to {role.href}
              </p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-xl text-center text-xs font-bold leading-6 text-[#102A54]/55">
          Admin users should use the separate admin portal. This keeps student,
          parent, and teacher login simple while protecting centre operations.
        </p>
      </div>
    </main>
  );
}
