"use client";

import { useActionState, useMemo, useState } from "react";
import { approveTeacherReviewAction } from "@/app/(dashboard)/teacher/reviews/actions";
import type { TeacherReviewItem } from "@/lib/teacher-review-data";

const initialReviewState = {
  ok: false,
  message: "",
};

export function TeacherReviewWorkbench({ items }: { items: TeacherReviewItem[] }) {
  const [selectedId, setSelectedId] = useState(items[0]?.submission.id ?? "");
  const selectedItem = useMemo(
    () => items.find((item) => item.submission.id === selectedId) ?? items[0],
    [items, selectedId],
  );
  const [comment, setComment] = useState(selectedItem?.suggestedComment ?? "");
  const [markedWeaknesses, setMarkedWeaknesses] = useState<string[]>(
    selectedItem?.weakSkillTags ?? [],
  );
  const [reviewedIds, setReviewedIds] = useState<string[]>([]);
  const [reviewState, reviewAction, isReviewPending] = useActionState(
    approveTeacherReviewAction,
    initialReviewState,
  );

  function selectItem(id: string) {
    const next = items.find((item) => item.submission.id === id);
    setSelectedId(id);
    setComment(next?.suggestedComment ?? "");
    setMarkedWeaknesses(next?.weakSkillTags ?? []);
  }

  function toggleWeakness(tag: string) {
    setMarkedWeaknesses((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    );
  }

  if (!selectedItem) {
    return (
      <section className="rounded-[2rem] border border-white/15 bg-white p-6 shadow-[0_18px_52px_rgba(0,0,0,0.12)]">
        <h2 className="text-2xl font-black text-[#102A54]">No submissions to review</h2>
      </section>
    );
  }

  const reviewed = reviewedIds.includes(selectedItem.submission.id);
  const pendingCount = items.filter(
    (item) => item.submission.status === "submitted" && !reviewedIds.includes(item.submission.id),
  ).length;

  return (
    <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-[2rem] border border-white/15 bg-[#071E63]/92 p-4 text-white shadow-[0_18px_52px_rgba(0,0,0,0.2)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFCF17]">
              Review queue
            </p>
            <h2 className="mt-1 text-2xl font-black">{pendingCount} pending</h2>
          </div>
          <span className="rounded-2xl bg-[#39D353] px-4 py-2 text-sm font-black text-[#05245F]">
            {items.length} total
          </span>
        </div>

        <div className="mt-4 grid gap-3">
          {items.map((item) => {
            const active = item.submission.id === selectedItem.submission.id;
            const itemReviewed =
              item.submission.status === "reviewed" || reviewedIds.includes(item.submission.id);

            return (
              <button
                type="button"
                key={item.submission.id}
                onClick={() => selectItem(item.submission.id)}
                className={`rounded-[1.4rem] border p-4 text-left transition hover:-translate-y-0.5 ${
                  active
                    ? "border-[#FFCF17] bg-white text-[#102A54]"
                    : "border-white/12 bg-white/10 text-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black">{item.studentName}</p>
                    <p className={`mt-1 text-sm font-bold ${active ? "text-[#102A54]/60" : "text-white/58"}`}>
                      {item.task.title}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${
                      itemReviewed ? "bg-[#39D353] text-[#05245F]" : "bg-[#FFCF17] text-[#102A54]"
                    }`}
                  >
                    {itemReviewed ? "Reviewed" : "Pending"}
                  </span>
                </div>
                <p className={`mt-3 text-2xl font-black ${active ? "text-[#102A54]" : "text-white"}`}>
                  {item.submission.score}%
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4">
        <div className="rounded-[2rem] border border-white/15 bg-white p-5 text-[#102A54] shadow-[0_18px_52px_rgba(0,0,0,0.12)]">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF6B57]">
                Submission result
              </p>
              <h1 className="mt-1 text-3xl font-black">{selectedItem.studentName}</h1>
              <p className="mt-2 text-sm font-bold text-[#102A54]/60">
                {selectedItem.task.title} · {selectedItem.task.schoolGrade} · CEFR {selectedItem.task.cefrLevel}
              </p>
            </div>
            <div className="rounded-[1.4rem] bg-[#EEF6FF] px-5 py-4 text-right">
              <p className="text-xs font-black uppercase tracking-wide text-[#102A54]/55">Score</p>
              <p className="text-4xl font-black">{selectedItem.submission.score}%</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-[#FFF7E2] p-4">
              <p className="text-xs font-black uppercase text-[#102A54]/55">Reward</p>
              <p className="mt-1 text-xl font-black">
                +{selectedItem.suggestedReward.xp} XP · +{selectedItem.suggestedReward.starCoins}
              </p>
            </div>
            <div className="rounded-2xl bg-[#EEF6FF] p-4">
              <p className="text-xs font-black uppercase text-[#102A54]/55">Pet</p>
              <p className="mt-1 text-xl font-black">{selectedItem.petName}</p>
            </div>
            <div className="rounded-2xl bg-[#F3F7FA] p-4">
              <p className="text-xs font-black uppercase text-[#102A54]/55">Next</p>
              <p className="mt-1 text-sm font-black leading-5">{selectedItem.recommendedNextTask}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/15 bg-white p-5 text-[#102A54] shadow-[0_18px_52px_rgba(0,0,0,0.12)]">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF6B57]">
            Question analysis
          </p>
          <div className="mt-4 grid gap-3">
            {selectedItem.questionResults.map((result, index) => (
              <div
                key={result.id}
                className={`rounded-2xl p-4 ${
                  result.isCorrect ? "bg-[#E9FFF3]" : "bg-[#FFF0ED]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black">
                      {index + 1}. {result.type} · {result.skillTag}
                    </p>
                    <p className="mt-2 text-sm font-bold leading-6 text-[#102A54]/70">
                      {result.prompt}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${
                      result.isCorrect ? "bg-[#39D353] text-[#05245F]" : "bg-[#FF6B57] text-white"
                    }`}
                  >
                    {result.isCorrect ? "Correct" : "Review"}
                  </span>
                </div>
                {!result.isCorrect ? (
                  <div className="mt-3 rounded-2xl bg-white/70 p-3 text-sm font-bold leading-6">
                    <p>Your answer: {result.studentAnswer}</p>
                    <p className="text-[#0C7A43]">Correct answer: {result.correctAnswer}</p>
                    <p className="mt-1 text-[#102A54]/65">{result.explanation}</p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
          <form
            action={reviewAction}
            onSubmit={() => {
              setReviewedIds((current) =>
                current.includes(selectedItem.submission.id)
                  ? current
                  : [...current, selectedItem.submission.id],
              );
            }}
            className="rounded-[2rem] border border-white/15 bg-white p-5 text-[#102A54] shadow-[0_18px_52px_rgba(0,0,0,0.12)]"
          >
            <input type="hidden" name="submissionId" value={selectedItem.submission.id} />
            <input type="hidden" name="studentId" value={selectedItem.student.id} />
            <input type="hidden" name="taskId" value={selectedItem.task.id} />
            <input type="hidden" name="xpAmount" value={selectedItem.suggestedReward.xp} />
            <input type="hidden" name="coinAmount" value={selectedItem.suggestedReward.starCoins} />
            <input type="hidden" name="reason" value={selectedItem.suggestedReward.reason} />
            <input type="hidden" name="weakSkills" value={JSON.stringify(markedWeaknesses)} />
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF6B57]">
              Teacher comment
            </p>
            <textarea
              name="teacherFeedback"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="mt-4 min-h-36 w-full rounded-2xl border border-[#D8E4F0] bg-[#F8FBFF] p-4 text-sm font-bold leading-6 outline-none focus:border-[#4FB8FF]"
            />
            {reviewState.message ? (
              <p
                className={`mt-3 rounded-2xl px-4 py-3 text-sm font-black ${
                  reviewState.ok ? "bg-[#E9FFF3] text-[#0C7A43]" : "bg-[#FFF0ED] text-[#B42318]"
                }`}
              >
                {reviewState.message}
              </p>
            ) : null}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setComment(selectedItem.suggestedComment)}
                className="min-h-12 rounded-2xl bg-[#EEF6FF] px-4 text-sm font-black text-[#102A54]"
              >
                Use suggested comment
              </button>
              {selectedItem.persisted ? (
                <button
                  type="submit"
                  disabled={reviewed || isReviewPending}
                  className="min-h-12 rounded-2xl bg-[#FFCF17] px-4 text-sm font-black text-[#102A54] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {reviewed ? "Reviewed" : isReviewPending ? "Saving..." : "Approve review"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setReviewedIds((current) =>
                      current.includes(selectedItem.submission.id)
                        ? current
                        : [...current, selectedItem.submission.id],
                    )
                  }
                  className="min-h-12 rounded-2xl bg-[#FFCF17] px-4 text-sm font-black text-[#102A54]"
                >
                  {reviewed ? "Reviewed" : "Approve demo review"}
                </button>
              )}
            </div>
          </form>

          <div className="rounded-[2rem] border border-white/15 bg-white p-5 text-[#102A54] shadow-[0_18px_52px_rgba(0,0,0,0.12)]">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF6B57]">
              Mark weak skills
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.from(new Set([...selectedItem.task.skillTags, ...selectedItem.weakSkillTags])).map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleWeakness(tag)}
                  className={`rounded-full px-4 py-2 text-xs font-black ${
                    markedWeaknesses.includes(tag)
                      ? "bg-[#FF6B57] text-white"
                      : "bg-[#EEF6FF] text-[#102A54]"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-[#F8FBFF] p-4">
              <p className="text-xs font-black uppercase text-[#102A54]/55">Supabase next</p>
              <p className="mt-2 text-sm font-bold leading-6 text-[#102A54]/65">
                This action will update submissions, issue rewards, grow the pet, mark weak skills,
                and refresh the monthly parent report.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
