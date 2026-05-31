"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { calculateReward } from "@/lib/rewards";
import { applyRewardToPet, getEvolutionProgress } from "@/lib/pet-system";
import type { LearningTask, Pet } from "@/lib/types";

function ProgressRail({ value }: { value: number }) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-[#082057] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#FFEF82] via-[#FFC107] to-[#8B38FF]"
        style={{ width: `${Math.max(4, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function EnglishQuestFlow({ task, pet }: { task: LearningTask; pet: Pet }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const questions = task.questions;
  const answeredCount = questions.filter((question) => answers[question.id]).length;
  const correctCount = questions.filter((question) => answers[question.id] === question.answer).length;
  const score = Math.round((correctCount / questions.length) * 100);
  const reward = useMemo(
    () =>
      calculateReward({
        studentId: pet.studentId,
        eventType: score >= 80 ? "score_above_80" : "complete_normal_task",
        task,
        submission: {
          id: "mock_submission",
          taskId: task.id,
          studentId: pet.studentId,
          score,
          status: "submitted",
          teacherFeedback: "",
          autoFeedback: "",
          submittedAt: new Date().toISOString(),
          reviewedAt: null,
        },
      }),
    [pet.studentId, score, task],
  );
  const previewPet = applyRewardToPet(pet, {
    id: "mock_reward",
    studentId: pet.studentId,
    sourceType: reward.sourceType,
    sourceId: reward.sourceId,
    xpAmount: reward.xp,
    coinAmount: reward.starCoins,
    reason: reward.reason,
    createdAt: new Date().toISOString(),
  });
  const evolution = getEvolutionProgress(previewPet);

  return (
    <div className="mx-auto grid max-w-6xl gap-5 xl:grid-cols-[430px_1fr]">
      <aside className="relative mx-auto w-full max-w-[430px] overflow-hidden rounded-[2.2rem] border border-white/20 bg-[#08256F]/85 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FFCF17]">
              CEFR {task.cefrLevel} · {task.taskBand}
            </p>
            <h1 className="mt-1 text-3xl font-black">{task.title}</h1>
          </div>
          <Link href="/student/tasks" className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-black">
            Back
          </Link>
        </div>

        <div className="mt-4 rounded-[1.8rem] border border-white/15 bg-gradient-to-br from-[#153DB5] via-[#4D20AA] to-[#102A8E] p-4 shadow-[0_18px_42px_rgba(0,0,0,0.25)]">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-white/55">
            Quest progress
          </p>
          <h2 className="mt-1 text-2xl font-black">{answeredCount}/{questions.length} answered</h2>
          <div className="mt-4">
            <ProgressRail value={(answeredCount / questions.length) * 100} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[task.schoolGrade, task.skillDomain, ...task.skillTags.slice(0, 2)].map((label) => (
              <span key={label} className="rounded-full bg-white/12 px-3 py-2 text-xs font-black">
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-[2rem] border border-white/15 bg-[#09256B]/75 p-4 shadow-[0_20px_48px_rgba(0,0,0,0.28)]">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FFCF17]">
            Reward preview
          </p>
          {submitted ? (
            <>
              <p className="mt-2 text-5xl font-black">{score}%</p>
              <p className="mt-1 text-sm font-bold text-white/65">
                {correctCount} of {questions.length} correct
              </p>
              <div className="mt-4 rounded-[1.5rem] bg-[#39D353] p-4 text-[#05245F]">
                <p className="text-xs font-black uppercase tracking-wide opacity-70">Earned</p>
                <p className="text-2xl font-black">+{reward.xp} XP · +{reward.starCoins} coins</p>
              </div>
              <div className="mt-4 rounded-[1.5rem] bg-white/10 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-white/55">Pet XP</p>
                <p className="mt-1 text-xl font-black">{pet.xp} → {previewPet.xp}</p>
                <p className="mt-1 text-sm font-bold text-white/62">
                  Evolution progress {evolution.progressPercent}%
                </p>
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm font-bold leading-6 text-white/65">
              Answer each question, then submit to reveal score, reward, and pet XP preview.
            </p>
          )}
        </div>
      </aside>

      <section className="grid content-start gap-4">
        <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_18px_52px_rgba(0,0,0,0.2)] backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFCF17]">
            English quest
          </p>
          <h2 className="mt-1 text-2xl font-black">{task.description}</h2>
        </div>

        <div className="grid gap-4">
          {questions.map((question, index) => (
            <div key={question.id} className="rounded-[1.8rem] border border-white/15 bg-white/10 p-4 shadow-[0_16px_38px_rgba(0,0,0,0.18)] backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFCF17]">
                    Question {index + 1} · {question.type}
                  </p>
                  <h3 className="mt-2 text-xl font-black">{question.prompt}</h3>
                </div>
                <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-black">
                  {answers[question.id] ? "Done" : "Open"}
                </span>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {(question.options ?? []).map((option) => {
                  const selected = answers[question.id] === option;
                  const correct = submitted && option === question.answer;
                  const wrong = submitted && selected && option !== question.answer;

                  return (
                    <button
                      type="button"
                      key={option}
                      onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))}
                      className={`rounded-2xl px-4 py-4 text-left text-sm font-black transition hover:-translate-y-0.5 ${
                        correct
                          ? "bg-[#39D353] text-[#05245F]"
                          : wrong
                            ? "bg-[#FF6B57] text-white"
                            : selected
                              ? "bg-[#FFCF17] text-[#102A54]"
                              : "bg-[#071E63]/70 text-white"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {submitted ? (
                <p className="mt-3 rounded-2xl bg-[#071E63]/70 p-3 text-sm font-bold leading-6 text-white/75">
                  {answers[question.id] === question.answer ? "Correct. " : "Review this. "}
                  {question.explanation}
                </p>
              ) : null}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setSubmitted(true)}
          className="min-h-14 rounded-2xl bg-gradient-to-r from-[#8B38FF] to-[#4FB8FF] px-5 py-4 text-sm font-black text-white shadow-[0_14px_30px_rgba(79,184,255,0.25)] transition hover:-translate-y-0.5"
        >
          Submit English Quest
        </button>
      </section>
    </div>
  );
}
