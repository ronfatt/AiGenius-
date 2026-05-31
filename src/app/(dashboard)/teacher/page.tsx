import Link from "next/link";
import { ProgressChart } from "@/components/charts/ProgressChart";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ActionButton, Card, ListRow, StatCard } from "@/components/ui";
import {
  getClassTeacherName,
  getStudentName,
  getTaskTitle,
  getTeacherDashboard,
} from "@/lib/dashboard-data";

export default function TeacherDashboard() {
  const dashboard = getTeacherDashboard();

  return (
    <DashboardShell title="Teacher Dashboard">
      <section className="mb-5 flex flex-col justify-between gap-4 rounded-[2rem] border-4 border-[#102A54] bg-[#FFFEF8] p-5 shadow-[8px_8px_0_rgba(16,42,84,0.12)] lg:flex-row lg:items-center">
        <div>
          <p className="inline-flex rounded-full border-2 border-[#102A54] bg-[#7BE0C3] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#102A54]">
            Teacher command desk
          </p>
          <h2 className="mt-3 text-3xl font-black text-[#102A54]">
            Welcome, {dashboard.teacher?.name ?? "Teacher"}
          </h2>
          <p className="mt-2 text-sm font-bold text-[#102A54]/65">
            Spot weak students, review submissions, and reward progress fast.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/teacher/tasks/create"
            className="grid min-h-14 place-items-center rounded-2xl border-2 border-[#102A54] bg-[#4FB8FF] px-5 text-sm font-black text-[#102A54] shadow-[4px_4px_0_#102A54] transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#102A54]"
          >
            Assign task
          </Link>
          <ActionButton tone="purple">Reward student</ActionButton>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard value={dashboard.summary.classCount.toString()} label="Classes" />
        <StatCard value={dashboard.summary.studentCount.toString()} label="Students" />
        <StatCard value={`${dashboard.summary.homeworkCompletion}%`} label="Homework" />
        <StatCard value={dashboard.pendingSubmissions.length.toString()} label="Pending reviews" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black">Class overview</h2>
            <span className="rounded-full border-2 border-[#102A54] bg-[#FFD95A] px-3 py-1 text-xs font-black text-[#102A54]">
              {dashboard.tasks.length} tasks
            </span>
          </div>
          <div className="mt-4 grid gap-3">
            {dashboard.classes.map((classroom) => (
              <ListRow
                key={classroom.id}
                title={classroom.name}
                meta={`${classroom.subject} · ${classroom.studentIds.length} students · ${getClassTeacherName(classroom)}`}
                badge={classroom.grade}
              />
            ))}
          </div>
        </Card>

        <Card className="bg-[#FFF7E2]">
          <h2 className="text-2xl font-black text-[#102A54]">Weak students alert</h2>
          <div className="mt-4 grid gap-3">
            {dashboard.weakStudents.slice(0, 3).map((student) => (
              <ListRow
                key={student.id}
                title={getStudentName(student)}
                meta={`${student.homeworkCompletionRate}% homework · ${student.attendanceRate}% attendance`}
                badge="Check"
              />
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card>
          <h2 className="text-2xl font-black">Students list</h2>
          <div className="mt-4 grid gap-3">
            {dashboard.students.slice(0, 5).map((student) => (
              <Link key={student.id} href={`/teacher/students/${student.id}`} className="block transition hover:-translate-y-0.5">
                <ListRow
                  title={getStudentName(student)}
                  meta={`${student.actualLearningLevel} · ${student.starCoins} coins`}
                  badge={`${student.totalXP} XP`}
                />
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-black">Top progress students</h2>
          <div className="mt-4 grid gap-3">
            {dashboard.topStudents.map((student) => (
              <ListRow
                key={student.id}
                title={getStudentName(student)}
                meta={`${student.homeworkCompletionRate}% homework`}
                badge={`${student.totalXP} XP`}
              />
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-black">Pending task submissions</h2>
          <div className="mt-4 grid gap-3">
            {dashboard.pendingSubmissions.map((submission) => (
              <ListRow
                key={submission.id}
                title={getTaskTitle(submission.taskId)}
                meta={`${getStudentName(
                  dashboard.students.find(
                    (student) => student.id === submission.studentId,
                  ) ?? dashboard.students[0],
                )} · score ${submission.score}`}
                badge="Review"
              />
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h2 className="text-2xl font-black">Class XP leaderboard</h2>
          <div className="mt-4 grid gap-3">
            {dashboard.leaderboard.map((student, index) => (
              <ListRow
                key={student.id}
                title={`#${index + 1} ${getStudentName(student)}`}
                meta={`${student.streakDays} day streak`}
                badge={`${student.totalXP} XP`}
              />
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-black">Subject mastery overview</h2>
          <div className="mt-5 grid gap-5">
            {dashboard.subjectMastery.map((item) => (
              <ProgressChart
                key={item.subject}
                label={item.subject}
                value={item.mastery}
              />
            ))}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
