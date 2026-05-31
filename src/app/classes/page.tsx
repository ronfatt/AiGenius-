import { StudentCard } from "@/components/cards/StudentCard";
import { StatCard } from "@/components/cards/StatCard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getClassTeacherName } from "@/lib/dashboard-data";
import { classes, students } from "@/lib/mock-data";

export default function ClassesPage() {
  return (
    <DashboardShell title="Class Management">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active classes" value={classes.length} />
        <StatCard label="Enrolled students" value={students.length} />
        <StatCard label="Today lessons" value="3" />
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
              {classGroup.studentIds.length} students · {getClassTeacherName(classGroup)}
            </p>
          </section>
        ))}
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {students.map((student) => (
          <StudentCard key={student.id} student={student} />
        ))}
      </div>
    </DashboardShell>
  );
}
