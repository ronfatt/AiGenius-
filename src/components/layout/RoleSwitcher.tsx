import Link from "next/link";

const roles = [
  { href: "/admin", label: "A" },
  { href: "/teacher", label: "T" },
  { href: "/student", label: "S" },
  { href: "/parent", label: "P" },
];

export function RoleSwitcher() {
  return (
    <div className="hidden rounded-full border-2 border-[#102A54] bg-[#FFFEF8] p-1 shadow-[2px_2px_0_#102A54] sm:flex">
      {roles.map((role) => (
        <Link
          href={role.href}
          key={role.href}
          className="grid h-8 w-8 place-items-center rounded-full text-xs font-black text-[#102A54] hover:bg-[#7BE0C3]"
          title={`${role.label} dashboard`}
        >
          {role.label}
        </Link>
      ))}
    </div>
  );
}
