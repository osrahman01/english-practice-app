const STORAGE_KEY = "englishPractice.phase1.attempts";
const ATTEMPT_SCHEMA_VERSION = 1;

let attemptStore = {
  read() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  },
  write(attempts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
  },
  clear() {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export function setAttemptStore(nextStore) {
  attemptStore = nextStore;
}

export function createPracticeAttempt({ module, lesson, activityType = "practice", result = {}, context = {} }) {
  return {
    schemaVersion: ATTEMPT_SCHEMA_VERSION,
    phase: 1,
    module,
    activityType,
    lessonId: lesson.id,
    category: lesson.category,
    level: lesson.level,
    difficulty: result.difficulty,
    correct: result.correct,
    score: result.score,
    selectedIndex: result.selectedIndex,
    transcript: result.transcript || null,
    feedback: result.feedback || null,
    cvContextId: context.cvContextId || null,
    employeeId: context.employeeId || null,
    managerGroupId: context.managerGroupId || null,
    metadata: {
      futureTags: lesson.futureTags || [],
      source: "phase1-content-pack",
      ...context.metadata
    }
  };
}

export function saveAttempt(attempt) {
  const attempts = getAttempts();
  const nextAttempt = {
    schemaVersion: ATTEMPT_SCHEMA_VERSION,
    id: `${attempt.module}-${attempt.lessonId}-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...attempt
  };
  attemptStore.write([nextAttempt, ...attempts]);
  return nextAttempt;
}

export function getAttempts() {
  try {
    return attemptStore.read();
  } catch {
    return [];
  }
}

export function getProgressSummary() {
  const attempts = getAttempts();
  const summary = {
    totalAttempts: attempts.length,
    totalPracticedItems: new Set(attempts.map((attempt) => attempt.lessonId)).size,
    easy: 0,
    medium: 0,
    hard: 0,
    byModule: {},
    listeningCorrect: 0,
    listeningTotal: 0
  };

  attempts.forEach((attempt) => {
    if (attempt.difficulty === "easy") summary.easy += 1;
    if (attempt.difficulty === "medium") summary.medium += 1;
    if (attempt.difficulty === "hard") summary.hard += 1;
    summary.byModule[attempt.module] = (summary.byModule[attempt.module] || 0) + 1;
    if (attempt.module === "listeningComprehension" && typeof attempt.correct === "boolean") {
      summary.listeningTotal += 1;
      if (attempt.correct) summary.listeningCorrect += 1;
    }
  });

  summary.listeningAccuracy = summary.listeningTotal
    ? Math.round((summary.listeningCorrect / summary.listeningTotal) * 100)
    : 0;

  return summary;
}

export function getRecentAttempts(limit = 8) {
  return getAttempts().slice(0, limit);
}

export function exportAttemptsToCsv() {
  const attempts = getAttempts();
  const headers = [
    "createdAt",
    "schemaVersion",
    "phase",
    "module",
    "activityType",
    "lessonId",
    "category",
    "level",
    "difficulty",
    "correct",
    "score",
    "selectedIndex",
    "employeeId",
    "managerGroupId",
    "cvContextId"
  ];
  const rows = attempts.map((attempt) => headers.map((key) => csvCell(attempt[key])).join(","));
  return [headers.join(","), ...rows].join("\n");
}

export function clearProgress() {
  attemptStore.clear();
}

function csvCell(value) {
  if (value === undefined || value === null) return "";
  return `"${String(value).replaceAll("\"", "\"\"")}"`;
}
