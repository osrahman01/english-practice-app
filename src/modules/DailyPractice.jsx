import { useMemo, useState } from "react";
import { playLessonAudio, playLessonAudioSlow, playText } from "../services/speechService.js";
import { createPracticeAttempt, saveAttempt } from "../services/progressService.js";
import { scoreMultipleChoice } from "../services/scoringService.js";
import { MODULE_DEFINITIONS, createDailyPracticePlan } from "../services/contentService.js";

function DailyPractice({ data, onNavigate }) {
  const plan = useMemo(() => createDailyPracticePlan(data), [data]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const item = plan[index];
  const lesson = item.lesson;

  const markDifficulty = (difficulty) => {
    saveAttempt(createPracticeAttempt({
      module: item.type,
      lesson,
      activityType: dailyActivityType(item.type),
      result: { difficulty }
    }));
    goNext();
  };

  const answerListening = (optionIndex) => {
    const result = scoreMultipleChoice(optionIndex, lesson.correctAnswerIndex);
    setSelected({ ...result, optionIndex });
    saveAttempt(createPracticeAttempt({
      module: item.type,
      lesson,
      activityType: "multiple-choice-listening",
      result: {
        ...result,
        selectedIndex: optionIndex
      }
    }));
  };

  const goNext = () => {
    setSelected(null);
    setIndex((current) => Math.min(current + 1, plan.length - 1));
  };

  return (
    <section>
      <div className="page-heading">
        <p className="eyebrow">Daily Practice</p>
        <h1>15-item guided session</h1>
        <p>Move through a balanced practice set for speaking, interview confidence, and listening.</p>
      </div>
      <article className="practice-card">
        <div className="lesson-meta">
          <span>{labelFor(item.type)}</span>
          <span>{lesson.category}</span>
          <span>{index + 1} / {plan.length}</span>
        </div>
        <DailyLesson item={item} selected={selected} onAnswer={answerListening} />
        <div className="daily-actions">
          {item.type === "listeningComprehension" ? (
            <button className="primary-button" type="button" onClick={goNext} disabled={!selected || index >= plan.length - 1}>Next</button>
          ) : (
            <>
              <button className="difficulty easy" type="button" onClick={() => markDifficulty("easy")}>Easy</button>
              <button className="difficulty medium" type="button" onClick={() => markDifficulty("medium")}>Medium</button>
              <button className="difficulty hard" type="button" onClick={() => markDifficulty("hard")}>Hard</button>
            </>
          )}
          {index >= plan.length - 1 ? <button className="secondary-button" type="button" onClick={() => onNavigate("progress")}>Finish and View Progress</button> : null}
        </div>
      </article>
    </section>
  );
}

function DailyLesson({ item, selected, onAnswer }) {
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
        <h2>{lesson.title}</h2>
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
        {lesson.options.map((option, index) => (
          <button
            key={option}
            className={`answer-option ${selected && index === lesson.correctAnswerIndex ? "correct" : ""} ${selected && selected.optionIndex === index && !selected.correct ? "wrong" : ""}`}
            type="button"
            disabled={Boolean(selected)}
            onClick={() => onAnswer(index)}
          >
            {option}
          </button>
        ))}
      </div>
      {selected ? <p className="tip-box">{lesson.explanation}</p> : null}
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

export default DailyPractice;
