import fs from "node:fs";

const envText = fs.existsSync(".env.local") ? fs.readFileSync(".env.local", "utf8") : "";
for (const line of envText.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
  const [key, ...valueParts] = trimmed.split("=");
  process.env[key] ??= valueParts.join("=");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
}

const authUrl = `${supabaseUrl}/auth/v1`;
const restUrl = `${supabaseUrl}/rest/v1`;
const headers = {
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
  "Content-Type": "application/json",
};

const centreId = "11111111-1111-4111-8111-111111111111";
const classIds = {
  y4: "22222222-2222-4222-8222-222222222201",
  y5: "22222222-2222-4222-8222-222222222202",
};
const studentProfileIds = [
  "33333333-3333-4333-8333-333333333301",
  "33333333-3333-4333-8333-333333333302",
  "33333333-3333-4333-8333-333333333303",
  "33333333-3333-4333-8333-333333333304",
  "33333333-3333-4333-8333-333333333305",
];
const petIds = [
  "44444444-4444-4444-8444-444444444401",
  "44444444-4444-4444-8444-444444444402",
  "44444444-4444-4444-8444-444444444403",
  "44444444-4444-4444-8444-444444444404",
  "44444444-4444-4444-8444-444444444405",
];
const taskIds = [
  "55555555-5555-4555-8555-555555555501",
  "55555555-5555-4555-8555-555555555502",
];

const accounts = [
  { key: "admin", name: "AiGenius Admin", email: "admin@aigenius.demo", role: "admin", password: "Demo1234" },
  { key: "teacher1", name: "Teacher Mei", email: "teacher1@aigenius.demo", role: "teacher", password: "Demo1234" },
  { key: "teacher2", name: "Teacher Daniel", email: "teacher2@aigenius.demo", role: "teacher", password: "Demo1234" },
  { key: "student1", name: "Alyssa Tan", email: "student1@aigenius.demo", role: "student", password: "Demo1234", grade: "Year 4", code: "ALYSA" },
  { key: "student2", name: "Ryan Lim", email: "student2@aigenius.demo", role: "student", password: "Demo1234", grade: "Year 4", code: "RYANL" },
  { key: "student3", name: "Mika Wong", email: "student3@aigenius.demo", role: "student", password: "Demo1234", grade: "Year 5", code: "MIKAW" },
  { key: "student4", name: "Sofia Chen", email: "student4@aigenius.demo", role: "student", password: "Demo1234", grade: "Year 5", code: "SOFIA" },
  { key: "student5", name: "Ethan Ng", email: "student5@aigenius.demo", role: "student", password: "Demo1234", grade: "Year 4", code: "ETHAN" },
  { key: "parent1", name: "Mrs Tan", email: "parent1@aigenius.demo", role: "parent", password: "Demo1234" },
  { key: "parent2", name: "Mr Lim", email: "parent2@aigenius.demo", role: "parent", password: "Demo1234" },
];

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers ?? {}),
    },
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(payload?.message ?? payload?.msg ?? text ?? `HTTP ${response.status}`);
  }

  return payload;
}

async function rest(table, options = {}) {
  const { method = "GET", body, query = "", prefer = "" } = options;
  return request(`${restUrl}/${table}${query}`, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: prefer ? { Prefer: prefer } : undefined,
  });
}

async function upsert(table, rows, onConflict = "id") {
  return rest(table, {
    method: "POST",
    query: `?on_conflict=${encodeURIComponent(onConflict)}`,
    body: rows,
    prefer: "resolution=merge-duplicates,return=representation",
  });
}

async function updateById(table, id, values) {
  return rest(table, {
    method: "PATCH",
    query: `?id=eq.${encodeURIComponent(id)}`,
    body: values,
    prefer: "return=minimal",
  });
}

async function listUsers() {
  const payload = await request(`${authUrl}/admin/users?page=1&per_page=1000`, {
    method: "GET",
  });
  return payload.users ?? [];
}

async function ensureAuthUsers() {
  const existingUsers = await listUsers();
  const byEmail = new Map(existingUsers.map((user) => [user.email, user]));
  const ids = {};

  for (const account of accounts) {
    const existing = byEmail.get(account.email);
    if (existing) {
      ids[account.key] = existing.id;
      continue;
    }

    const created = await request(`${authUrl}/admin/users`, {
      method: "POST",
      body: JSON.stringify({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
          name: account.name,
          role: account.role,
        },
      }),
    });
    ids[account.key] = created.id;
  }

  return ids;
}

function profileCode(account) {
  if (account.role === "admin") return "ADMIN";
  if (account.key === "teacher1") return "MEIYA";
  if (account.key === "teacher2") return "DANIE";
  if (account.key === "parent1") return "TANPA";
  if (account.key === "parent2") return "LIMPA";
  return account.code;
}

function gradeNumber(grade) {
  return Number(String(grade).replace("Year ", "")) || 4;
}

async function seed() {
  const userIds = await ensureAuthUsers();

  await upsert("centres", [
    {
      id: centreId,
      name: "AiGenius Tuition Centre",
      logo_url: "/aigenius-logo.png",
    },
  ]);

  await upsert(
    "profiles",
    accounts.map((account) => ({
      id: userIds[account.key],
      centre_id: centreId,
      name: account.name,
      email: account.email,
      role: account.role,
      profile_code: profileCode(account),
      avatar_url: "/aigenius-logo.png",
    })),
  );

  const studentAccounts = accounts.filter((account) => account.role === "student");
  await upsert(
    "student_profiles",
    studentAccounts.map((account, index) => ({
      id: studentProfileIds[index],
      user_id: userIds[account.key],
      parent_ids: index < 2 ? [userIds.parent1] : index < 4 ? [userIds.parent2] : [],
      referral_code: account.code,
      school_grade: account.grade,
      actual_learning_level: Math.max(1, gradeNumber(account.grade) - (index % 2 ? 0.5 : 1)),
      target_learning_level: gradeNumber(account.grade),
      subjects: ["English"],
      total_xp: 360 + index * 120,
      star_coins: 40 + index * 15,
      streak_days: 2 + index,
      attendance_rate: 86 + index * 3,
      homework_completion_rate: 72 + index * 5,
    })),
    "user_id",
  );

  await upsert(
    "pets",
    studentAccounts.map((account, index) => ({
      id: petIds[index],
      student_id: studentProfileIds[index],
      name: `${account.name.split(" ")[0]}'s Nova`,
      species: index % 2 ? "Moon Cat" : "Star Pup",
      rarity: index === 0 ? "epic" : "common",
      stage: index > 2 ? "junior" : "baby",
      level: 4 + index,
      xp: 360 + index * 120,
      power: 48 + index * 4,
      wisdom: 52 + index * 4,
      speed: 50 + index * 3,
      focus: 55 + index * 3,
      courage: 46 + index * 4,
      kindness: 58 + index * 3,
      image_url: `/pets/pet${String((index % 5) + 1).padStart(2, "0")}.png`,
    })),
    "student_id",
  );

  await Promise.all(
    studentProfileIds.map((studentProfileId, index) =>
      updateById("student_profiles", studentProfileId, { pet_id: petIds[index] }),
    ),
  );

  await upsert("classrooms", [
    {
      id: classIds.y4,
      centre_id: centreId,
      teacher_id: userIds.teacher1,
      name: "Year 4 English Quest",
      subject: "English",
      grade: "Year 4",
      schedule: "Mon and Wed, 4:00 PM",
    },
    {
      id: classIds.y5,
      centre_id: centreId,
      teacher_id: userIds.teacher2,
      name: "Year 5 English Mastery",
      subject: "English",
      grade: "Year 5",
      schedule: "Tue and Thu, 5:15 PM",
    },
  ]);

  await upsert("classroom_students", [
    { classroom_id: classIds.y4, student_id: studentProfileIds[0] },
    { classroom_id: classIds.y4, student_id: studentProfileIds[1] },
    { classroom_id: classIds.y4, student_id: studentProfileIds[4] },
    { classroom_id: classIds.y5, student_id: studentProfileIds[2] },
    { classroom_id: classIds.y5, student_id: studentProfileIds[3] },
  ], "classroom_id,student_id");

  await upsert("teacher_student_links", [
    { teacher_id: userIds.teacher1, student_id: studentProfileIds[0], status: "active", source: "classroom" },
    { teacher_id: userIds.teacher1, student_id: studentProfileIds[1], status: "active", source: "classroom" },
    { teacher_id: userIds.teacher1, student_id: studentProfileIds[4], status: "active", source: "classroom" },
    { teacher_id: userIds.teacher2, student_id: studentProfileIds[2], status: "active", source: "classroom" },
    { teacher_id: userIds.teacher2, student_id: studentProfileIds[3], status: "active", source: "classroom" },
  ], "teacher_id,student_id");

  await upsert("parent_student_links", [
    { parent_id: userIds.parent1, student_id: studentProfileIds[0], status: "active", source: "admin" },
    { parent_id: userIds.parent1, student_id: studentProfileIds[1], status: "active", source: "admin" },
    { parent_id: userIds.parent2, student_id: studentProfileIds[2], status: "active", source: "admin" },
    { parent_id: userIds.parent2, student_id: studentProfileIds[3], status: "active", source: "admin" },
  ], "parent_id,student_id");

  const readingQuestions = [
    {
      id: "reading",
      type: "reading",
      prompt: "Sara joins an English reading circle. What did Sara practise?",
      options: ["Reading and main idea", "Only drawing", "Buying snacks", "Sleeping"],
      answer: "Reading and main idea",
      explanation: "The passage focuses on reading and finding the main idea.",
    },
    {
      id: "grammar",
      type: "grammar",
      prompt: "Choose the correct sentence.",
      options: ["She goes to class.", "She go to class.", "She going class.", "She gone class."],
      answer: "She goes to class.",
      explanation: "Use present simple with a singular subject.",
    },
    {
      id: "vocabulary",
      type: "vocabulary",
      prompt: "Which word is closest to explain?",
      options: ["make clear", "hide", "forget", "run"],
      answer: "make clear",
      explanation: "To explain means to make an idea clear.",
    },
  ];
  await upsert("learning_tasks", [
    {
      id: taskIds[0],
      class_id: classIds.y4,
      teacher_id: userIds.teacher1,
      title: "Year 4 Reading Foundation Quest",
      description: "Malaysia-aligned English task focused on main idea and vocabulary.",
      subject: "English",
      school_grade: "Year 4",
      cefr_level: "A1",
      skill_domain: "Reading",
      skill_tags: ["main idea", "context clues", "vocabulary"],
      task_band: "Foundation",
      questions: readingQuestions,
      content: { readingPassage: "Sara joins an English reading circle at her tuition centre." },
      difficulty_level: 2,
      due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
      xp_reward: 49,
      coin_reward: 13,
      status: "assigned",
    },
    {
      id: taskIds[1],
      class_id: classIds.y5,
      teacher_id: userIds.teacher2,
      title: "Year 5 Grammar Standard Quest",
      description: "Malaysia-aligned English task focused on grammar accuracy.",
      subject: "English",
      school_grade: "Year 5",
      cefr_level: "A2",
      skill_domain: "Grammar",
      skill_tags: ["tenses", "subject-verb agreement", "sentence patterns"],
      task_band: "Standard",
      questions: readingQuestions,
      content: { readingPassage: "Students practise grammar through short classroom sentences." },
      difficulty_level: 3,
      due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
      xp_reward: 71,
      coin_reward: 17,
      status: "assigned",
    },
  ]);

  await upsert("task_submissions", [
    {
      task_id: taskIds[0],
      student_id: studentProfileIds[0],
      score: 67,
      status: "submitted",
      auto_feedback: JSON.stringify({
        score: 67,
        answers: {
          reading: "Reading and main idea",
          grammar: "She go to class.",
          vocabulary: "make clear",
        },
        message: "Good progress. Review grammar accuracy.",
      }),
      submitted_at: new Date().toISOString(),
    },
  ], "task_id,student_id");

  await upsert(
    "subject_skills",
    studentProfileIds.flatMap((studentId, index) => [
      {
        student_id: studentId,
        subject: "English",
        skill_name: "Reading",
        level: 2 + index,
        mastery_percentage: 58 + index * 7,
        weakness_tag: "main idea",
        last_assessed_at: new Date().toISOString(),
      },
      {
        student_id: studentId,
        subject: "English",
        skill_name: "Grammar",
        level: 2 + index,
        mastery_percentage: 52 + index * 8,
        weakness_tag: "subject-verb agreement",
        last_assessed_at: new Date().toISOString(),
      },
    ]),
    "student_id,skill_name",
  );

  await upsert("parent_reports", [
    {
      student_id: studentProfileIds[0],
      month: "June 2026",
      summary: "Alyssa is improving reading consistency and needs extra grammar support.",
      strengths: ["Reading effort", "Vocabulary confidence"],
      weaknesses: ["subject-verb agreement"],
      recommendations: ["Practise 10 minutes of grammar correction daily."],
      teacher_comment: "Alyssa is motivated and responds well to short guided practice.",
      generated_at: new Date().toISOString(),
    },
  ], "student_id,month");

  console.log("Demo seed completed.");
  console.log("Demo logins:");
  for (const account of accounts) {
    console.log(`${account.role}: ${account.email} / ${account.password}`);
  }
}

seed().catch((error) => {
  console.error(`Demo seed failed: ${error.message}`);
  process.exit(1);
});
