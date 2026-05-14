import { useMemo, useState } from "react";
import FilterBar from "../components/FilterBar.jsx";
import PracticeControls from "../components/PracticeControls.jsx";
import { playLessonAudio, playText } from "../services/speechService.js";
import { createPracticeAttempt, saveAttempt } from "../services/progressService.js";

function InterviewPractice({ lessons }) {
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [index, setIndex] = useState(0);

  const filtered = useMemo(() => lessons.filter((lesson) => (
    (category === "all" || lesson.category === category) &&
    (level === "all" || String(lesson.level) === level)
  )), [lessons, category, level]);
  const lesson = filtered[index] || filtered[0];

  const move = (nextIndex) => setIndex(nextIndex);
  const mark = (difficulty) => {
    if (!lesson) return;
    saveAttempt(createPracticeAttempt({
      module: "interviewPractice",
      lesson,
      activityType: "interview-answer",
      result: { difficulty }
    }));
    move(Math.min(index + 1, filtered.length - 1));
  };

  return (
    <section>
      <div className="page-heading">
        <p className="eyebrow">Practice module</p>
        <h1>Interview Practice</h1>
        <p>Use a framework, listen to a model answer, then practice your own version aloud.</p>
      </div>
      <FilterBar lessons={lessons} category={category} level={level} onCategoryChange={(value) => { setCategory(value); move(0); }} onLevelChange={(value) => { setLevel(value); move(0); }} />
      {lesson ? (
        <article className="practice-card">
          <div className="lesson-meta">
            <span>{lesson.category}</span>
            <span>Level {lesson.level}</span>
            <span>{index + 1} / {filtered.length}</span>
          </div>
          <h2 className="practice-prompt">{lesson.question}</h2>
          <div className="play-row">
            <button className="play-button" type="button" onClick={() => playLessonAudio(lesson, lesson.question)}>Ask Question</button>
            <button className="secondary-button" type="button" onClick={() => playText(lesson.sampleAnswer)}>Play Sample Answer</button>
          </div>
          <div className="two-column">
            <Panel title="Answer framework" items={lesson.framework} />
            <Panel title="Self-review checklist" items={lesson.selfReviewChecklist} />
          </div>
          <div className="sample-answer">
            <h3>Sample answer</h3>
            <p>{lesson.sampleAnswer}</p>
          </div>
          <p className="tip-box">{lesson.commonMistake}</p>
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

function Panel({ title, items }) {
  return (
    <div className="info-panel">
      <h3>{title}</h3>
      <ol>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ol>
    </div>
  );
}

export default InterviewPractice;
