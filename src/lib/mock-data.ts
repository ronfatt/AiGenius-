import type {
  Battle,
  BattleQuestion,
  Centre,
  Classroom,
  LearningLevel,
  LearningTask,
  ParentReport,
  Pet,
  PetCard,
  RewardTransaction,
  SchoolTag,
  StudentCardInventory,
  StudentProfile,
  SubjectSkill,
  User,
} from "./types";
import { getCefrTargetForGrade } from "./cefr-level";
import { getEnglishTaskQuestions, getTaskBandForLearningGap } from "./english-curriculum";
import { englishCoreSkillDomains, getSkillTags } from "./english-skills";

const createdAt = "2026-05-31T09:00:00.000Z";

const studentNames = [
  "Alyssa Tan",
  "Ryan Lim",
  "Mika Wong",
  "Jayden Lee",
  "Sofia Chen",
  "Ethan Ng",
  "Chloe Wong",
  "Adam Teo",
  "Isabelle Low",
  "Lucas Yap",
];

const parentNames = [
  "Mrs Tan",
  "Mr Lim",
  "Mrs Wong",
  "Mr Lee",
  "Mrs Chen",
  "Mr Ng",
  "Mr Wong",
  "Mrs Teo",
  "Mr Low",
  "Mrs Yap",
];

export const centres: Centre[] = [
  {
    id: "centre_aigenius",
    name: "AiGenius Tuition Centre",
    logoUrl: "/logo-aigenius.svg",
  },
];

export const users: User[] = [
  {
    id: "user_admin_01",
    name: "Admin Team",
    email: "admin@aigenius.test",
    role: "admin",
    avatarUrl: "/avatars/admin.svg",
    profileCode: "ADMIN",
    createdAt,
  },
  ...["Teacher Mei", "Teacher Daniel"].map((name, index) => ({
    id: `user_teacher_${index + 1}`,
    name,
    email: `teacher${index + 1}@aigenius.test`,
    role: "teacher" as const,
    avatarUrl: `/avatars/teacher-${index + 1}.svg`,
    profileCode: ["MEIYA", "DANIE"][index],
    createdAt,
  })),
  ...studentNames.map((name, index) => ({
    id: `user_student_${index + 1}`,
    name,
    email: `student${index + 1}@aigenius.test`,
    role: "student" as const,
    avatarUrl: `/avatars/student-${index + 1}.svg`,
    profileCode: ["ALYSA", "RYANL", "MIKAW", "JAYDE", "SOFIA", "ETHAN", "CHLOW", "ADAMT", "ISABL", "LUCAS"][index],
    createdAt,
  })),
  ...parentNames.map((name, index) => ({
    id: `user_parent_${index + 1}`,
    name,
    email: `parent${index + 1}@aigenius.test`,
    role: "parent" as const,
    avatarUrl: `/avatars/parent-${index + 1}.svg`,
    profileCode: ["TANPA", "LIMPA", "WONGP", "LEEPX", "CHENP", "NGPAR", "WONPA", "TEOPA", "LOWPA", "YAPPA"][index],
    createdAt,
  })),
];

export const classrooms: Classroom[] = [
  {
    id: "class_english_y4",
    centreId: "centre_aigenius",
    teacherId: "user_teacher_1",
    name: "Year 4 English Quest",
    subject: "English",
    grade: "Year 4",
    schedule: "Mon and Wed, 4:00 PM",
    studentIds: ["student_1", "student_2", "student_3", "student_4"],
  },
  {
    id: "class_english_y5",
    centreId: "centre_aigenius",
    teacherId: "user_teacher_2",
    name: "Year 5 English Mastery",
    subject: "English",
    grade: "Year 5",
    schedule: "Tue and Thu, 5:15 PM",
    studentIds: ["student_5", "student_6", "student_7"],
  },
  {
    id: "class_english_y6",
    centreId: "centre_aigenius",
    teacherId: "user_teacher_1",
    name: "Year 6 English Bridge",
    subject: "English",
    grade: "Year 6",
    schedule: "Sat, 10:00 AM",
    studentIds: ["student_8", "student_9", "student_10"],
  },
];

export const schoolTags: SchoolTag[] = [
  {
    id: "school_tag_yuk_chin",
    centreId: "centre_aigenius",
    name: "SJKC Yuk Chin",
    code: "YUK-CHIN",
    area: "Tawau Central",
    teacherIds: ["user_teacher_1"],
    studentIds: ["student_1", "student_2", "student_3", "student_4"],
  },
  {
    id: "school_tag_merotai",
    centreId: "centre_aigenius",
    name: "SK Merotai",
    code: "MEROTAI",
    area: "Merotai",
    teacherIds: ["user_teacher_2"],
    studentIds: ["student_5", "student_6", "student_7"],
  },
  {
    id: "school_tag_tawau_home",
    centreId: "centre_aigenius",
    name: "Tawau Home Learners",
    code: "TW-HOME",
    area: "Tawau District",
    teacherIds: ["user_teacher_1", "user_teacher_2"],
    studentIds: ["student_8", "student_9", "student_10"],
  },
];

export const students: StudentProfile[] = studentNames.map((_, index) => {
  const number = index + 1;
  const classroom = classrooms[index < 4 ? 0 : index < 7 ? 1 : 2];
  const schoolGradeNumber = Number(classroom.grade.replace("Year ", ""));
  const actualLevel = Math.max(1, schoolGradeNumber - (index % 3 === 0 ? 1.2 : index % 3 === 1 ? 0.5 : -0.2));
  const targetLevel = Math.min(6, schoolGradeNumber + 0.2);

  return {
    id: `student_${number}`,
    userId: `user_student_${number}`,
    parentIds: [`user_parent_${number}`],
    referralCode: ["ALYSA", "RYANL", "MIKAW", "JAYDE", "SOFIA", "ETHAN", "CHLOW", "ADAMT", "ISABL", "LUCAS"][index],
    referredByStudentId: number > 7 ? `student_${number - 6}` : null,
    schoolTagIds: [schoolTags[index < 4 ? 0 : index < 7 ? 1 : 2].id],
    schoolGrade: classroom.grade,
    actualLearningLevel: `Level ${actualLevel.toFixed(1)}` as LearningLevel,
    targetLearningLevel: `Level ${targetLevel.toFixed(1)}` as LearningLevel,
    subjects: ["English"],
    petId: `pet_${number}`,
    totalXP: 420 + number * 80,
    starCoins: 60 + number * 12,
    streakDays: 2 + (number % 6),
    attendanceRate: 88 + (number % 10),
    homeworkCompletionRate: 72 + (number % 9) * 3,
  };
});

export const subjectSkills: SubjectSkill[] = students.flatMap((student, index) =>
  englishCoreSkillDomains.map((skillDomain, subjectIndex) => ({
    id: `skill_${student.id}_${subjectIndex + 1}`,
    studentId: student.id,
    subject: "English",
    skillName: skillDomain,
    level: 2 + ((index + subjectIndex) % 5),
    masteryPercentage: 55 + ((index + subjectIndex) % 8) * 5,
    weaknessTag: getSkillTags(skillDomain)[0],
    lastAssessedAt: "2026-05-30T12:00:00.000Z",
  })),
);

export const tasks: LearningTask[] = Array.from({ length: 20 }, (_, index) => {
  const number = index + 1;
  const classroom = classrooms[index % classrooms.length];
  const skillDomain = englishCoreSkillDomains[index % englishCoreSkillDomains.length];
  const cefrLevel = getCefrTargetForGrade(classroom.grade);
  const skillTags = getSkillTags(skillDomain);
  const linkedStudent =
    students.find((student) => classroom.studentIds.includes(student.id)) ?? students[0];
  const taskBand = getTaskBandForLearningGap({
    schoolGrade: classroom.grade,
    actualLearningLevel: linkedStudent.actualLearningLevel,
  });
  const difficultyLevel = (1 + (index % 5)) as 1 | 2 | 3 | 4 | 5;

  return {
    id: `task_${number}`,
    classId: classroom.id,
    teacherId: classroom.teacherId,
    title: `${skillDomain} Quest ${String(number).padStart(2, "0")}`,
    description: `${classroom.grade} English (${cefrLevel}) practice focused on ${skillTags.join(", ")}.`,
    subject: "English",
    schoolGrade: classroom.grade,
    cefrLevel,
    skillDomain,
    skillTags,
    difficultyLevel,
    taskBand,
    questions: getEnglishTaskQuestions({
      schoolGrade: classroom.grade,
      cefrLevel,
      skillDomain,
      weaknessTag: skillTags[0],
      taskBand,
    }),
    dueDate: `2026-06-${String(1 + (index % 20)).padStart(2, "0")}`,
    xpReward: 50 + (index % 5) * 10,
    coinReward: 10 + (index % 4) * 5,
    status: index % 4 === 0 ? "reviewed" : index % 3 === 0 ? "submitted" : "assigned",
  };
});

export const taskSubmissions = tasks.slice(0, 12).map((task, index) => ({
  id: `submission_${index + 1}`,
  taskId: task.id,
  studentId: `student_${(index % 10) + 1}`,
  score: 70 + (index % 6) * 5,
  status: index % 4 === 0 ? "reviewed" : "submitted",
  teacherFeedback: index % 4 === 0 ? "Good effort. Review the final step." : "",
  autoFeedback: "Keep your streak by completing the next mission.",
  submittedAt: "2026-05-31T10:30:00.000Z",
  reviewedAt: index % 4 === 0 ? "2026-05-31T13:30:00.000Z" : null,
}));

export const pets: Pet[] = studentNames.map((name, index) => {
  const number = index + 1;
  const xp = 420 + number * 80;
  const level = Math.floor(xp / 100);

  return {
    id: `pet_${number}`,
    studentId: `student_${number}`,
    name: `${name.split(" ")[0]}'s Nova`,
    species: ["Star Pup", "Moon Cat", "Comet Fox", "Cloud Bun"][index % 4],
    rarity: index === 0 ? "legendary" : index < 3 ? "epic" : index < 7 ? "rare" : "common",
    stage: level >= 15 ? "legendary" : level >= 8 ? "advanced" : level >= 4 ? "junior" : "baby",
    level,
    xp,
    power: 55 + ((index + 1) % 8) * 5,
    wisdom: 58 + ((index + 2) % 8) * 5,
    speed: 52 + ((index + 3) % 8) * 5,
    focus: 60 + ((index + 4) % 8) * 5,
    courage: 54 + ((index + 5) % 8) * 5,
    kindness: 62 + ((index + 6) % 8) * 5,
    imageUrl: `/pets/pet${String((index % 9) + 1).padStart(2, "0")}.png`,
  };
});

export const cards: PetCard[] = Array.from({ length: 20 }, (_, index) => {
  const number = index + 1;
  const rarities = ["common", "rare", "epic", "legendary"] as const;
  const types = ["boost", "shield", "focus", "wisdom"];

  return {
    id: `card_${number}`,
    name: `Academy Card ${String(number).padStart(2, "0")}`,
    rarity: rarities[index % rarities.length],
    type: types[index % types.length],
    effect: `Increase ${types[index % types.length]} performance during learning missions.`,
    imageUrl: `/cards/card-${number}.png`,
  };
});

export const cardInventory: StudentCardInventory[] = students.slice(0, 6).map((student, index) => ({
  id: `inventory_${index + 1}`,
  studentId: student.id,
  cardId: `card_${index + 1}`,
  quantity: 1 + (index % 3),
  obtainedAt: "2026-05-31T11:00:00.000Z",
}));

export const rewardTransactions: RewardTransaction[] = Array.from({ length: 10 }, (_, index) => ({
  id: `reward_${index + 1}`,
  studentId: `student_${(index % 10) + 1}`,
  sourceType: index % 3 === 0 ? "task" : index % 3 === 1 ? "quiz" : "manual",
  sourceId: index % 3 === 0 ? `task_${index + 1}` : `source_${index + 1}`,
  xpAmount: 50 + (index % 5) * 10,
  coinAmount: 10 + (index % 4) * 5,
  reason: index % 2 === 0 ? "Completed learning mission" : "Excellent class behavior",
  createdAt: "2026-05-31T12:00:00.000Z",
}));

export const battleQuestions: BattleQuestion[] = [
  {
    id: "battle_q_001",
    prompt: "Choose the sentence with correct subject-verb agreement.",
    options: [
      "She go to school.",
      "She goes to school.",
      "She going to school.",
      "She gone to school.",
    ],
    answer: "She goes to school.",
    subject: "English",
    skillTag: "subject-verb agreement",
  },
  {
    id: "battle_q_002",
    prompt: "Which word means almost the same as happy?",
    options: ["glad", "slow", "sharp", "quiet"],
    answer: "glad",
    subject: "English",
    skillTag: "vocabulary",
  },
  {
    id: "battle_q_003",
    prompt: "Which word best completes the sentence: I was ___ because I lost my book.",
    options: ["excited", "upset", "brave", "early"],
    answer: "upset",
    subject: "English",
    skillTag: "context clues",
  },
  {
    id: "battle_q_004",
    prompt: "What is the main idea of a text?",
    options: [
      "A small detail",
      "The title only",
      "The most important point",
      "A random sentence",
    ],
    answer: "The most important point",
    subject: "English",
    skillTag: "main idea",
  },
  {
    id: "battle_q_005",
    prompt: "Choose the correct sentence.",
    options: [
      "She go to class.",
      "She goes to class.",
      "She going class.",
      "She gone class.",
    ],
    answer: "She goes to class.",
    subject: "English",
    skillTag: "grammar",
  },
];

export const battles: Battle[] = [
  {
    id: "battle_001",
    mode: "solo",
    participantIds: ["student_1"],
    result: "won",
    questions: battleQuestions,
    rewards: { xpAmount: 90, coinAmount: 25, cardIds: ["card_2"] },
    createdAt,
  },
];

export const reports: ParentReport[] = students.slice(0, 5).map((student, index) => ({
  id: `report_${index + 1}`,
  studentId: student.id,
  month: "2026-05",
  summary: "Consistent learning progress with strong engagement in gamified tasks.",
  strengths: ["Good attendance", "Positive learning attitude", "Improving task completion"],
  weaknesses: ["Needs more revision on multi-step questions"],
  recommendations: ["Complete short daily practice", "Review teacher feedback after each task"],
  teacherComment:
    "The student is responding well to short missions and pet rewards. Keep the weekly streak going.",
  generatedAt: "2026-05-31T15:00:00.000Z",
}));

export const classes = classrooms;
