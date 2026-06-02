import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, ListRow, StatCard } from "@/components/ui";
import { getCurrentProfile } from "@/lib/auth";
import { getClassTeacherName, getStudentName } from "@/lib/dashboard-data";
import { classrooms, students, users } from "@/lib/mock-data";
import { getSupabaseServiceRoleClient, isSupabaseConfigured } from "@/lib/supabase";
import {
  assignStudentToClassAction,
  createClassAction,
  createUserByAdminAction,
} from "../actions";

type AdminSetupPageProps = {
  searchParams?: Promise<{ status?: string; error?: string }>;
};

type TeacherOption = {
  id: string;
  name: string;
  email: string;
};

type StudentOption = {
  id: string;
  userId: string;
  name: string;
  schoolGrade: string;
  referralCode: string | null;
};

type ClassOption = {
  id: string;
  name: string;
  grade: string;
  subject: string;
  schedule: string;
  teacherId: string;
  teacherName: string;
  studentCount: number;
};

type SetupData = {
  live: boolean;
  teachers: TeacherOption[];
  students: StudentOption[];
  classes: ClassOption[];
};

type DbProfile = {
  id: string;
  name: string;
  email: string;
};

type DbStudentProfile = {
  id: string;
  user_id: string;
  school_grade: string;
  referral_code: string | null;
};

type DbClassroom = {
  id: string;
  name: string;
  grade: string;
  subject: string;
  schedule: string;
  teacher_id: string;
};

type DbClassroomStudent = {
  classroom_id: string;
  student_id: string;
};

async function getAdminSetupData(): Promise<SetupData> {
  const fallbackTeachers = users
    .filter((user) => user.role === "teacher")
    .map((teacher) => ({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
    }));
  const fallbackStudents = students.map((student) => ({
    id: student.id,
    userId: student.userId,
    name: getStudentName(student),
    schoolGrade: student.schoolGrade,
    referralCode: student.referralCode,
  }));
  const fallbackClasses = classrooms.map((classroom) => ({
    id: classroom.id,
    name: classroom.name,
    grade: classroom.grade,
    subject: classroom.subject,
    schedule: classroom.schedule,
    teacherId: classroom.teacherId,
    teacherName: getClassTeacherName(classroom),
    studentCount: classroom.studentIds.length,
  }));

  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      live: false,
      teachers: fallbackTeachers,
      students: fallbackStudents,
      classes: fallbackClasses,
    };
  }

  const profile = await getCurrentProfile().catch(() => null);
  if (!profile || profile.role !== "admin") {
    return {
      live: false,
      teachers: fallbackTeachers,
      students: fallbackStudents,
      classes: fallbackClasses,
    };
  }

  try {
    const supabase = getSupabaseServiceRoleClient();
    const [teachersResult, studentProfilesResult, studentUsersResult, classesResult, linksResult] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("id,name,email")
          .eq("role", "teacher")
          .returns<DbProfile[]>(),
        supabase
          .from("student_profiles")
          .select("id,user_id,school_grade,referral_code")
          .returns<DbStudentProfile[]>(),
        supabase
          .from("profiles")
          .select("id,name,email")
          .eq("role", "student")
          .returns<DbProfile[]>(),
        supabase
          .from("classrooms")
          .select("id,name,grade,subject,schedule,teacher_id")
          .returns<DbClassroom[]>(),
        supabase
          .from("classroom_students")
          .select("classroom_id,student_id")
          .returns<DbClassroomStudent[]>(),
      ]);

    if (teachersResult.error || studentProfilesResult.error || classesResult.error) {
      return {
        live: false,
        teachers: fallbackTeachers,
        students: fallbackStudents,
        classes: fallbackClasses,
      };
    }

    const teacherProfiles = teachersResult.data ?? [];
    const studentUsersById = new Map(
      (studentUsersResult.data ?? []).map((student) => [student.id, student]),
    );
    const teacherNamesById = new Map(
      teacherProfiles.map((teacher) => [teacher.id, teacher.name]),
    );
    const classLinks = linksResult.data ?? [];

    return {
      live: true,
      teachers: teacherProfiles.map((teacher) => ({
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
      })),
      students: (studentProfilesResult.data ?? []).map((student) => ({
        id: student.id,
        userId: student.user_id,
        name: studentUsersById.get(student.user_id)?.name ?? "Student",
        schoolGrade: student.school_grade,
        referralCode: student.referral_code,
      })),
      classes: (classesResult.data ?? []).map((classroom) => ({
        id: classroom.id,
        name: classroom.name,
        grade: classroom.grade,
        subject: classroom.subject,
        schedule: classroom.schedule,
        teacherId: classroom.teacher_id,
        teacherName: teacherNamesById.get(classroom.teacher_id) ?? "Teacher",
        studentCount: classLinks.filter((link) => link.classroom_id === classroom.id).length,
      })),
    };
  } catch {
    return {
      live: false,
      teachers: fallbackTeachers,
      students: fallbackStudents,
      classes: fallbackClasses,
    };
  }
}

export default async function AdminSetupPage({ searchParams }: AdminSetupPageProps) {
  const data = await getAdminSetupData();
  const message = await searchParams;

  return (
    <DashboardShell title="Admin Centre Setup" variant="admin">
      {message?.status || message?.error ? (
        <div
          className={`mb-4 rounded-2xl border-2 border-[#102A54] px-4 py-3 text-sm font-black ${
            message.error ? "bg-[#FFB199]" : "bg-[#7BE0C3]"
          }`}
        >
          {message.error ?? message.status}
        </div>
      ) : null}

      <section className="mb-5 rounded-[2rem] border-4 border-[#102A54] bg-[#FFFEF8] p-5 shadow-[8px_8px_0_rgba(16,42,84,0.12)]">
        <p className="inline-flex rounded-full border-2 border-[#102A54] bg-[#4FB8FF] px-3 py-1 text-xs font-black uppercase tracking-[0.16em]">
          Centre setup · {data.live ? "Live Supabase" : "Mock fallback"}
        </p>
        <h1 className="mt-3 text-4xl font-black text-[#102A54]">
          Manage AiGenius English Centre
        </h1>
        <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-[#102A54]/65">
          Create classes, assign teachers, and place students into class groups.
          This powers Teacher Task Planner and the student quest board.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard value={data.teachers.length.toString()} label="Teachers" />
        <StatCard value={data.classes.length.toString()} label="Classes" />
        <StatCard value={data.students.length.toString()} label="Students" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="bg-gradient-to-br from-[#FFF7E2] to-[#FFD95A]/25 xl:col-span-2">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF6B57]">
            Account creator
          </p>
          <h2 className="mt-2 text-2xl font-black">Create teacher, student, or parent</h2>
          <form action={createUserByAdminAction} className="mt-4 grid gap-3 lg:grid-cols-6">
            <input
              name="name"
              placeholder="Full name"
              className="min-h-12 rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] px-4 text-sm font-bold text-[#102A54] outline-none lg:col-span-2"
            />
            <input
              name="email"
              type="email"
              placeholder="email@example.com"
              className="min-h-12 rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] px-4 text-sm font-bold text-[#102A54] outline-none lg:col-span-2"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="min-h-12 rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] px-4 text-sm font-bold text-[#102A54] outline-none"
            />
            <select
              name="role"
              className="min-h-12 rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] px-4 text-sm font-bold text-[#102A54] outline-none"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="parent">Parent</option>
            </select>
            <select
              name="schoolGrade"
              className="min-h-12 rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] px-4 text-sm font-bold text-[#102A54] outline-none lg:col-span-2"
            >
              {["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"].map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!data.live}
              className="min-h-12 rounded-2xl border-2 border-[#102A54] bg-[#FFD95A] px-5 text-sm font-black shadow-[4px_4px_0_#102A54] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 lg:col-span-4"
            >
              Create account
            </button>
          </form>
        </Card>

        <Card className="bg-gradient-to-br from-[#FFF7E2] to-[#4FB8FF]/20">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF6B57]">
            Class builder
          </p>
          <h2 className="mt-2 text-2xl font-black">Create class</h2>
          <form action={createClassAction} className="mt-4 grid gap-3">
            <input
              name="name"
              placeholder="Year 4 English Quest"
              className="min-h-12 rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] px-4 text-sm font-bold text-[#102A54] outline-none"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                name="teacherId"
                className="min-h-12 rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] px-4 text-sm font-bold text-[#102A54] outline-none"
              >
                <option value="">Choose teacher</option>
                {data.teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
              <select
                name="grade"
                className="min-h-12 rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] px-4 text-sm font-bold text-[#102A54] outline-none"
              >
                {["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"].map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                name="subject"
                defaultValue="English"
                className="min-h-12 rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] px-4 text-sm font-bold text-[#102A54] outline-none"
              />
              <input
                name="schedule"
                placeholder="Mon and Wed, 4:00 PM"
                className="min-h-12 rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] px-4 text-sm font-bold text-[#102A54] outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!data.live}
              className="min-h-14 rounded-2xl border-2 border-[#102A54] bg-[#FFD95A] px-5 text-sm font-black shadow-[4px_4px_0_#102A54] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Create class
            </button>
          </form>
        </Card>

        <Card className="bg-gradient-to-br from-[#FFF7E2] to-[#7BE0C3]/25">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF6B57]">
            Class assignment
          </p>
          <h2 className="mt-2 text-2xl font-black">Add student to class</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-[#102A54]/65">
            Assigning a student also adds the class teacher to the student monitor group.
          </p>
          <form action={assignStudentToClassAction} className="mt-4 grid gap-3">
            <select
              name="classroomId"
              className="min-h-12 rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] px-4 text-sm font-bold text-[#102A54] outline-none"
            >
              <option value="">Choose class</option>
              {data.classes.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name} · {classroom.grade}
                </option>
              ))}
            </select>
            <select
              name="studentId"
              className="min-h-12 rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] px-4 text-sm font-bold text-[#102A54] outline-none"
            >
              <option value="">Choose student</option>
              {data.students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} · {student.schoolGrade} · {student.referralCode ?? "No code"}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!data.live}
              className="min-h-14 rounded-2xl border-2 border-[#102A54] bg-[#7BE0C3] px-5 text-sm font-black shadow-[4px_4px_0_#102A54] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Assign student
            </button>
          </form>
        </Card>
      </div>

      {!data.live ? (
        <div className="mt-4 rounded-2xl border-2 border-[#102A54] bg-[#FFD95A] px-4 py-3 text-sm font-black text-[#102A54]">
          Demo data is showing. Login as admin with Supabase configured to enable class creation and
          student assignment.
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card>
          <h2 className="text-2xl font-black">Teachers</h2>
          <div className="mt-4 grid gap-3">
            {data.teachers.map((teacher) => (
              <ListRow key={teacher.id} title={teacher.name} meta={teacher.email} badge="Teacher" />
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-black">Classes</h2>
          <div className="mt-4 grid gap-3">
            {data.classes.map((classroom) => (
              <ListRow
                key={classroom.id}
                title={classroom.name}
                meta={`${classroom.teacherName} · ${classroom.schedule} · ${classroom.studentCount} students`}
                badge={classroom.grade}
              />
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-black">Students</h2>
          <div className="mt-4 grid gap-3">
            {data.students.slice(0, 8).map((student) => (
              <ListRow
                key={student.id}
                title={student.name}
                meta={`${student.schoolGrade} · Code ${student.referralCode ?? "pending"}`}
                badge="Student"
              />
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4 bg-gradient-to-br from-[#FFF7E2] to-[#7BE0C3]/40">
        <h2 className="text-2xl font-black">Setup flow</h2>
        <p className="mt-3 text-sm font-bold leading-6 text-[#102A54]/65">
          Recommended order: create teacher account, create class, assign students, publish English
          tasks, then monitor submissions in Teacher Review Queue.
        </p>
      </Card>
    </DashboardShell>
  );
}
