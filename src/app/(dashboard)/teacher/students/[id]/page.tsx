import { notFound } from "next/navigation";
import { PetCard } from "@/components/cards/PetCard";
import { ProgressChart } from "@/components/charts/ProgressChart";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, ListRow, StatCard } from "@/components/ui";
import { getCurrentProfile } from "@/lib/auth";
import { getCefrTargetForGrade } from "@/lib/cefr-level";
import { getStudentName, getStudentPet } from "@/lib/dashboard-data";
import {
  detectLearningGap,
  detectWeaknessTags,
  recommendNextTasks,
  recommendTeacherIntervention,
} from "@/lib/learning-level";
import { students, subjectSkills } from "@/lib/mock-data";
import { getTeacherStudentDiagnosisFromSupabase } from "@/lib/teacher-student-diagnosis";

export default async function TeacherStudentDiagnosisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== "teacher" && profile.role !== "admin")) notFound();

  const liveDiagnosis = await getTeacherStudentDiagnosisFromSupabase(profile, id);
  const fallbackStudent = students.find((item) => item.id === id);
  if (!liveDiagnosis && !fallbackStudent) notFound();

  const student = liveDiagnosis?.student ?? fallbackStudent!;
  const studentName = liveDiagnosis?.studentName ?? getStudentName(student);
  const skills =
    liveDiagnosis?.skills ?? subjectSkills.filter((skill) => skill.studentId === student.id);
  const weakSkills = skills.filter((skill) => skill.masteryPercentage < 60);
  const masteredSkills = skills.filter((skill) => skill.masteryPercentage >= 85);
  const gap = detectLearningGap(student.schoolGrade, student.actualLearningLevel);
  const recommendations = recommendNextTasks(student, skills);
  const intervention = recommendTeacherIntervention(student, skills);
  const pet = liveDiagnosis?.pet ?? getStudentPet(student);
  const submissions = liveDiagnosis?.submissions ?? [];
  const reviewedSubmissions = submissions.filter((submission) => submission.status === "reviewed");
  const averageScore = Math.round(
    reviewedSubmissions.reduce((total, submission) => total + submission.score, 0) /
      Math.max(1, reviewedSubmissions.length),
  );
  const weaknessAttempts = detectWeaknessTags(
    reviewedSubmissions.map((submission) => ({
      ...submission,
      skillTags: liveDiagnosis?.tasksById[submission.taskId]?.skillTags ?? [],
      skillName: liveDiagnosis?.tasksById[submission.taskId]?.skillDomain ?? "English",
    })),
  );

  return (
    <DashboardShell title="English Skill Diagnosis" variant="teacher">
      <section className="mb-5 rounded-[2rem] border-4 border-[#102A54] bg-[#FFFEF8] p-5 shadow-[8px_8px_0_rgba(16,42,84,0.12)]">
        <p className="inline-flex rounded-full border-2 border-[#102A54] bg-[#7BE0C3] px-3 py-1 text-xs font-black uppercase tracking-[0.16em]">
          Teacher diagnosis · {liveDiagnosis ? "Live Supabase" : "Demo preview"}
        </p>
        <h1 className="mt-3 text-4xl font-black text-[#102A54]">{studentName}</h1>
        <p className="mt-2 text-sm font-bold leading-6 text-[#102A54]/65">
          English-first diagnosis with school grade, actual level, CEFR target,
          weak skills, mastered skills, and teacher intervention suggestion.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard value={student.schoolGrade} label="School grade" />
        <StatCard value={student.actualLearningLevel} label="Actual level" />
        <StatCard value={student.targetLearningLevel} label="Target level" />
        <StatCard value={liveDiagnosis?.cefrTarget ?? getCefrTargetForGrade(student.schoolGrade)} label="CEFR target" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard value={`${averageScore || 0}%`} label="Reviewed avg score" />
        <StatCard value={reviewedSubmissions.length.toString()} label="Reviewed tasks" />
        <StatCard value={weakSkills.length.toString()} label="Weak skills" />
        <StatCard value={masteredSkills.length.toString()} label="Mastered skills" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <h2 className="text-2xl font-black">Learning gap</h2>
          <p className="mt-3 rounded-2xl border-2 border-[#102A54]/20 bg-[#FFF7E2] p-4 text-sm font-bold leading-6 text-[#102A54]/70">
            {gap.recommendation}
          </p>
          <div className="mt-5 grid gap-5">
            {(skills.length ? skills : []).map((skill) => (
              <ProgressChart key={skill.id} label={skill.skillName} value={skill.masteryPercentage} />
            ))}
          </div>
          {!skills.length ? (
            <p className="mt-5 rounded-2xl border-2 border-[#102A54]/20 bg-[#FFF7E2] p-4 text-sm font-bold leading-6 text-[#102A54]/70">
              No skill records yet. Review the first submitted English quest to generate subject skill signals.
            </p>
          ) : null}
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

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <h2 className="text-2xl font-black">Recent submissions</h2>
          <div className="mt-4 grid gap-3">
            {submissions.length ? (
              submissions.slice(0, 5).map((submission) => {
                const task = liveDiagnosis?.tasksById[submission.taskId];

                return (
                  <ListRow
                    key={submission.id}
                    title={task?.title ?? "English task"}
                    meta={`${submission.score}% · ${submission.status}${submission.teacherFeedback ? ` · ${submission.teacherFeedback}` : ""}`}
                    badge={task?.taskBand ?? "Task"}
                  />
                );
              })
            ) : (
              <ListRow title="No submissions yet" meta="Assign an English quest and ask the student to submit it." badge="Next" />
            )}
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-black">Repeated weakness signals</h2>
          <div className="mt-4 grid gap-3">
            {weaknessAttempts.length ? (
              weaknessAttempts.slice(0, 5).map((weakness) => (
                <ListRow
                  key={weakness.skillName}
                  title={weakness.skillName}
                  meta={`${weakness.attempts} attempt(s), ${weakness.lowScoreCount} low score(s), avg ${weakness.averageScore}%`}
                  badge={weakness.tag}
                />
              ))
            ) : (
              <ListRow title="Not enough attempts yet" meta="Weakness detection becomes stronger after 2-3 reviewed tasks." badge="Monitor" />
            )}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card>
          <h2 className="text-2xl font-black">Recommended next tasks</h2>
          <div className="mt-4 grid gap-3">
            {recommendations.slice(0, 4).map((task) => (
              <ListRow key={`${task.subject}-${task.skillName}-${task.taskType}`} title={task.skillName} meta={task.reason} badge={task.priority} />
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-black">Teacher action plan</h2>
          <div className="mt-4 grid gap-3">
            <ListRow title="First 10 minutes" meta={`Re-teach ${intervention.focusSkills[0] ?? weakSkills[0]?.skillName ?? "the weakest English skill"} with examples.`} badge="Teach" />
            <ListRow title="Practice" meta={`Assign one ${intervention.recommendedTaskBand} task and require correction review.`} badge="Assign" />
            <ListRow title="Parent note" meta="Send one clear home practice action, not a long report." badge="Home" />
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-black">Motivation summary</h2>
          <p className="mt-3 text-sm font-bold leading-6 text-[#102A54]/70">
            Keep pet rewards as encouragement, but make the teaching decision from score trend,
            weak skills, and actual learning level.
          </p>
          <div className="mt-4 grid gap-3">
            <ListRow title="Pet support" meta={`${pet.name} is Level ${pet.level}; use rewards for consistency.`} badge="Motivate" />
            <ListRow title="Recent effort" meta={`${liveDiagnosis?.recentRewards.length ?? 0} recent reward signal(s)`} badge="Effort" />
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
