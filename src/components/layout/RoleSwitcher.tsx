import Link from "next/link";
import type { DashboardVariant } from "./DashboardShell";

const roles = [
  { href: "/admin", label: "A" },
  { href: "/teacher", label: "T" },
  { href: "/student", label: "S" },
  { href: "/parent", label: "P" },
];

export function RoleSwitcher({ variant = "default" }: { variant?: DashboardVariant }) {
  const dark = variant === "teacher" || variant === "admin";

  return (
    <div
      className={`hidden rounded-full border p-1 sm:flex ${
        dark
          ? "border-white/20 bg-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.16)]"
          : "border-[#D8E4F0] bg-[#FFFEF8] shadow-[0_8px_20px_rgba(16,42,84,0.08)]"
      }`}
    >
      {roles.map((role) => (
        <Link
          href={role.href}
          key={role.href}
          className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black hover:bg-[#7BE0C3] ${
            dark ? "text-white hover:text-[#102A54]" : "text-[#102A54]"
          }`}
          title={`${role.label} dashboard`}
        >
          {role.label}
        </Link>
      ))}
    </div>
  );
}
