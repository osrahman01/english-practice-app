export function scoreMultipleChoice(selectedIndex, correctIndex) {
  const correct = Number(selectedIndex) === Number(correctIndex);
  return {
    correct,
    score: correct ? 1 : 0
  };
}

export function createShuffledOptions(lesson) {
  const options = lesson.options.map((text, originalIndex) => ({
    id: `${lesson.id}-${originalIndex}`,
    text,
    originalIndex,
    isCorrect: originalIndex === lesson.correctAnswerIndex
  }));

  return seededShuffle(options, lesson.id || lesson.audioText || "listening");
}

function seededShuffle(items, seedText) {
  const result = [...items];
  let seed = createSeed(seedText);

  for (let index = result.length - 1; index > 0; index -= 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const swapIndex = seed % (index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  if (result[0]?.isCorrect && result.length > 1) {
    [result[0], result[1]] = [result[1], result[0]];
  }

  return result;
}

function createSeed(value) {
  return String(value).split("").reduce((hash, char) => (
    ((hash << 5) - hash + char.charCodeAt(0)) >>> 0
  ), 2166136261);
}

export function compareTranscript() {
  return null;
}

export function scoreGrammar() {
  return null;
}

export function scoreInterviewAnswer() {
  return null;
}
