import { notFound } from "next/navigation";
import { PetCard } from "@/components/cards/PetCard";
import { ProgressChart } from "@/components/charts/ProgressChart";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, ListRow, StatCard } from "@/components/ui";
import { getCefrTargetForGrade } from "@/lib/cefr-level";
import { getStudentName, getStudentPet } from "@/lib/dashboard-data";
import {
  detectLearningGap,
  recommendNextTasks,
  recommendTeacherIntervention,
} from "@/lib/learning-level";
import { students, subjectSkills } from "@/lib/mock-data";

export default async function TeacherStudentDiagnosisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = students.find((item) => item.id === id);
  if (!student) notFound();

  const skills = subjectSkills.filter((skill) => skill.studentId === student.id);
  const weakSkills = skills.filter((skill) => skill.masteryPercentage < 60);
  const masteredSkills = skills.filter((skill) => skill.masteryPercentage >= 85);
  const gap = detectLearningGap(student.schoolGrade, student.actualLearningLevel);
  const recommendations = recommendNextTasks(student, skills);
  const intervention = recommendTeacherIntervention(student, skills);
  const pet = getStudentPet(student);

  return (
    <DashboardShell title="English Skill Diagnosis" variant="teacher">
      <section className="mb-5 rounded-[2rem] border-4 border-[#102A54] bg-[#FFFEF8] p-5 shadow-[8px_8px_0_rgba(16,42,84,0.12)]">
        <p className="inline-flex rounded-full border-2 border-[#102A54] bg-[#7BE0C3] px-3 py-1 text-xs font-black uppercase tracking-[0.16em]">
          Teacher diagnosis
        </p>
        <h1 className="mt-3 text-4xl font-black text-[#102A54]">{getStudentName(student)}</h1>
        <p className="mt-2 text-sm font-bold leading-6 text-[#102A54]/65">
          English-first diagnosis with school grade, actual level, CEFR target,
          weak skills, mastered skills, and teacher intervention suggestion.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard value={student.schoolGrade} label="School grade" />
        <StatCard value={student.actualLearningLevel} label="Actual level" />
        <StatCard value={student.targetLearningLevel} label="Target level" />
        <StatCard value={getCefrTargetForGrade(student.schoolGrade)} label="CEFR target" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <h2 className="text-2xl font-black">Learning gap</h2>
          <p className="mt-3 rounded-2xl border-2 border-[#102A54]/20 bg-[#FFF7E2] p-4 text-sm font-bold leading-6 text-[#102A54]/70">
            {gap.recommendation}
          </p>
          <div className="mt-5 grid gap-5">
            {skills.map((skill) => (
              <ProgressChart key={skill.id} label={skill.skillName} value={skill.masteryPercentage} />
            ))}
          </div>
        </Card>
        <PetCard pet={pet} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card>
          <h2 className="text-2xl font-black">Weak skills</h2>
          <div className="mt-4 grid gap-3">
            {(weakSkills.length ? weakSkills : skills.slice(0, 2)).map((skill) => (
              <ListRow key={skill.id} title={skill.skillName} meta={skill.weaknessTag} badge={`${skill.masteryPercentage}%`} />
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-black">Mastered skills</h2>
          <div className="mt-4 grid gap-3">
            {(masteredSkills.length ? masteredSkills : skills.slice(-2)).map((skill) => (
              <ListRow key={skill.id} title={skill.skillName} meta="Ready for extension" badge={`${skill.masteryPercentage}%`} />
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-black">Teacher intervention</h2>
          <p className="mt-3 rounded-2xl border-2 border-[#102A54]/20 bg-[#FFF7E2] p-4 text-sm font-bold leading-6 text-[#102A54]/70">
            {intervention.message}
          </p>
          <div className="mt-4 grid gap-3">
            {recommendations.slice(0, 3).map((task) => (
              <ListRow key={`${task.subject}-${task.skillName}`} title={task.skillName} meta={task.reason} badge={task.taskType} />
            ))}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
