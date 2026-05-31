import {
  battles,
  cards,
  classrooms,
  pets,
  reports,
  rewardTransactions,
  schoolTags,
  students,
  subjectSkills,
  taskSubmissions,
  tasks,
  users,
} from "./mock-data";
import type { Classroom, LearningTask, Pet, StudentProfile, User } from "./types";
import { getCefrTargetForGrade } from "./cefr-level";
import { getEnglishStandardsForGrade } from "./english-curriculum";

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

export function getUserName(userId: string) {
  return users.find((user) => user.id === userId)?.name ?? "Unknown user";
}

export function getStudentName(student: StudentProfile) {
  return getUserName(student.userId);
}

export function getStudentPet(student: StudentProfile) {
  return pets.find((pet) => pet.id === student.petId) ?? pets[0];
}

export function getStudentTasks(student: StudentProfile) {
  const enrolledClassIds = classrooms
    .filter((classroom) => classroom.studentIds.includes(student.id))
    .map((classroom) => classroom.id);

  return tasks.filter((task) => enrolledClassIds.includes(task.classId)).slice(0, 5);
}

export function getStudentDashboard(studentId = "student_1") {
  const student = students.find((item) => item.id === studentId) ?? students[0];
  const pet = getStudentPet(student);
  const studentTasks = getStudentTasks(student);
  const reviewedSubmissions = taskSubmissions.filter(
    (submission) => submission.studentId === student.id && submission.status === "reviewed",
  );
  const recentRewards = rewardTransactions
    .filter((reward) => reward.studentId === student.id)
    .slice(0, 4);

  return {
    student,
    studentName: getStudentName(student),
    pet,
    cefrTarget: getCefrTargetForGrade(student.schoolGrade),
    englishStandards: getEnglishStandardsForGrade(student.schoolGrade),
    tasks: studentTasks,
    completedTaskCount: reviewedSubmissions.length,
    skills: subjectSkills.filter((skill) => skill.studentId === student.id),
    report: reports.find((report) => report.studentId === student.id) ?? reports[0],
    recentRewards,
    cards: cards.slice(0, 3),
  };
}

export function getTeacherDashboard(teacherId = "user_teacher_1") {
  const teacher = users.find((user) => user.id === teacherId) as User | undefined;
  const teacherClasses = classrooms.filter((classroom) => classroom.teacherId === teacherId);
  const teacherStudentIds = new Set(teacherClasses.flatMap((classroom) => classroom.studentIds));
  const teacherStudents = students.filter((student) => teacherStudentIds.has(student.id));
  const teacherTasks = tasks.filter((task) => task.teacherId === teacherId);
  const weakStudents = [...teacherStudents]
    .filter(
      (student) =>
        student.homeworkCompletionRate < 82 || student.attendanceRate < 92,
    )
    .sort((a, b) => a.homeworkCompletionRate - b.homeworkCompletionRate);
  const topStudents = [...teacherStudents]
    .sort((a, b) => b.totalXP - a.totalXP)
    .slice(0, 4);
  const pendingSubmissions = taskSubmissions
    .filter((submission) =>
      teacherTasks.some((task) => task.id === submission.taskId) &&
      submission.status === "submitted",
    )
    .slice(0, 5);
  const subjectMastery = teacherClasses.map((classroom) => {
    const classroomStudents = teacherStudents.filter((student) =>
      classroom.studentIds.includes(student.id),
    );
    const masteryValues = subjectSkills
      .filter(
        (skill) =>
          skill.subject === classroom.subject &&
          classroomStudents.some((student) => student.id === skill.studentId),
      )
      .map((skill) => skill.masteryPercentage);

    return {
      subject: classroom.subject,
      mastery: average(masteryValues),
    };
  });

  return {
    teacher,
    classes: teacherClasses,
    students: teacherStudents,
    tasks: teacherTasks,
    weakStudents,
    topStudents,
    pendingSubmissions,
    subjectMastery,
    leaderboard: topStudents,
    summary: {
      classCount: teacherClasses.length,
      studentCount: teacherStudents.length,
      homeworkCompletion: average(
        teacherStudents.map((student) => student.homeworkCompletionRate),
      ),
      attendance: average(teacherStudents.map((student) => student.attendanceRate)),
      coinsGiven: rewardTransactions
        .filter((reward) => teacherStudents.some((student) => student.id === reward.studentId))
        .reduce((total, reward) => total + reward.coinAmount, 0),
    },
  };
}

export function getParentDashboard(parentId = "user_parent_1") {
  const child =
    students.find((student) => student.parentIds.includes(parentId)) ?? students[0];
  const pet = getStudentPet(child);
  const report = reports.find((item) => item.studentId === child.id) ?? reports[0];
  const skills = subjectSkills.filter((skill) => skill.studentId === child.id);
  const recentRewards = rewardTransactions
    .filter((reward) => reward.studentId === child.id)
    .slice(0, 3);

  return {
    parent: users.find((user) => user.id === parentId),
    child,
    childName: getStudentName(child),
    pet,
    cefrTarget: getCefrTargetForGrade(child.schoolGrade),
    englishStandards: getEnglishStandardsForGrade(child.schoolGrade),
    report,
    skills,
    monthlyTasks: getStudentTasks(child),
    recentRewards,
  };
}

export function getAdminDashboard() {
  const teachers = users.filter((user) => user.role === "teacher");
  const schoolTagOverview = schoolTags.map((tag) => ({
    ...tag,
    teacherCount: tag.teacherIds.length,
    studentCount: tag.studentIds.length,
    activeClassCount: classrooms.filter((classroom) =>
      classroom.studentIds.some((studentId) => tag.studentIds.includes(studentId)),
    ).length,
    averageHomework: average(
      students
        .filter((student) => tag.studentIds.includes(student.id))
        .map((student) => student.homeworkCompletionRate),
    ),
  }));

  return {
    centreName: "AiGenius Tuition Centre",
    users,
    teachers,
    students,
    classrooms,
    tasks,
    rewards: rewardTransactions,
    pets,
    cards,
    battles,
    schoolTags: schoolTagOverview,
    summary: {
      studentCount: students.length,
      teacherCount: teachers.length,
      classCount: classrooms.length,
      schoolTagCount: schoolTags.length,
      taskCount: tasks.length,
      averageAttendance: average(students.map((student) => student.attendanceRate)),
      averageHomework: average(students.map((student) => student.homeworkCompletionRate)),
      rewardEngagement: Math.min(100, Math.round((rewardTransactions.length / students.length) * 100)),
      totalRewardsIssued: rewardTransactions.reduce(
        (total, reward) => total + reward.coinAmount,
        0,
      ),
      monthlyLearningActivity: tasks.length + taskSubmissions.length + battles.length,
    },
  };
}

export function getTaskTitle(taskId: string) {
  return tasks.find((task) => task.id === taskId)?.title ?? "Learning task";
}

export function getClassTeacherName(classroom: Classroom) {
  return getUserName(classroom.teacherId);
}

export function getTaskDueLabel(task: LearningTask) {
  const dueDate = new Date(`${task.dueDate}T00:00:00`);

  return dueDate.toLocaleDateString("en-MY", {
    month: "short",
    day: "numeric",
  });
}

export function getPetStageIndex(pet: Pet) {
  const stageIndex = {
    baby: 0,
    junior: 1,
    advanced: 2,
    legendary: 3,
  };

  return stageIndex[pet.stage];
}
