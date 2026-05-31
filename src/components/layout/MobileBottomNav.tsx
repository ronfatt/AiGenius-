import Link from "next/link";

const mobileNavItems = [
  { href: "/student", label: "Home", icon: "H" },
  { href: "/student/tasks", label: "Quest", icon: "Q" },
  { href: "/student/explore", label: "Explore", icon: "E" },
  { href: "/student/cards", label: "Cards", icon: "C" },
  { href: "/battle", label: "Battle", icon: "B" },
];

export function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t-4 border-[#102A54] bg-[#FFFEF8]/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.55rem)] pt-2 shadow-[0_-6px_0_rgba(16,42,84,0.08)] backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-2">
        {mobileNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="grid min-h-14 place-items-center rounded-2xl border-2 border-transparent px-1 text-center text-[0.68rem] font-black text-[#102A54] transition active:scale-95 active:border-[#102A54] active:bg-[#FFD95A]"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-[#102A54] bg-[#FFF7E2] text-xs shadow-[2px_2px_0_rgba(16,42,84,0.18)]">
              {item.icon}
            </span>
            <span className="mt-1 leading-none">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
