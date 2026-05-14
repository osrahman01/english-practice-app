import { useMemo, useState } from "react";
import { playLessonAudio, playLessonAudioSlow, playText } from "../services/speechService.js";
import { createPracticeAttempt, saveAttempt } from "../services/progressService.js";
import { createShuffledOptions, scoreMultipleChoice } from "../services/scoringService.js";
import { MODULE_DEFINITIONS, createDailyPracticePlan } from "../services/contentService.js";

function DailyPractice({ data, onNavigate }) {
  const plan = useMemo(() => createDailyPracticePlan(data), [data]);
  const [index, setIndex] = useState(0);
  const [statusByIndex, setStatusByIndex] = useState({});
  const [completed, setCompleted] = useState(false);
  const item = plan[index];
  const lesson = item.lesson;
  const currentStatus = statusByIndex[index];
  const isFinalItem = index >= plan.length - 1;

  const markDifficulty = (difficulty) => {
    if (currentStatus?.difficulty !== difficulty) {
      saveAttempt(createPracticeAttempt({
        module: item.type,
        lesson,
        activityType: dailyActivityType(item.type),
        result: { difficulty }
      }));
    }
    setStatusByIndex((current) => ({
      ...current,
      [index]: { done: true, difficulty }
    }));
  };

  const answerListening = (optionIndex) => {
    if (currentStatus?.done) return;
    const result = scoreMultipleChoice(optionIndex, lesson.correctAnswerIndex);
    saveAttempt(createPracticeAttempt({
      module: item.type,
      lesson,
      activityType: "multiple-choice-listening",
      result: {
        ...result,
        selectedIndex: optionIndex
      }
    }));
    setStatusByIndex((current) => ({
      ...current,
      [index]: {
        done: true,
        ...result,
        optionIndex
      }
    }));
  };

  const goNext = () => {
    if (isFinalItem) {
      setCompleted(true);
      return;
    }
    setIndex((current) => Math.min(current + 1, plan.length - 1));
  };

  const goPrevious = () => {
    setIndex((current) => Math.max(current - 1, 0));
  };

  if (completed) {
    return (
      <section>
        <div className="page-heading">
          <p className="eyebrow">Daily Practice</p>
          <h1>Session complete</h1>
          <p>You finished today&apos;s 15-item practice session. Review your progress or start another round when you are ready.</p>
        </div>
        <article className="practice-card completion-card">
          <strong>Great work. Your attempts have been saved locally.</strong>
          <div className="daily-actions">
            <button className="primary-button" type="button" onClick={() => onNavigate("progress")}>View Progress</button>
            <button className="secondary-button" type="button" onClick={() => { setIndex(0); setStatusByIndex({}); setCompleted(false); }}>Start Again</button>
          </div>
        </article>
      </section>
    );
  }

  return (
    <section>
      <div className="page-heading">
        <p className="eyebrow">Daily Practice</p>
        <h1>15-item guided session</h1>
        <p>Move through a balanced practice set for speaking, interview confidence, and listening.</p>
      </div>
      <article className="practice-card">
        <div className="daily-progress-row">
          <div className="lesson-meta">
            <span>{labelFor(item.type)}</span>
            <span>{lesson.category}</span>
          </div>
          <strong>{index + 1} / {plan.length}</strong>
        </div>
        <div className="daily-progress-track" aria-hidden="true">
          <i style={{ width: `${((index + 1) / plan.length) * 100}%` }} />
        </div>
        <DailyLesson item={item} status={currentStatus} onAnswer={answerListening} />
        <div className="daily-actions">
          {item.type === "listeningComprehension" ? (
            <span className="muted">{currentStatus?.done ? "Answer saved. Continue when ready." : "Choose an answer, or skip if you want to move on."}</span>
          ) : (
            <>
              <button className={currentStatus?.difficulty === "easy" ? "difficulty easy selected" : "difficulty easy"} type="button" onClick={() => markDifficulty("easy")}>Easy</button>
              <button className={currentStatus?.difficulty === "medium" ? "difficulty medium selected" : "difficulty medium"} type="button" onClick={() => markDifficulty("medium")}>Medium</button>
              <button className={currentStatus?.difficulty === "hard" ? "difficulty hard selected" : "difficulty hard"} type="button" onClick={() => markDifficulty("hard")}>Hard</button>
            </>
          )}
          <div className="step-nav">
            <button className="secondary-button" type="button" onClick={goPrevious} disabled={index === 0}>Previous</button>
            <button className="primary-button" type="button" onClick={goNext}>
              {isFinalItem ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </article>
    </section>
  );
}

function DailyLesson({ item, status, onAnswer }) {
  const lesson = item.lesson;
  if (item.type === "shadowing") {
    return (
      <>
        <h2 className="practice-prompt">{lesson.text}</h2>
        <p className="tip-box">{lesson.tip}</p>
        <PlayControls lesson={lesson} text={lesson.text} />
      </>
    );
  }

  if (item.type === "sentenceBuilder") {
    return (
      <>
        <h2>{cleanLessonTitle(lesson.title)}</h2>
        <div className="step-list">
          {lesson.steps.map((step, index) => (
            <div className="step-item" key={step}>
              <span>{index + 1}</span>
              <strong>{step}</strong>
              <button className="secondary-button" type="button" onClick={() => playText(step)}>Play</button>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (item.type === "interviewPractice") {
    return (
      <>
        <h2 className="practice-prompt">{lesson.question}</h2>
        <PlayControls lesson={lesson} text={lesson.sampleAnswer} label="Play Sample Answer" />
        <div className="sample-answer"><p>{lesson.sampleAnswer}</p></div>
      </>
    );
  }

  return (
    <>
      <h2>Listen first, then answer.</h2>
      <PlayControls lesson={lesson} text={lesson.audioText} />
      <h3 className="question-text">{lesson.question}</h3>
      <div className="option-grid">
        {createShuffledOptions(lesson).map((option) => (
          <button
            key={option.id}
            className={`answer-option ${status && option.originalIndex === lesson.correctAnswerIndex ? "correct" : ""} ${status && status.optionIndex === option.originalIndex && !status.correct ? "wrong" : ""}`}
            type="button"
            disabled={Boolean(status)}
            onClick={() => onAnswer(option.originalIndex)}
          >
            {option.text}
          </button>
        ))}
      </div>
      {status ? <p className="tip-box">{lesson.explanation}</p> : null}
    </>
  );
}

function PlayControls({ lesson, text, label = "Play" }) {
  return (
    <div className="play-row">
      <button className="play-button" type="button" onClick={() => playLessonAudio(lesson, text)}>{label}</button>
      <button className="secondary-button" type="button" onClick={() => playLessonAudioSlow(lesson, text)}>Slow Play</button>
    </div>
  );
}

function labelFor(type) {
  return MODULE_DEFINITIONS[type]?.progressLabel || type;
}

function dailyActivityType(type) {
  return {
    shadowing: "daily-shadowing-repeat",
    sentenceBuilder: "daily-sentence-expansion",
    interviewPractice: "daily-interview-answer"
  }[type] || "daily-practice";
}

function cleanLessonTitle(title) {
  return String(title || "").replace(/\s+\d+$/, "");
}

export default DailyPractice;
