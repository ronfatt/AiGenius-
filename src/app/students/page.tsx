import { StudentCard } from "@/components/cards/StudentCard";
import { StatCard } from "@/components/cards/StatCard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { students } from "@/lib/mock-data";

export default function StudentsPage() {
  const averageAttendance = Math.round(
    students.reduce((total, student) => total + student.attendanceRate, 0) /
      students.length,
  );
  const averageHomework = Math.round(
    students.reduce((total, student) => total + student.homeworkCompletionRate, 0) /
      students.length,
  );

  return (
    <DashboardShell title="Student Profiles">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Students" value={students.length} />
        <StatCard label="Average attendance" value={`${averageAttendance}%`} />
        <StatCard label="Homework rate" value={`${averageHomework}%`} />
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {students.map((student) => (
          <StudentCard key={student.id} student={student} />
        ))}
      </div>
    </DashboardShell>
  );
}
