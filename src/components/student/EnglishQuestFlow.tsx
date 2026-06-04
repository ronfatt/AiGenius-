"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { submitStudentTaskAction } from "@/app/(dashboard)/student/tasks/actions";
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

function getScoreBand(score: number) {
  if (score >= 85) {
    return {
      label: "Mastery",
      title: "Great work. You are ready for a harder quest.",
      message:
        "You answered most questions correctly. Keep the habit and try a challenge task next.",
      nextTaskType: "Challenge Quest",
      nextAction: "Try a higher difficulty task for the same English skill.",
    };
  }

  if (score >= 60) {
    return {
      label: "Building",
      title: "Good progress. One more practice round will help.",
      message:
        "You understood part of the skill. Review the missed questions, then try a standard task.",
      nextTaskType: "Standard Practice",
      nextAction: "Repeat this skill with a short mixed practice.",
    };
  }

  return {
    label: "Foundation",
    title: "Let us rebuild the basics step by step.",
    message:
      "This skill still needs support. Focus on the corrected answers before moving forward.",
    nextTaskType: "Foundation Review",
    nextAction: "Do an easier task that teaches the same skill with more examples.",
  };
}

function getQuestionSkillLabel(questionType: string) {
  const labels: Record<string, string> = {
    reading: "reading comprehension",
    grammar: "grammar accuracy",
    vocabulary: "word meaning",
    writing: "sentence writing",
    speaking: "spoken response",
    listening: "listening understanding",
  };

  return labels[questionType] ?? "English skill";
}

export function EnglishQuestFlow({ task, pet }: { task: LearningTask; pet: Pet }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [helpOpen, setHelpOpen] = useState<Record<string, boolean>>({});
  const [chineseOpen, setChineseOpen] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitState, submitAction, isSubmitting] = useActionState(submitStudentTaskAction, {
    ok: false,
    message: "",
  });

  const questions = task.questions;
  const answeredCount = questions.filter((question) => answers[question.id]).length;
  const correctCount = questions.filter((question) => answers[question.id] === question.answer).length;
  const incorrectQuestions = questions.filter(
    (question) => submitted && answers[question.id] !== question.answer,
  );
  const score = Math.round((correctCount / questions.length) * 100);
  const feedback = getScoreBand(score);
  const learnedSkills = Array.from(
    new Set([
      task.skillDomain,
      ...questions
        .filter((question) => answers[question.id] === question.answer)
        .map((question) => getQuestionSkillLabel(question.type)),
    ]),
  ).slice(0, 3);
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
  const difficultyLabel =
    task.taskBand === "Foundation"
      ? "Easy start"
      : task.taskBand === "Challenge"
        ? "Challenge"
        : "Normal";
  const petCoachMessage = submitted
    ? score >= 85
      ? `${pet.name} says: Strong clue-finding. Ready for a harder quest.`
      : score >= 60
        ? `${pet.name} says: Good try. Fix one mistake and you will grow again.`
        : `${pet.name} says: It is okay. We can rebuild this skill one small step at a time.`
    : `${pet.name} says: Try 3 questions. Use Hint if you feel stuck.`;

  function toggleHelp(questionId: string) {
    setHelpOpen((current) => ({ ...current, [questionId]: !current[questionId] }));
  }

  function toggleChinese(questionId: string) {
    setChineseOpen((current) => ({ ...current, [questionId]: !current[questionId] }));
  }

  function markNeedHelp(questionId: string) {
    setHelpOpen((current) => ({ ...current, [questionId]: true }));
  }

  function markDontKnow(questionId: string) {
    setAnswers((current) => ({ ...current, [questionId]: "I need help" }));
    setHelpOpen((current) => ({ ...current, [questionId]: true }));
  }

  function getMiniHint(questionType: string) {
    const hints: Record<string, string> = {
      reading: "Find the sentence that tells the most important idea.",
      grammar: "Check the subject first, then choose the verb that matches it.",
      vocabulary: "Replace the word in the sentence and see which meaning still fits.",
      writing: "Build one clear sentence: who, action, detail.",
      speaking: "Say a short answer first. Clear is better than long.",
      listening: "Listen for the key word, not every single word.",
    };

    return hints[questionType] ?? "Look for the clue word before choosing.";
  }

  function getChineseSupport(questionType: string) {
    const supports: Record<string, string> = {
      reading: "中文提示：先找文章最重要的意思，不要只选一个小细节。",
      grammar: "中文提示：先看主语是谁，再选正确的动词形式。",
      vocabulary: "中文提示：把答案放回句子里试试看，意思通顺的通常就是答案。",
      writing: "中文提示：先写简单句，人物 + 动作 + 一个细节。",
      speaking: "中文提示：先用短句回答，不需要一开始就讲很长。",
      listening: "中文提示：听关键词，不需要每个字都听懂。",
    };

    return supports[questionType] ?? "中文提示：先找线索，再慢慢选择。";
  }

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
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <span className="rounded-2xl bg-[#FFCF17] px-3 py-2 text-center text-xs font-black text-[#102A54]">
              {difficultyLabel}
            </span>
            <span className="rounded-2xl bg-white/12 px-3 py-2 text-center text-xs font-black text-white">
              5 min quest
            </span>
            <span className="rounded-2xl bg-[#39D353] px-3 py-2 text-center text-xs font-black text-[#05245F]">
              Help allowed
            </span>
          </div>
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
            Pet coach
          </p>
          <div className="mt-3 rounded-[1.5rem] bg-white/10 p-4">
            <p className="text-sm font-black leading-6 text-white">
              {petCoachMessage}
            </p>
            <p className="mt-2 text-xs font-bold leading-5 text-white/60">
              If you do not know, press Hint or I need help. That still counts as learning.
            </p>
          </div>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-[#FFCF17]">
            Reward preview
          </p>
          {submitted ? (
            <>
              <p className="mt-2 text-5xl font-black">{score}%</p>
              <p className="mt-1 text-sm font-bold text-white/65">
                {correctCount} of {questions.length} correct
              </p>
              <div className="mt-4 rounded-[1.5rem] bg-[#FFCF17] p-4 text-[#102A54]">
                <p className="text-xs font-black uppercase tracking-wide opacity-70">
                  Learning level
                </p>
                <p className="text-2xl font-black">{feedback.label}</p>
                <p className="mt-1 text-sm font-bold leading-5 opacity-75">
                  {feedback.title}
                </p>
              </div>
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
              <Link
                href="/student/tasks"
                className="mt-4 grid min-h-12 place-items-center rounded-2xl bg-gradient-to-r from-[#8B38FF] to-[#4FB8FF] px-4 text-sm font-black text-white"
              >
                Next: {feedback.nextTaskType}
              </Link>
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
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="rounded-2xl bg-[#39D353]/18 p-3 text-sm font-black text-[#BFFFD0]">
              Goal: finish, not perfect
            </div>
            <div className="rounded-2xl bg-[#FFCF17]/18 p-3 text-sm font-black text-[#FFEF82]">
              Use hints when stuck
            </div>
            <div className="rounded-2xl bg-white/10 p-3 text-sm font-black text-white">
              Mistakes unlock practice
            </div>
          </div>
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
                  {answers[question.id] ? (answers[question.id] === "I need help" ? "Help" : "Done") : "Open"}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggleHelp(question.id)}
                  className="rounded-full bg-[#FFCF17] px-4 py-2 text-xs font-black text-[#102A54]"
                >
                  Hint
                </button>
                <button
                  type="button"
                  onClick={() => toggleChinese(question.id)}
                  className="rounded-full bg-white/12 px-4 py-2 text-xs font-black text-white"
                >
                  Chinese help
                </button>
                <button
                  type="button"
                  onClick={() => markNeedHelp(question.id)}
                  className="rounded-full bg-[#39D353] px-4 py-2 text-xs font-black text-[#05245F]"
                >
                  I need help
                </button>
                <button
                  type="button"
                  onClick={() => markDontKnow(question.id)}
                  className="rounded-full bg-[#FF6B57] px-4 py-2 text-xs font-black text-white"
                >
                  I don&apos;t know
                </button>
              </div>
              {helpOpen[question.id] ? (
                <div className="mt-3 rounded-2xl bg-[#FFCF17]/18 p-3 text-sm font-bold leading-6 text-[#FFEF82]">
                  Hint: {getMiniHint(question.type)}
                </div>
              ) : null}
              {chineseOpen[question.id] ? (
                <div className="mt-3 rounded-2xl bg-white/10 p-3 text-sm font-bold leading-6 text-white/78">
                  {getChineseSupport(question.type)}
                </div>
              ) : null}
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
              {answers[question.id] === "I need help" && !submitted ? (
                <p className="mt-3 rounded-2xl bg-[#FF6B57]/15 p-3 text-sm font-bold leading-6 text-[#FFD7D1]">
                  Saved as &quot;I need help&quot;. You can still choose an answer after reading the hint.
                </p>
              ) : null}
              {submitted ? (
                <div
                  className={`mt-3 rounded-2xl p-3 text-sm font-bold leading-6 ${
                    answers[question.id] === question.answer
                      ? "bg-[#39D353]/20 text-[#BFFFD0]"
                      : "bg-[#FF6B57]/18 text-[#FFD7D1]"
                  }`}
                >
                  <p className="font-black">
                    {answers[question.id] === question.answer
                      ? "Correct. You used the skill well."
                      : `Correction: the answer is "${question.answer}".`}
                  </p>
                  <p className="mt-1 text-white/75">{question.explanation}</p>
                  {answers[question.id] !== question.answer ? (
                    <div className="mt-2 grid gap-2 text-white/75">
                      <p>
                        Fix-it action: read the question again, find the clue, then say why the correct answer fits.
                      </p>
                      <p>{getChineseSupport(question.type)}</p>
                      <Link
                        href="/student/tasks"
                        className="inline-flex w-fit rounded-full bg-[#FFCF17] px-4 py-2 text-xs font-black text-[#102A54]"
                      >
                        Practice similar question
                      </Link>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {submitted ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-[1.8rem] border border-white/15 bg-white/10 p-4 shadow-[0_16px_38px_rgba(0,0,0,0.18)] backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFCF17]">
                Learning feedback
              </p>
              <h3 className="mt-2 text-2xl font-black">{feedback.title}</h3>
              <p className="mt-2 text-sm font-bold leading-6 text-white/68">
                {feedback.message}
              </p>
              <p className="mt-2 rounded-2xl bg-white/10 p-3 text-sm font-bold leading-6 text-white/72">
                Chinese support: 做错不是失败。先改一个错题，再做下一题，英文就会慢慢升级。
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {learnedSkills.map((skill) => (
                  <span key={skill} className="rounded-full bg-[#39D353] px-3 py-2 text-xs font-black text-[#05245F]">
                    Learned: {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-white/15 bg-white/10 p-4 shadow-[0_16px_38px_rgba(0,0,0,0.18)] backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFCF17]">
                Recommended next
              </p>
              <h3 className="mt-2 text-2xl font-black">{feedback.nextTaskType}</h3>
              <p className="mt-2 text-sm font-bold leading-6 text-white/68">
                {feedback.nextAction}
              </p>
              <Link
                href="/student/tasks"
                className="mt-4 inline-flex rounded-2xl bg-[#FFCF17] px-5 py-3 text-sm font-black text-[#102A54]"
              >
                Go to next quest
              </Link>
            </div>
          </div>
        ) : null}

        {submitted && incorrectQuestions.length > 0 ? (
          <div className="rounded-[1.8rem] border border-white/15 bg-[#FF6B57]/12 p-4 shadow-[0_16px_38px_rgba(0,0,0,0.18)] backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFCF17]">
              Mistake review
            </p>
            <h3 className="mt-2 text-2xl font-black">Fix these before the next quest</h3>
            <p className="mt-2 text-sm font-bold leading-6 text-white/65">
              Pick one mistake first. Small correction is better than guessing many questions.
            </p>
            <div className="mt-4 grid gap-3">
              {incorrectQuestions.map((question, index) => (
                <div key={question.id} className="rounded-2xl bg-[#071E63]/70 p-4">
                  <p className="text-sm font-black text-white">
                    {index + 1}. {getQuestionSkillLabel(question.type)}
                  </p>
                  <p className="mt-2 text-sm font-bold leading-6 text-white/70">
                    Your answer: {answers[question.id] || "No answer"}
                  </p>
                  <p className="text-sm font-bold leading-6 text-[#BFFFD0]">
                    Correct answer: {question.answer}
                  </p>
                  <p className="mt-2 text-sm font-bold leading-6 text-white/70">
                    {question.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {submitState.message ? (
          <div
            className={`rounded-[1.5rem] border border-white/15 p-4 text-sm font-black ${
              submitState.ok ? "bg-[#39D353]/20 text-[#BFFFD0]" : "bg-[#FFCF17]/18 text-[#FFEF82]"
            }`}
          >
            <p>{submitState.message}</p>
            {submitState.rewardPreview ? (
              <div className="mt-3 grid gap-2 rounded-2xl bg-[#071E63]/55 p-3 text-white sm:grid-cols-3">
                <span>Saved score: {submitState.rewardPreview.score}%</span>
                <span>Pending: +{submitState.rewardPreview.xp} XP</span>
                <span>Coins: +{submitState.rewardPreview.starCoins}</span>
              </div>
            ) : null}
          </div>
        ) : null}

        <form
          action={submitAction}
          onSubmit={() => setSubmitted(true)}
        >
          <input type="hidden" name="taskId" value={task.id} />
          <input type="hidden" name="score" value={score} />
          <input type="hidden" name="answers" value={JSON.stringify(answers)} />
          <button
            type="submit"
            disabled={answeredCount < questions.length || isSubmitting}
            className="min-h-14 w-full rounded-2xl bg-gradient-to-r from-[#8B38FF] to-[#4FB8FF] px-5 py-4 text-sm font-black text-white shadow-[0_14px_30px_rgba(79,184,255,0.25)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {answeredCount < questions.length
              ? `Answer ${questions.length - answeredCount} more`
              : isSubmitting
                ? "Submitting..."
                : submitted
                  ? "Submit Again"
                  : "Submit English Quest"}
          </button>
        </form>
      </section>
    </div>
  );
}
