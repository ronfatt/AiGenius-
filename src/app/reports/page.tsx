import { StatCard } from "@/components/cards/StatCard";
import { ProgressChart } from "@/components/charts/ProgressChart";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { reports } from "@/lib/mock-data";

export default function ReportsPage() {
  const report = reports[0];
  const progress = 84;
  const attendance = 96;
  const homeworkCompletion = 87;

  return (
    <DashboardShell title="Learning Report" variant="parent">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Progress" value={`${progress}%`} />
        <StatCard label="Attendance" value={`${attendance}%`} />
        <StatCard label="Homework" value={`${homeworkCompletion}%`} />
      </div>
      <section className="mt-5 rounded-[1.5rem] border border-blue-100 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-black text-slate-950">{report.month}</h2>
        <div className="mt-5 grid gap-5">
          <ProgressChart label="Learning progress" value={progress} />
          <ProgressChart label="Attendance" value={attendance} />
          <ProgressChart label="Homework completion" value={homeworkCompletion} />
        </div>
        <p className="mt-5 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-900">
          {report.summary}
        </p>
        <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          {report.teacherComment}
        </p>
      </section>
    </DashboardShell>
  );
}
