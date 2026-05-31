import type {
  LearningLevel,
  StudentProfile,
  StudentTaskSubmission,
  SubjectSkill,
} from "./types";

export type NumericLearningLevel = number | `Level ${number}` | LearningLevel;

export type AssessmentResult = {
  subject: string;
  skillName: string;
  score: number;
  difficultyLevel?: number;
  assessedAt?: string;
};

export type LearningGapResult = {
  schoolGradeLevel: number;
  actualLearningLevel: number;
  gap: number;
  band: "foundation" | "standard" | "challenge";
  recommendation: string;
};

export type RecommendedTask = {
  subject: string;
  skillName: string;
  taskType: "foundation" | "standard" | "challenge" | "revision";
  priority: "low" | "medium" | "high";
  reason: string;
};

export type WeaknessTag = {
  skillName: string;
  attempts: number;
  lowScoreCount: number;
  averageScore: number;
  tag: "weak" | "mastered" | "developing";
};

const legacyLevelMap: Record<LearningLevel, number> = {
  starter: 1,
  builder: 2.5,
  achiever: 4,
  master: 5.5,
};

function clampLevel(level: number) {
  return Math.max(0, Math.round(level * 10) / 10);
}

export function parseLearningLevel(level: NumericLearningLevel) {
  if (typeof level === "number") return clampLevel(level);
  if (level in legacyLevelMap) return legacyLevelMap[level as LearningLevel];

  const match = level.match(/\d+(\.\d+)?/);
  return match ? clampLevel(Number(match[0])) : 0;
}

export function parseSchoolGrade(schoolGrade: string) {
  const match = schoolGrade.match(/\d+(\.\d+)?/);
  return match ? clampLevel(Number(match[0])) : 0;
}

export function calculateLearningLevelFromAssessment(results: AssessmentResult[]) {
  if (results.length === 0) return 0;

  const weightedScore = results.reduce((total, result) => {
    const difficulty = Math.max(1, result.difficultyLevel ?? 1);
    const scoreBand = result.score / 100;
    const scoreLevel = difficulty + scoreBand - 0.5;
    return total + scoreLevel;
  }, 0);

  return clampLevel(weightedScore / results.length);
}

export function detectLearningGap(
  schoolGrade: string,
  actualLearningLevel: NumericLearningLevel,
): LearningGapResult {
  const schoolGradeLevel = parseSchoolGrade(schoolGrade);
  const actualLevel = parseLearningLevel(actualLearningLevel);
  const gap = clampLevel(schoolGradeLevel - actualLevel);

  if (actualLevel < schoolGradeLevel) {
    return {
      schoolGradeLevel,
      actualLearningLevel: actualLevel,
      gap,
      band: "foundation",
      recommendation: "Recommend foundation tasks because actual level is below school grade.",
    };
  }

  if (actualLevel > schoolGradeLevel) {
    return {
      schoolGradeLevel,
      actualLearningLevel: actualLevel,
      gap,
      band: "challenge",
      recommendation: "Recommend challenge tasks because actual level is above school grade.",
    };
  }

  return {
    schoolGradeLevel,
    actualLearningLevel: actualLevel,
    gap,
    band: "standard",
    recommendation: "Recommend standard tasks because actual level matches school grade.",
  };
}

export function recommendNextTasks(
  studentProfile: StudentProfile,
  subjectSkills: SubjectSkill[],
): RecommendedTask[] {
  const gap = detectLearningGap(
    studentProfile.schoolGrade,
    studentProfile.actualLearningLevel,
  );

  return subjectSkills
    .filter((skill) => skill.studentId === studentProfile.id)
    .map((skill) => {
      if (skill.masteryPercentage < 60) {
        return {
          subject: skill.subject,
          skillName: skill.skillName,
          taskType: "foundation",
          priority: "high",
          reason: `${skill.weaknessTag} needs rebuilding before grade-level work.`,
        } satisfies RecommendedTask;
      }

      if (skill.masteryPercentage >= 85 && gap.band === "challenge") {
        return {
          subject: skill.subject,
          skillName: skill.skillName,
          taskType: "challenge",
          priority: "medium",
          reason: "Student is above school grade and ready for extension work.",
        } satisfies RecommendedTask;
      }

      return {
        subject: skill.subject,
        skillName: skill.skillName,
        taskType: gap.band,
        priority: gap.band === "foundation" ? "high" : "medium",
        reason: gap.recommendation,
      } satisfies RecommendedTask;
    });
}

export function detectWeaknessTags(
  submissions: Array<
    StudentTaskSubmission & {
      skillName?: string;
      skillTags?: string[];
    }
  >,
): WeaknessTag[] {
  const grouped = new Map<string, number[]>();

  submissions.forEach((submission) => {
    const skillNames =
      submission.skillTags && submission.skillTags.length > 0
        ? submission.skillTags
        : [submission.skillName ?? "general-learning"];

    skillNames.forEach((skillName) => {
      grouped.set(skillName, [...(grouped.get(skillName) ?? []), submission.score]);
    });
  });

  return [...grouped.entries()].map(([skillName, scores]) => {
    const lowScoreCount = scores.filter((score) => score < 60).length;
    const highScoreCount = scores.filter((score) => score > 85).length;
    const averageScore = Math.round(
      scores.reduce((total, score) => total + score, 0) / scores.length,
    );

    return {
      skillName,
      attempts: scores.length,
      lowScoreCount,
      averageScore,
      tag:
        lowScoreCount >= 2
          ? "weak"
          : highScoreCount >= 3
            ? "mastered"
            : "developing",
    };
  });
}

export function recommendTeacherIntervention(
  studentProfile: StudentProfile,
  subjectSkills: SubjectSkill[],
) {
  const gap = detectLearningGap(
    studentProfile.schoolGrade,
    studentProfile.actualLearningLevel,
  );
  const weakSkills = subjectSkills.filter(
    (skill) =>
      skill.studentId === studentProfile.id && skill.masteryPercentage < 60,
  );
  const masteredSkills = subjectSkills.filter(
    (skill) =>
      skill.studentId === studentProfile.id && skill.masteryPercentage >= 85,
  );

  if (weakSkills.length > 0 || gap.band === "foundation") {
    return {
      level: "high" as const,
      message: "Schedule teacher intervention with foundation tasks and error correction.",
      focusSkills: weakSkills.map((skill) => skill.skillName),
      recommendedTaskBand: "foundation" as const,
    };
  }

  if (masteredSkills.length >= 2 || gap.band === "challenge") {
    return {
      level: "low" as const,
      message: "Student is progressing well. Offer challenge tasks and enrichment.",
      focusSkills: masteredSkills.map((skill) => skill.skillName),
      recommendedTaskBand: "challenge" as const,
    };
  }

  return {
    level: "medium" as const,
    message: "Continue standard practice and monitor the next three submissions.",
    focusSkills: subjectSkills
      .filter((skill) => skill.studentId === studentProfile.id)
      .map((skill) => skill.skillName),
    recommendedTaskBand: "standard" as const,
  };
}

export function getLearningLevel(xp: number): LearningLevel {
  if (xp >= 1200) return "master";
  if (xp >= 650) return "achiever";
  if (xp >= 250) return "builder";
  return "starter";
}

export function getLevelProgress(xp: number) {
  const currentLevelXp = xp % 1000;
  return Math.min(100, Math.round((currentLevelXp / 1000) * 100));
}
