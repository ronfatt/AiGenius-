import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, ListRow, StatCard } from "@/components/ui";
import { classrooms, students, users } from "@/lib/mock-data";
import { getClassTeacherName, getStudentName } from "@/lib/dashboard-data";

export default function AdminSetupPage() {
  const teachers = users.filter((user) => user.role === "teacher");

  return (
    <DashboardShell title="Admin Centre Setup">
      <section className="mb-5 rounded-[2rem] border-4 border-[#102A54] bg-[#FFFEF8] p-5 shadow-[8px_8px_0_rgba(16,42,84,0.12)]">
        <p className="inline-flex rounded-full border-2 border-[#102A54] bg-[#4FB8FF] px-3 py-1 text-xs font-black uppercase tracking-[0.16em]">
          Centre setup
        </p>
        <h1 className="mt-3 text-4xl font-black text-[#102A54]">Manage AiGenius English Centre</h1>
        <p className="mt-2 text-sm font-bold text-[#102A54]/65">
          Mock setup page for teachers, classes, student assignments, and subscription planning.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard value={teachers.length.toString()} label="Teachers" />
        <StatCard value={classrooms.length.toString()} label="Classes" />
        <StatCard value={students.length.toString()} label="Students" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card>
          <h2 className="text-2xl font-black">Manage teachers</h2>
          <div className="mt-4 grid gap-3">
            {teachers.map((teacher) => (
              <ListRow key={teacher.id} title={teacher.name} meta={teacher.email} badge="Teacher" />
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-black">Manage classes</h2>
          <div className="mt-4 grid gap-3">
            {classrooms.map((classroom) => (
              <ListRow key={classroom.id} title={classroom.name} meta={`${getClassTeacherName(classroom)} · ${classroom.schedule}`} badge={classroom.grade} />
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-black">Assign students</h2>
          <div className="mt-4 grid gap-3">
            {students.slice(0, 5).map((student) => (
              <ListRow key={student.id} title={getStudentName(student)} meta={student.schoolGrade} badge="Assign" />
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4 bg-gradient-to-br from-[#FFF7E2] to-[#7BE0C3]/40">
        <h2 className="text-2xl font-black">Subscription placeholder</h2>
        <p className="mt-3 text-sm font-bold leading-6 text-[#102A54]/65">
          Future billing panel for active seats, plan renewal, centre owner, and AI usage limits.
        </p>
      </Card>
    </DashboardShell>
  );
}
