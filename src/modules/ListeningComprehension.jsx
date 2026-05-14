import { useMemo, useState } from "react";
import FilterBar from "../components/FilterBar.jsx";
import { playLessonAudio, playLessonAudioSlow } from "../services/speechService.js";
import { createPracticeAttempt, saveAttempt } from "../services/progressService.js";
import { scoreMultipleChoice } from "../services/scoringService.js";

function ListeningComprehension({ lessons }) {
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState(null);

  const filtered = useMemo(() => lessons.filter((lesson) => (
    (category === "all" || lesson.category === category) &&
    (level === "all" || String(lesson.level) === level)
  )), [lessons, category, level]);
  const lesson = filtered[index] || filtered[0];

  const next = () => {
    setResult(null);
    setIndex((current) => Math.min(current + 1, filtered.length - 1));
  };

  const answer = (selectedIndex) => {
    const scored = scoreMultipleChoice(selectedIndex, lesson.correctAnswerIndex);
    setResult({ ...scored, selectedIndex });
    saveAttempt(createPracticeAttempt({
      module: "listeningComprehension",
      lesson,
      activityType: "multiple-choice-listening",
      result: {
        ...scored,
        selectedIndex
      }
    }));
  };

  return (
    <section>
      <div className="page-heading">
        <p className="eyebrow">Practice module</p>
        <h1>Listening Comprehension</h1>
        <p>Play the prompt, choose the meaning, and review the explanation.</p>
      </div>
      <FilterBar lessons={lessons} category={category} level={level} onCategoryChange={(value) => { setCategory(value); setIndex(0); setResult(null); }} onLevelChange={(value) => { setLevel(value); setIndex(0); setResult(null); }} />
      {lesson ? (
        <article className="practice-card">
          <div className="lesson-meta">
            <span>{lesson.category}</span>
            <span>Level {lesson.level}</span>
            <span>{index + 1} / {filtered.length}</span>
          </div>
          <div className="listening-prompt">
            <h2>Listen first, then answer.</h2>
            <div className="play-row">
              <button className="play-button" type="button" onClick={() => playLessonAudio(lesson, lesson.audioText)}>Play Audio</button>
              <button className="secondary-button" type="button" onClick={() => playLessonAudioSlow(lesson, lesson.audioText)}>Slow Play</button>
            </div>
          </div>
          <h3 className="question-text">{lesson.question}</h3>
          <div className="option-grid">
            {lesson.options.map((option, optionIndex) => {
              const isCorrect = result && optionIndex === lesson.correctAnswerIndex;
              const isWrong = result && optionIndex === result.selectedIndex && !result.correct;
              return (
                <button
                  key={option}
                  className={`answer-option ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`}
                  type="button"
                  onClick={() => answer(optionIndex)}
                  disabled={Boolean(result)}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {result ? (
            <div className={result.correct ? "feedback correct" : "feedback wrong"}>
              <strong>{result.correct ? "Correct" : "Not quite"}</strong>
              <p>{lesson.explanation}</p>
              <button className="primary-button" type="button" onClick={next} disabled={index >= filtered.length - 1}>Next</button>
            </div>
          ) : null}
        </article>
      ) : <div className="empty-panel">No lessons match this filter.</div>}
    </section>
  );
}

export default ListeningComprehension;
