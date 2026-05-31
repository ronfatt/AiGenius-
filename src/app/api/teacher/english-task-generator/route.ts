import { NextResponse } from "next/server";
import {
  buildMockGeneratedEnglishTask,
  type EnglishTaskGeneratorInput,
  type GeneratedEnglishTask,
} from "@/lib/english-task-generator";

function isValidInput(input: Partial<EnglishTaskGeneratorInput>): input is EnglishTaskGeneratorInput {
  return Boolean(
    input.className &&
      input.schoolGrade &&
      input.cefrLevel &&
      input.skillDomain &&
      input.weaknessTag &&
      input.taskBand &&
      input.difficultyLevel,
  );
}

function normalizeGeneratedTask(
  input: EnglishTaskGeneratorInput,
  task: Partial<GeneratedEnglishTask>,
): GeneratedEnglishTask {
  const fallback = buildMockGeneratedEnglishTask(input);

  return {
    ...fallback,
    ...task,
    answers: {
      ...fallback.answers,
      ...task.answers,
    },
    feedback: {
      ...fallback.feedback,
      ...task.feedback,
    },
    cefrLevel: input.cefrLevel,
    schoolGrade: input.schoolGrade,
    skillDomain: input.skillDomain,
    taskBand: input.taskBand,
    difficultyLevel: input.difficultyLevel,
  };
}

export async function POST(request: Request) {
  const input = (await request.json()) as Partial<EnglishTaskGeneratorInput>;

  if (!isValidInput(input)) {
    return NextResponse.json(
      { error: "Missing English task planner fields." },
      { status: 400 },
    );
  }

  const fallback = buildMockGeneratedEnglishTask(input);
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ task: fallback, source: "mock" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "You generate Malaysia primary English tuition tasks. Keep content aligned to CEFR, age-appropriate, classroom-safe, concise, and not off-topic. Return only valid JSON.",
          },
          {
            role: "user",
            content: JSON.stringify({
              instruction:
                "Create one English learning quest with a reading passage, one reading question, one grammar MCQ, one vocabulary question, answers, feedback, and skill tags.",
              schema:
                "Return JSON with title, description, readingPassage, readingQuestion, grammarQuestion, vocabularyQuestion, options array, answers {reading, grammar, vocabulary}, feedback {reading, grammar, vocabulary}, skillTags array.",
              input,
            }),
          },
        ],
        text: {
          format: {
            type: "json_object",
          },
        },
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ task: fallback, source: "mock" });
    }

    const payload = (await response.json()) as { output_text?: string };
    const outputText = payload.output_text;

    if (!outputText) {
      return NextResponse.json({ task: fallback, source: "mock" });
    }

    const generated = JSON.parse(outputText) as Partial<GeneratedEnglishTask>;
    return NextResponse.json({
      task: normalizeGeneratedTask(input, generated),
      source: "ai",
    });
  } catch {
    return NextResponse.json({ task: fallback, source: "mock" });
  }
}
