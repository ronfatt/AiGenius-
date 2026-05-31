"use client";

import { useState } from "react";
import type { StudentProfile } from "@/lib/types";
import { getStudentName } from "@/lib/dashboard-data";

export function SpecialTicketPanel({ students }: { students: StudentProfile[] }) {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id ?? "");
  const [ticketType, setTicketType] = useState("Rare Chance Ticket");
  const [issued, setIssued] = useState(false);
  const selectedStudent = students.find((student) => student.id === selectedStudentId) ?? students[0];

  return (
    <section className="rounded-[1.6rem] border-2 border-[#102A54] bg-[#FFFEF8] p-5 shadow-[5px_5px_0_rgba(16,42,84,0.12)]">
      <p className="inline-flex rounded-full border-2 border-[#102A54] bg-[#FFD95A] px-3 py-1 text-xs font-black uppercase tracking-[0.16em]">
        Special tickets
      </p>
      <h2 className="mt-3 text-2xl font-black">Reward effort, not luck only</h2>
      <p className="mt-2 text-sm font-bold leading-6 text-[#102A54]/65">
        Teachers can grant tickets for weekly streaks, clear improvement, corrected mistakes, or excellent effort.
      </p>

      <div className="mt-4 grid gap-3">
        <label className="grid gap-2 text-sm font-black">
          Student
          <select
            value={selectedStudentId}
            onChange={(event) => {
              setSelectedStudentId(event.target.value);
              setIssued(false);
            }}
            className="rounded-2xl border-2 border-[#102A54] bg-[#FFF7E2] px-4 py-3 outline-none"
          >
            {students.slice(0, 6).map((student) => (
              <option key={student.id} value={student.id}>
                {getStudentName(student)}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-black">
          Ticket
          <select
            value={ticketType}
            onChange={(event) => {
              setTicketType(event.target.value);
              setIssued(false);
            }}
            className="rounded-2xl border-2 border-[#102A54] bg-[#FFF7E2] px-4 py-3 outline-none"
          >
            <option>Normal Ticket</option>
            <option>Star Ticket</option>
            <option>Rare Chance Ticket</option>
          </select>
        </label>

        <button
          type="button"
          onClick={() => setIssued(true)}
          className="rounded-2xl border-2 border-[#102A54] bg-[#7BE0C3] px-5 py-4 text-sm font-black shadow-[4px_4px_0_#102A54] transition hover:-translate-y-0.5"
        >
          Issue Ticket
        </button>
      </div>

      {issued ? (
        <p className="mt-4 rounded-2xl border-2 border-[#102A54]/20 bg-[#FFF7E2] p-3 text-sm font-bold text-[#102A54]/70">
          Issued {ticketType} to {getStudentName(selectedStudent)}. Supabase will store this as a teacher reward transaction later.
        </p>
      ) : null}
    </section>
  );
}
