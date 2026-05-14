export function scoreMultipleChoice(selectedIndex, correctIndex) {
  const correct = Number(selectedIndex) === Number(correctIndex);
  return {
    correct,
    score: correct ? 1 : 0
  };
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
