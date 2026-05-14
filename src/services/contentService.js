import shadowing from "../data/shadowing.json";
import sentenceBuilder from "../data/sentenceBuilder.json";
import interviewPractice from "../data/interviewPractice.json";
import listeningComprehension from "../data/listeningComprehension.json";

export const MODULE_DEFINITIONS = {
  shadowing: {
    id: "shadowing",
    label: "Shadowing",
    shortLabel: "Shadow",
    route: "shadowing",
    progressLabel: "Shadowing"
  },
  sentenceBuilder: {
    id: "sentenceBuilder",
    label: "Sentence Builder",
    shortLabel: "Build",
    route: "sentenceBuilder",
    progressLabel: "Sentence Builder"
  },
  interviewPractice: {
    id: "interviewPractice",
    label: "Interview Practice",
    shortLabel: "Interview",
    route: "interviewPractice",
    progressLabel: "Interview Practice"
  },
  listeningComprehension: {
    id: "listeningComprehension",
    label: "Listening",
    shortLabel: "Listen",
    route: "listeningComprehension",
    progressLabel: "Listening"
  }
};

export const NAVIGATION_MODULES = [
  { id: "dashboard", label: "Dashboard", shortLabel: "Home" },
  MODULE_DEFINITIONS.shadowing,
  MODULE_DEFINITIONS.sentenceBuilder,
  MODULE_DEFINITIONS.interviewPractice,
  MODULE_DEFINITIONS.listeningComprehension,
  { id: "progress", label: "Progress", shortLabel: "Progress" }
];

export const contentLibrary = {
  shadowing,
  sentenceBuilder,
  interviewPractice,
  listeningComprehension
};

export function getModuleLessons(moduleId) {
  return contentLibrary[moduleId] || [];
}

export function createDailyPracticePlan(library = contentLibrary) {
  return [
    ...library.shadowing.slice(0, 5).map((lesson) => createDailyItem("shadowing", lesson)),
    ...library.sentenceBuilder.slice(0, 3).map((lesson) => createDailyItem("sentenceBuilder", lesson)),
    ...library.interviewPractice.slice(0, 2).map((lesson) => createDailyItem("interviewPractice", lesson)),
    ...library.listeningComprehension.slice(0, 5).map((lesson) => createDailyItem("listeningComprehension", lesson))
  ];
}

function createDailyItem(moduleId, lesson) {
  return {
    type: moduleId,
    moduleId,
    lesson
  };
}
