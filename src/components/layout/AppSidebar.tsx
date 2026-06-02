import Link from "next/link";
import Image from "next/image";
import type { DashboardVariant } from "./DashboardShell";

const navItems = [
  { href: "/admin", label: "Admin" },
  { href: "/teacher", label: "Teacher" },
  { href: "/student", label: "Student" },
  { href: "/student/tasks", label: "My Quests" },
  { href: "/student/explore", label: "Pet Explore" },
  { href: "/student/cards", label: "Blind Boxes" },
  { href: "/parent", label: "Parent" },
  { href: "/parent/report", label: "Parent Report" },
  { href: "/classes", label: "Classes" },
  { href: "/students", label: "Students" },
  { href: "/tasks", label: "Tasks" },
  { href: "/teacher/tasks/create", label: "Task Planner" },
  { href: "/teacher/reviews", label: "Review Queue" },
  { href: "/admin/setup", label: "Centre Setup" },
  { href: "/rewards", label: "Rewards" },
  { href: "/pets", label: "Pets" },
  { href: "/cards", label: "Cards" },
  { href: "/battle", label: "Battle" },
  { href: "/reports", label: "Reports" },
];

const sidebarStyles: Record<DashboardVariant, string> = {
  default: "border-[#102A54] bg-[#FFFEF8]/92 shadow-[8px_0_0_rgba(16,42,84,0.08)]",
  teacher: "border-[#4FB8FF]/40 bg-[#071E63]/92 shadow-[8px_0_24px_rgba(0,0,0,0.22)]",
  parent: "border-[#D8E4F0] bg-white/94 shadow-[8px_0_24px_rgba(16,42,84,0.06)]",
  admin: "border-[#FFCF17]/35 bg-[#07111F]/94 shadow-[8px_0_24px_rgba(0,0,0,0.28)]",
};

const textStyles: Record<DashboardVariant, string> = {
  default: "text-[#102A54]",
  teacher: "text-white",
  parent: "text-[#102A54]",
  admin: "text-white",
};

const mutedStyles: Record<DashboardVariant, string> = {
  default: "text-[#102A54]/60",
  teacher: "text-white/58",
  parent: "text-[#102A54]/55",
  admin: "text-white/58",
};

const linkStyles: Record<DashboardVariant, string> = {
  default:
    "text-[#102A54] hover:border-[#102A54] hover:bg-[#FFD95A] hover:shadow-[3px_3px_0_#102A54]",
  teacher:
    "text-white/78 hover:border-[#4FB8FF] hover:bg-white/10 hover:text-white",
  parent:
    "text-[#102A54]/74 hover:border-[#D8E4F0] hover:bg-[#EEF6FF] hover:text-[#102A54]",
  admin:
    "text-white/76 hover:border-[#FFCF17] hover:bg-white/10 hover:text-white",
};

export function AppSidebar({ variant = "default" }: { variant?: DashboardVariant }) {
  return (
    <aside className={`hidden w-72 shrink-0 border-r p-5 backdrop-blur lg:block ${sidebarStyles[variant]}`}>
      <Link href="/" className="flex items-center gap-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/30 bg-white shadow-[0_10px_24px_rgba(0,0,0,0.16)]">
          <Image
            src="/aigenius-logo.png"
            alt="AiGenius Tuition Centre"
            width={96}
            height={96}
            className="h-full w-full object-cover"
            priority
          />
        </div>
        <div>
          <p className={`text-sm font-black ${textStyles[variant]}`}>AiGenius</p>
          <p className={`text-xs font-bold ${mutedStyles[variant]}`}>Pet Learning</p>
        </div>
      </Link>
      <nav className="mt-8 grid gap-2">
        {navItems.map((item) => (
          <Link
            href={item.href}
            key={item.href}
            className={`rounded-2xl border border-transparent px-4 py-3 text-sm font-black transition hover:-translate-y-0.5 ${linkStyles[variant]}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
