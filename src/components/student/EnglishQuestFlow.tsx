"use client";

import { useMemo, useState } from "react";
import { calculateReward } from "@/lib/rewards";
import { applyRewardToPet, getEvolutionProgress } from "@/lib/pet-system";
import type { LearningTask, Pet } from "@/lib/types";

export function EnglishQuestFlow({ task, pet }: { task: LearningTask; pet: Pet }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const questions = task.questions;
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
    <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
      <section className="rounded-[2rem] border-4 border-[#102A54] bg-[#FFFEF8] p-5 shadow-[8px_8px_0_rgba(16,42,84,0.12)]">
        <p className="inline-flex rounded-full border-2 border-[#102A54] bg-[#FFD95A] px-3 py-1 text-xs font-black uppercase tracking-[0.16em]">
          CEFR {task.cefrLevel} · {task.taskBand}
        </p>
        <h1 className="mt-3 text-3xl font-black text-[#102A54]">{task.title}</h1>
        <p className="mt-2 text-sm font-bold leading-6 text-[#102A54]/65">{task.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border-2 border-[#102A54] bg-[#7BE0C3] px-3 py-2 text-xs font-black">
            {task.schoolGrade}
          </span>
          <span className="rounded-full border-2 border-[#102A54] bg-[#4FB8FF] px-3 py-2 text-xs font-black">
            {task.skillDomain}
          </span>
          {task.skillTags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border-2 border-[#102A54] bg-[#FFFEF8] px-3 py-2 text-xs font-black"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-6 grid gap-4">
          {questions.map((question) => (
            <div key={question.id} className="rounded-[1.5rem] border-2 border-[#102A54] bg-[#FFF7E2] p-4">
              <p className="inline-flex rounded-full bg-[#7BE0C3] px-3 py-1 text-xs font-black text-[#102A54]">
                {question.type}
              </p>
              <h2 className="mt-3 text-lg font-black text-[#102A54]">{question.prompt}</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {(question.options ?? []).map((option) => (
                  <button
                    type="button"
                    key={option}
                    onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))}
                    className={`rounded-2xl border-2 border-[#102A54] px-4 py-3 text-left text-sm font-black transition hover:-translate-y-0.5 ${
                      answers[question.id] === option ? "bg-[#FFD95A] shadow-[3px_3px_0_#102A54]" : "bg-[#FFFEF8]"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {submitted ? (
                <p className="mt-3 rounded-2xl border-2 border-[#102A54]/15 bg-[#FFFEF8] p-3 text-sm font-bold text-[#102A54]/70">
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
          className="mt-5 w-full rounded-2xl border-2 border-[#102A54] bg-[#4FB8FF] px-5 py-4 text-sm font-black text-[#102A54] shadow-[4px_4px_0_#102A54] transition hover:-translate-y-0.5"
        >
          Submit English Quest
        </button>
      </section>

      <aside className="rounded-[2rem] border-4 border-[#102A54] bg-gradient-to-br from-[#FFF7E2] to-[#7BE0C3]/40 p-5 shadow-[8px_8px_0_rgba(16,42,84,0.12)]">
        <p className="inline-flex rounded-full border-2 border-[#102A54] bg-[#FFB199] px-3 py-1 text-xs font-black uppercase tracking-[0.16em]">
          Result preview
        </p>
        {submitted ? (
          <>
            <h2 className="mt-3 text-4xl font-black text-[#102A54]">{score}%</h2>
            <p className="mt-2 text-sm font-bold text-[#102A54]/65">
              {correctCount} of {questions.length} correct
            </p>
            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border-2 border-[#102A54] bg-[#FFD95A] p-4">
                <p className="text-xs font-black uppercase text-[#102A54]/60">Reward</p>
                <p className="text-2xl font-black">+{reward.xp} XP · +{reward.starCoins} coins</p>
              </div>
              <div className="rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] p-4">
                <p className="text-xs font-black uppercase text-[#102A54]/60">Pet XP preview</p>
                <p className="text-2xl font-black">{pet.xp} → {previewPet.xp}</p>
                <p className="mt-1 text-sm font-bold text-[#102A54]/60">
                  Evolution progress: {evolution.progressPercent}%
                </p>
              </div>
              <div className="rounded-2xl border-2 border-[#102A54] bg-[#FFF7E2] p-4">
                <p className="text-xs font-black uppercase text-[#102A54]/60">Next recommendation</p>
                <p className="mt-1 text-sm font-bold text-[#102A54]/70">
                  {score >= 80
                    ? `Try a ${task.taskBand === "Challenge" ? "speaking" : "challenge"} quest next.`
                    : `Revise ${task.skillTags[0]} with a foundation quest.`}
                </p>
              </div>
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm font-bold leading-6 text-[#102A54]/65">
            Submit answers to preview score, reward, Star Coins, and pet XP growth.
          </p>
        )}
      </aside>
    </div>
  );
}
