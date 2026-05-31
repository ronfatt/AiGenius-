import Link from "next/link";
import { BrandMark } from "@/components/ui";
import { demoAuthPassword } from "@/lib/demo-auth";
import { adminLoginAction } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <main className="min-h-screen bg-[#FFF7E2] bg-[radial-gradient(circle_at_10%_10%,#4FB8FF44,transparent_26%),radial-gradient(circle_at_88%_12%,#FFD95A66,transparent_24%),linear-gradient(135deg,#FFF7E2_0%,#FFFDF3_48%,#EEF2F5_100%)] px-5 py-6 text-[#102A54]">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-5xl content-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <section>
          <BrandMark />
          <p className="mt-10 inline-flex rounded-full border-2 border-[#102A54] bg-[#4FB8FF] px-4 py-2 text-xs font-black uppercase tracking-[0.16em]">
            Admin only
          </p>
          <h1 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">
            Centre command access
          </h1>
          <p className="mt-4 max-w-xl text-base font-bold leading-7 text-[#102A54]/65">
            This portal is reserved for AiGenius centre admins. Student, parent,
            and teacher users should sign in through the main login page.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-full border-2 border-[#102A54] bg-[#FFFEF8] px-5 py-3 text-sm font-black shadow-[4px_4px_0_#102A54] transition hover:-translate-y-0.5"
          >
            Back to main login
          </Link>
        </section>

        <section className="rounded-[2rem] border-4 border-[#102A54] bg-[#FFFEF8] p-6 shadow-[8px_8px_0_rgba(16,42,84,0.16)]">
          <div className="rounded-[1.5rem] border-2 border-[#102A54] bg-[#FFF7E2] p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF6B57]">
              Secure admin sign in
            </p>
            <h2 className="mt-2 text-3xl font-black">Admin Login</h2>
            <p className="mt-2 text-sm font-bold leading-6 text-[#102A54]/60">
              Frontend mockup for now. Supabase Auth will later verify
              the admin role before entering the admin dashboard.
            </p>
          </div>

          <form action={adminLoginAction} className="mt-5 grid gap-3">
            <label className="grid gap-2 text-sm font-black">
              Admin email
              <input
                name="email"
                className="rounded-2xl border-2 border-[#102A54] bg-[#FFF7E2] px-4 py-3 text-sm font-bold outline-none focus:bg-white"
                placeholder="admin@aigenius.test"
                type="email"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-black">
              Password
              <input
                name="password"
                className="rounded-2xl border-2 border-[#102A54] bg-[#FFF7E2] px-4 py-3 text-sm font-bold outline-none focus:bg-white"
                placeholder="Admin password"
                type="password"
                required
              />
            </label>
            {error ? (
              <p className="rounded-2xl border-2 border-[#102A54] bg-[#FFB199] p-3 text-sm font-black text-[#102A54]">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              className="mt-2 rounded-2xl border-2 border-[#102A54] bg-[#FFD95A] px-5 py-4 text-center text-sm font-black shadow-[4px_4px_0_#102A54] transition hover:-translate-y-0.5"
            >
              Login as admin
            </button>
          </form>

          <div className="mt-5 rounded-2xl border-2 border-[#102A54]/20 bg-[#EEF2F5] p-4">
            <p className="text-xs font-black uppercase tracking-wide text-[#102A54]/60">
              Demo admin login
            </p>
            <p className="mt-1 text-sm font-bold leading-6 text-[#102A54]/65">
              admin@aigenius.test / {demoAuthPassword}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
