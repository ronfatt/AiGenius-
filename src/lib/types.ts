import type { CefrLevel } from "./cefr-level";
import type { EnglishCoreSkillDomain } from "./english-skills";

export type UserRole = "admin" | "teacher" | "student" | "parent";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  profileCode?: string;
  createdAt: string;
};

export type Centre = {
  id: string;
  name: string;
  logoUrl: string;
};

export type Classroom = {
  id: string;
  centreId: string;
  teacherId: string;
  name: string;
  subject: string;
  grade: string;
  schedule: string;
  studentIds: string[];
};

export type LearningLevel =
  | `Level ${number}`
  | "starter"
  | "builder"
  | "achiever"
  | "master";

export type StudentProfile = {
  id: string;
  userId: string;
  parentIds: string[];
  referralCode: string;
  referredByStudentId?: string | null;
  schoolTagIds?: string[];
  schoolGrade: string;
  actualLearningLevel: LearningLevel;
  targetLearningLevel: LearningLevel;
  subjects: string[];
  petId: string;
  totalXP: number;
  starCoins: number;
  streakDays: number;
  attendanceRate: number;
  homeworkCompletionRate: number;
};

export type SubjectSkill = {
  id: string;
  studentId: string;
  subject: string;
  skillName: string;
  level: number;
  masteryPercentage: number;
  weaknessTag: string;
  lastAssessedAt: string;
};

export type LearningTaskStatus = "draft" | "assigned" | "submitted" | "reviewed" | "archived";
export type LearningTaskBand = "Foundation" | "Standard" | "Challenge";
export type EnglishQuestionType = "reading" | "grammar" | "vocabulary" | "writing" | "speaking" | "listening";

export type EnglishTaskQuestion = {
  id: string;
  type: EnglishQuestionType;
  prompt: string;
  options?: string[];
  answer: string;
  explanation: string;
};

export type LearningTask = {
  id: string;
  classId: string;
  teacherId: string;
  title: string;
  description: string;
  subject: string;
  schoolGrade: string;
  cefrLevel: CefrLevel;
  skillDomain: EnglishCoreSkillDomain;
  skillTags: string[];
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  taskBand: LearningTaskBand;
  questions: EnglishTaskQuestion[];
  dueDate: string;
  xpReward: number;
  coinReward: number;
  status: LearningTaskStatus;
};

export type StudentTaskSubmissionStatus = "pending" | "submitted" | "reviewed" | "late";

export type StudentTaskSubmission = {
  id: string;
  taskId: string;
  studentId: string;
  score: number;
  status: StudentTaskSubmissionStatus;
  teacherFeedback: string;
  autoFeedback: string;
  submittedAt: string | null;
  reviewedAt: string | null;
};

export type RewardSourceType = "task" | "behavior" | "quiz" | "battle" | "manual";

export type RewardTransaction = {
  id: string;
  studentId: string;
  sourceType: RewardSourceType;
  sourceId: string;
  xpAmount: number;
  coinAmount: number;
  reason: string;
  createdAt: string;
};

export type PetRarity = "common" | "rare" | "epic" | "legendary";
export type PetStage = "baby" | "junior" | "advanced" | "legendary";

export type Pet = {
  id: string;
  studentId: string;
  name: string;
  species: string;
  rarity: PetRarity;
  stage: PetStage;
  level: number;
  xp: number;
  power: number;
  wisdom: number;
  speed: number;
  focus: number;
  courage: number;
  kindness: number;
  imageUrl: string;
};

export type PetStats = Pick<
  Pet,
  "power" | "wisdom" | "speed" | "focus" | "courage" | "kindness"
>;

export type PetCardRarity = "common" | "rare" | "epic" | "legendary";

export type PetCard = {
  id: string;
  name: string;
  rarity: PetCardRarity;
  type: string;
  effect: string;
  imageUrl: string;
};

export type StudentCardInventory = {
  id: string;
  studentId: string;
  cardId: string;
  quantity: number;
  obtainedAt: string;
};

export type BattleMode = "solo" | "class_boss" | "student_vs_student";

export type BattleQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
  subject: string;
  skillTag: string;
};

export type BattleReward = {
  xpAmount: number;
  coinAmount: number;
  cardIds: string[];
};

export type Battle = {
  id: string;
  mode: BattleMode;
  participantIds: string[];
  result: string;
  questions: BattleQuestion[];
  rewards: BattleReward;
  createdAt: string;
};

export type BattleResult = {
  won: boolean;
  score: number;
  xpEarned: number;
  coinsEarned: number;
};

export type ParentReport = {
  id: string;
  studentId: string;
  month: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  teacherComment: string;
  generatedAt: string;
};

export type UserProfile = User;
export type ClassGroup = Classroom;
export type Task = LearningTask;
export type GameCard = PetCard;
export type LearningReport = ParentReport;

export type SchoolTag = {
  id: string;
  centreId: string;
  name: string;
  code: string;
  area: string;
  teacherIds: string[];
  studentIds: string[];
};

export type TeacherStudentLink = {
  id: string;
  teacherId: string;
  studentId: string;
  status: "active" | "pending" | "removed";
  source: "student_code" | "admin" | "classroom";
  createdAt: string;
};

export type ParentStudentLink = {
  id: string;
  parentId: string;
  studentId: string;
  status: "active" | "pending" | "removed";
  source: "student_code" | "admin";
  createdAt: string;
};
