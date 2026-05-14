import { useMemo, useState } from "react";
import FilterBar from "../components/FilterBar.jsx";
import PracticeControls from "../components/PracticeControls.jsx";
import { playLessonAudio, playLessonAudioSlow } from "../services/speechService.js";
import { createPracticeAttempt, saveAttempt } from "../services/progressService.js";

function ShadowingPractice({ lessons }) {
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [index, setIndex] = useState(0);

  const filtered = useMemo(() => lessons.filter((lesson) => (
    (category === "all" || lesson.category === category) &&
    (level === "all" || String(lesson.level) === level)
  )), [lessons, category, level]);
  const lesson = filtered[index] || filtered[0];

  const resetCategory = (value) => {
    setCategory(value);
    setIndex(0);
  };

  const resetLevel = (value) => {
    setLevel(value);
    setIndex(0);
  };

  const mark = (difficulty) => {
    if (!lesson) return;
    saveAttempt(createPracticeAttempt({
      module: "shadowing",
      lesson,
      activityType: "shadowing-repeat",
      result: { difficulty }
    }));
    setIndex((current) => Math.min(current + 1, filtered.length - 1));
  };

  return (
    <PracticeScreen title="Shadowing Practice" subtitle="Listen, repeat, then rate how confident it felt.">
      <FilterBar lessons={lessons} category={category} level={level} onCategoryChange={resetCategory} onLevelChange={resetLevel} />
      {lesson ? (
        <article className="practice-card">
          <LessonMeta lesson={lesson} index={index} total={filtered.length} />
          <h2 className="practice-prompt">{lesson.text}</h2>
          <p className="tip-box">{lesson.tip}</p>
          <div className="play-row">
            <button className="play-button" type="button" onClick={() => playLessonAudio(lesson, lesson.text)}>Play</button>
            <button className="secondary-button" type="button" onClick={() => playLessonAudioSlow(lesson, lesson.text)}>Slow Play</button>
          </div>
          <PracticeControls
            onPrevious={() => setIndex((current) => Math.max(current - 1, 0))}
            onNext={() => setIndex((current) => Math.min(current + 1, filtered.length - 1))}
            onMark={mark}
            disablePrevious={index === 0}
            disableNext={index >= filtered.length - 1}
          />
        </article>
      ) : <EmptyPractice />}
    </PracticeScreen>
  );
}

function PracticeScreen({ title, subtitle, children }) {
  return (
    <section>
      <div className="page-heading">
        <p className="eyebrow">Practice module</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function LessonMeta({ lesson, index, total }) {
  return (
    <div className="lesson-meta">
      <span>{lesson.category}</span>
      <span>Level {lesson.level}</span>
      <span>{index + 1} / {total}</span>
    </div>
  );
}

function EmptyPractice() {
  return <div className="empty-panel">No lessons match this filter.</div>;
}

export default ShadowingPractice;
