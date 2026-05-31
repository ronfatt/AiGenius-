import Link from "next/link";
import { BrandMark } from "@/components/ui";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(155deg,#eff6ff_0%,#ffffff_50%,#f5f3ff_100%)] px-5 py-6">
      <div className="mx-auto max-w-xl">
        <BrandMark />
        <section className="mt-10 rounded-[2rem] border border-blue-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-500">
            Account setup
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">Register</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            This is a frontend placeholder. Supabase Auth will be connected in
            the next backend phase.
          </p>
          <div className="mt-6 grid gap-3">
            <input
              className="rounded-2xl border border-blue-100 px-4 py-3 text-sm font-bold outline-none focus:border-blue-400"
              placeholder="Full name"
            />
            <input
              className="rounded-2xl border border-blue-100 px-4 py-3 text-sm font-bold outline-none focus:border-blue-400"
              placeholder="Email"
            />
            <input
              className="rounded-2xl border border-blue-100 px-4 py-3 text-sm font-bold outline-none focus:border-blue-400"
              placeholder="Password"
              type="password"
            />
            <button className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white">
              Create account mockup
            </button>
          </div>
          <Link
            href="/login"
            className="mt-5 inline-flex text-sm font-black text-blue-700"
          >
            Back to login
          </Link>
        </section>
      </div>
    </main>
  );
}
