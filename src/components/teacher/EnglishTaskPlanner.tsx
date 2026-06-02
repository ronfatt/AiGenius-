"use client";

import { useActionState, useMemo, useState } from "react";
import { publishTeacherTaskAction } from "@/app/(dashboard)/teacher/tasks/create/actions";
import { getCefrTargetForGrade } from "@/lib/cefr-level";
import {
  buildMockGeneratedEnglishTask,
  type GeneratedEnglishTask,
} from "@/lib/english-task-generator";
import type { EnglishCoreSkillDomain } from "@/lib/english-skills";
import { englishCoreSkillDomains, getSkillTags } from "@/lib/english-skills";
import { classrooms } from "@/lib/mock-data";
import type { LearningTaskBand } from "@/lib/types";

const difficultyOptions = [1, 2, 3, 4, 5] as const;
const taskBands: LearningTaskBand[] = ["Foundation", "Standard", "Challenge"];

export type TeacherClassOption = {
  id: string;
  name: string;
  grade: string;
};

const fallbackClassOptions: TeacherClassOption[] = classrooms.map((classroom) => ({
  id: classroom.id,
  name: classroom.name,
  grade: classroom.grade,
}));

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-[#102A54]">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border-2 border-[#102A54] bg-[#FFF7E2] px-4 py-3 text-sm font-bold outline-none transition focus:bg-white"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function EnglishTaskPlanner({
  classOptions = fallbackClassOptions,
}: {
  classOptions?: TeacherClassOption[];
}) {
  const [classId, setClassId] = useState(classOptions[0]?.id ?? fallbackClassOptions[0].id);
  const selectedClass =
    classOptions.find((classroom) => classroom.id === classId) ??
    fallbackClassOptions.find((classroom) => classroom.id === classId) ??
    fallbackClassOptions[0];
  const [schoolGrade, setSchoolGrade] = useState(selectedClass.grade);
  const [skillDomain, setSkillDomain] = useState<EnglishCoreSkillDomain>("Reading");
  const [weaknessTag, setWeaknessTag] = useState("main idea");
  const [difficultyLevel, setDifficultyLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [taskBand, setTaskBand] = useState<LearningTaskBand>("Foundation");
  const [generatedTask, setGeneratedTask] = useState<GeneratedEnglishTask | null>(null);
  const [source, setSource] = useState<"ai" | "mock" | "local">("local");
  const [status, setStatus] = useState<"idle" | "generating" | "published">("idle");
  const [publishState, publishAction, isPublishing] = useActionState(
    publishTeacherTaskAction,
    {
      ok: false,
      message: "",
    },
  );

  const cefrTarget = getCefrTargetForGrade(schoolGrade);
  const skillTags = getSkillTags(skillDomain);
  const plannerInput = useMemo(
    () => ({
      className: selectedClass.name,
      schoolGrade,
      cefrLevel: cefrTarget,
      skillDomain,
      weaknessTag,
      taskBand,
      difficultyLevel,
    }),
    [
      selectedClass.name,
      schoolGrade,
      cefrTarget,
      skillDomain,
      weaknessTag,
      taskBand,
      difficultyLevel,
    ],
  );
  const previewTask = generatedTask ?? buildMockGeneratedEnglishTask(plannerInput);

  async function generateWithAI() {
    setStatus("generating");

    try {
      const response = await fetch("/api/teacher/english-task-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plannerInput),
      });
      const payload = (await response.json()) as {
        task?: GeneratedEnglishTask;
        source?: "ai" | "mock";
      };

      if (payload.task) {
        setGeneratedTask(payload.task);
        setSource(payload.source ?? "mock");
      }
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-[2rem] border-4 border-[#102A54] bg-[#FFFEF8] p-5 shadow-[8px_8px_0_rgba(16,42,84,0.12)]">
        <p className="inline-flex rounded-full border-2 border-[#102A54] bg-[#7BE0C3] px-3 py-1 text-xs font-black uppercase tracking-[0.16em]">
          AI planner controls
        </p>
        <h2 className="mt-3 text-3xl font-black text-[#102A54]">Create English Quest</h2>
        <p className="mt-2 text-sm font-bold leading-6 text-[#102A54]/65">
          Select class, Year, weak skill, and task band. The AI generates a
          Malaysia-aligned English quest with CEFR, skill tags, questions, and rewards.
        </p>

        <div className="mt-6 grid gap-4">
          <SelectField
            label="Class"
            value={classId}
            options={classOptions.map((classroom) => ({
              label: `${classroom.name} · ${classroom.grade}`,
              value: classroom.id,
            }))}
            onChange={(value) => {
              const nextClass = classOptions.find((classroom) => classroom.id === value);
              setClassId(value);
              if (nextClass) setSchoolGrade(nextClass.grade);
              setGeneratedTask(null);
            }}
          />

          <SelectField
            label="School year"
            value={schoolGrade}
            options={["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"].map(
              (year) => ({ label: year, value: year }),
            )}
            onChange={(value) => {
              setSchoolGrade(value);
              setGeneratedTask(null);
            }}
          />

          <SelectField
            label="English skill"
            value={skillDomain}
            options={englishCoreSkillDomains.map((domain) => ({ label: domain, value: domain }))}
            onChange={(value) => {
              const nextDomain = value as EnglishCoreSkillDomain;
              setSkillDomain(nextDomain);
              setWeaknessTag(getSkillTags(nextDomain)[0]);
              setGeneratedTask(null);
            }}
          />

          <SelectField
            label="Weakness tag"
            value={weaknessTag}
            options={skillTags.map((tag) => ({ label: tag, value: tag }))}
            onChange={(value) => {
              setWeaknessTag(value);
              setGeneratedTask(null);
            }}
          />

          <SelectField
            label="Task band"
            value={taskBand}
            options={taskBands.map((band) => ({ label: band, value: band }))}
            onChange={(value) => {
              setTaskBand(value as LearningTaskBand);
              setGeneratedTask(null);
            }}
          />

          <SelectField
            label="Difficulty"
            value={difficultyLevel.toString()}
            options={difficultyOptions.map((level) => ({
              label: level.toString(),
              value: level.toString(),
            }))}
            onChange={(value) => {
              setDifficultyLevel(Number(value) as 1 | 2 | 3 | 4 | 5);
              setGeneratedTask(null);
            }}
          />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={generateWithAI}
            disabled={status === "generating"}
            className="rounded-2xl border-2 border-[#102A54] bg-[#4FB8FF] px-5 py-4 text-sm font-black text-[#102A54] shadow-[4px_4px_0_#102A54] transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {status === "generating" ? "Generating..." : "Generate with AI"}
          </button>
          <form action={publishAction}>
            <input type="hidden" name="classId" value={classId} />
            <input type="hidden" name="task" value={JSON.stringify(previewTask)} />
            <button
              type="submit"
              disabled={isPublishing}
              className="w-full rounded-2xl border-2 border-[#102A54] bg-[#FFD95A] px-5 py-4 text-sm font-black text-[#102A54] shadow-[4px_4px_0_#102A54] transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {isPublishing ? "Publishing..." : "Publish to Supabase"}
            </button>
          </form>
        </div>

        {publishState.message ? (
          <p
            className={`mt-4 rounded-2xl border-2 border-[#102A54] p-4 text-sm font-black text-[#102A54] ${
              publishState.ok ? "bg-[#7BE0C3]" : "bg-[#FFB199]"
            }`}
          >
            {publishState.message}
            {publishState.taskId ? ` Task ID: ${publishState.taskId}` : ""}
          </p>
        ) : null}
      </section>

      <section className="rounded-[2rem] border-4 border-[#102A54] bg-gradient-to-br from-[#FFF7E2] via-[#FFFEF8] to-[#7BE0C3]/35 p-5 shadow-[8px_8px_0_rgba(16,42,84,0.16)]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="inline-flex rounded-full border-2 border-[#102A54] bg-[#FFD95A] px-3 py-1 text-xs font-black uppercase tracking-[0.16em]">
              {source === "ai" ? "AI generated" : source === "mock" ? "Mock fallback" : "Live preview"}
            </p>
            <h2 className="mt-3 text-3xl font-black text-[#102A54]">
              {previewTask.title}
            </h2>
            <p className="mt-2 text-sm font-black text-[#102A54]/60">
              {selectedClass.name} · {previewTask.schoolGrade} · CEFR {previewTask.cefrLevel}
            </p>
          </div>
          <div className="rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] px-4 py-3 text-right shadow-[3px_3px_0_#102A54]">
            <p className="text-xs font-black uppercase text-[#102A54]/60">Band</p>
            <p className="text-2xl font-black text-[#102A54]">{previewTask.taskBand}</p>
          </div>
        </div>

        <p className="mt-5 rounded-2xl border-2 border-[#102A54]/20 bg-[#FFFEF8] p-4 text-sm font-bold leading-6 text-[#102A54]/70">
          {previewTask.description}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border-2 border-[#102A54] bg-[#4FB8FF] p-4 shadow-[3px_3px_0_#102A54]">
            <p className="text-xs font-black uppercase text-[#102A54]/65">XP</p>
            <p className="text-3xl font-black">{previewTask.xpReward}</p>
          </div>
          <div className="rounded-2xl border-2 border-[#102A54] bg-[#FFD95A] p-4 shadow-[3px_3px_0_#102A54]">
            <p className="text-xs font-black uppercase text-[#102A54]/65">Star Coins</p>
            <p className="text-3xl font-black">{previewTask.coinReward}</p>
          </div>
          <div className="rounded-2xl border-2 border-[#102A54] bg-[#FFB199] p-4 shadow-[3px_3px_0_#102A54]">
            <p className="text-xs font-black uppercase text-[#102A54]/65">Difficulty</p>
            <p className="text-3xl font-black">{previewTask.difficultyLevel}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          <div className="rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] p-4">
            <h3 className="text-lg font-black text-[#102A54]">Reading</h3>
            <p className="mt-2 text-sm font-bold leading-6 text-[#102A54]/70">
              {previewTask.readingPassage}
            </p>
            <p className="mt-2 text-sm font-black text-[#102A54]">{previewTask.readingQuestion}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-[#102A54] bg-[#FFF7E2] p-4">
              <h3 className="text-lg font-black text-[#102A54]">Grammar MCQ</h3>
              <p className="mt-2 text-sm font-bold text-[#102A54]/70">{previewTask.grammarQuestion}</p>
            </div>
            <div className="rounded-2xl border-2 border-[#102A54] bg-[#FFF7E2] p-4">
              <h3 className="text-lg font-black text-[#102A54]">Vocabulary</h3>
              <p className="mt-2 text-sm font-bold text-[#102A54]/70">{previewTask.vocabularyQuestion}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {previewTask.skillTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border-2 border-[#102A54] bg-[#FFFEF8] px-3 py-2 text-xs font-black text-[#102A54]"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
