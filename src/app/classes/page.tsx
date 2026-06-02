import { StatCard } from "@/components/cards/StatCard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getCurrentProfile } from "@/lib/auth";
import { getLiveWorkspaceData } from "@/lib/workspace-data";
import { redirect } from "next/navigation";

export default async function ClassesPage() {
  const profile = await getCurrentProfile();

  if (!profile || (profile.role !== "teacher" && profile.role !== "admin")) {
    redirect("/login?error=Please%20login%20as%20teacher%20or%20admin.");
  }

  const data = await getLiveWorkspaceData(profile);
  const classes = data?.classes ?? [];
  const students = data?.students ?? [];
  const teachersById = Object.fromEntries((data?.teachers ?? []).map((teacher) => [teacher.id, teacher.name]));

  return (
    <DashboardShell title="Class Management" variant="teacher">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active classes" value={classes.length} />
        <StatCard label="Enrolled students" value={students.length} />
        <StatCard label="Data source" value={data?.live ? "Live" : "Offline"} />
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {classes.map((classGroup) => (
          <section
            key={classGroup.id}
            className="rounded-[1.5rem] border border-blue-100 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-black uppercase tracking-wide text-purple-600">
              {classGroup.subject}
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">
              {classGroup.name}
            </h2>
            <p className="mt-2 text-sm font-bold text-slate-500">
              {classGroup.schedule}
            </p>
            <p className="mt-4 text-sm font-black text-blue-700">
              {classGroup.studentIds.length} students · {teachersById[classGroup.teacherId] ?? "Teacher"}
            </p>
          </section>
        ))}
      </div>
      {!classes.length ? (
        <section className="mt-5 rounded-[1.5rem] border-2 border-[#102A54] bg-[#FFFEF8] p-5 text-[#102A54]">
          <h2 className="text-xl font-black">No live classes yet</h2>
          <p className="mt-2 text-sm font-bold text-[#102A54]/65">
            Create classes in Admin Setup or assign this teacher to a class.
          </p>
        </section>
      ) : null}
    </DashboardShell>
  );
}
