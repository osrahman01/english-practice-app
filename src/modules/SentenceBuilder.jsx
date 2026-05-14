import { useMemo, useState } from "react";
import FilterBar from "../components/FilterBar.jsx";
import PracticeControls from "../components/PracticeControls.jsx";
import { playText } from "../services/speechService.js";
import { createPracticeAttempt, saveAttempt } from "../services/progressService.js";

function SentenceBuilder({ lessons }) {
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(1);

  const filtered = useMemo(() => lessons.filter((lesson) => (
    (category === "all" || lesson.category === category) &&
    (level === "all" || String(lesson.level) === level)
  )), [lessons, category, level]);
  const lesson = filtered[index] || filtered[0];
  const visibleSteps = lesson?.steps?.slice(0, revealed) || [];

  const move = (nextIndex) => {
    setIndex(nextIndex);
    setRevealed(1);
  };

  const mark = (difficulty) => {
    if (!lesson) return;
    saveAttempt(createPracticeAttempt({
      module: "sentenceBuilder",
      lesson,
      activityType: "sentence-expansion",
      result: { difficulty }
    }));
    move(Math.min(index + 1, filtered.length - 1));
  };

  return (
    <section>
      <div className="page-heading">
        <p className="eyebrow">Practice module</p>
        <h1>Sentence Builder</h1>
        <p>Reveal one step at a time, repeat aloud, and build a stronger answer.</p>
      </div>
      <FilterBar lessons={lessons} category={category} level={level} onCategoryChange={(value) => { setCategory(value); move(0); }} onLevelChange={(value) => { setLevel(value); move(0); }} />
      {lesson ? (
        <article className="practice-card">
          <div className="lesson-meta">
            <span>{lesson.category}</span>
            <span>Level {lesson.level}</span>
            <span>{index + 1} / {filtered.length}</span>
          </div>
          <h2>{lesson.title}</h2>
          <div className="step-list">
            {visibleSteps.map((step, stepIndex) => (
              <div className="step-item" key={step}>
                <span>{stepIndex + 1}</span>
                <strong>{step}</strong>
                <button className="secondary-button" type="button" onClick={() => playText(step)}>Play</button>
              </div>
            ))}
          </div>
          <div className="play-row">
            <button className="primary-button" type="button" onClick={() => setRevealed((current) => Math.min(current + 1, lesson.steps.length))} disabled={revealed >= lesson.steps.length}>
              Reveal Next Step
            </button>
            <button className="secondary-button" type="button" onClick={() => playText(visibleSteps[visibleSteps.length - 1])}>Play Current</button>
          </div>
          <p className="tip-box">{lesson.tip}</p>
          <PracticeControls
            onPrevious={() => move(Math.max(index - 1, 0))}
            onNext={() => move(Math.min(index + 1, filtered.length - 1))}
            onMark={mark}
            disablePrevious={index === 0}
            disableNext={index >= filtered.length - 1}
          />
        </article>
      ) : <div className="empty-panel">No lessons match this filter.</div>}
    </section>
  );
}

export default SentenceBuilder;
