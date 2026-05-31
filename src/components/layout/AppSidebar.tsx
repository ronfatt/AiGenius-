import Link from "next/link";
import Image from "next/image";

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
  { href: "/admin/setup", label: "Centre Setup" },
  { href: "/rewards", label: "Rewards" },
  { href: "/pets", label: "Pets" },
  { href: "/cards", label: "Cards" },
  { href: "/battle", label: "Battle" },
  { href: "/reports", label: "Reports" },
];

export function AppSidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r-4 border-[#102A54] bg-[#FFFEF8]/92 p-5 shadow-[8px_0_0_rgba(16,42,84,0.08)] backdrop-blur lg:block">
      <Link href="/" className="flex items-center gap-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-[#102A54] bg-white shadow-[4px_4px_0_#102A54]">
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
          <p className="text-sm font-black text-[#102A54]">AiGenius</p>
          <p className="text-xs font-bold text-[#102A54]/60">Pet Learning</p>
        </div>
      </Link>
      <nav className="mt-8 grid gap-2">
        {navItems.map((item) => (
          <Link
            href={item.href}
            key={item.href}
            className="rounded-2xl border-2 border-transparent px-4 py-3 text-sm font-black text-[#102A54] transition hover:-translate-y-0.5 hover:border-[#102A54] hover:bg-[#FFD95A] hover:shadow-[3px_3px_0_#102A54]"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
