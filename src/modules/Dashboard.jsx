import { useMemo } from "react";
import ModuleCard from "../components/ModuleCard.jsx";
import ProgressCard from "../components/ProgressCard.jsx";
import { getProgressSummary, getRecentAttempts } from "../services/progressService.js";
import { MODULE_DEFINITIONS } from "../services/contentService.js";

function Dashboard({ data, onNavigate }) {
  const summary = useMemo(() => getProgressSummary(), []);
  const recent = useMemo(() => getRecentAttempts(4), []);

  return (
    <section className="dashboard">
      <div className="hero-panel">
        <div>
          <p className="eyebrow">Workplace English practice</p>
          <h1>Improve English Speaking and Comprehension</h1>
          <p className="hero-copy">
            Practice speaking, listening, sentence structure, and interview answers through short daily exercises.
          </p>
          <div className="hero-actions">
            <button className="primary-button large" type="button" onClick={() => onNavigate("daily")}>Start Daily Practice</button>
            <button className="secondary-button large" type="button" onClick={() => onNavigate("progress")}>View Progress</button>
          </div>
        </div>
        <div className="today-card">
          <span>Today&apos;s plan</span>
          <strong>15 focused items</strong>
          <p>5 shadowing, 3 sentence builders, 2 interview prompts, 5 listening questions</p>
        </div>
      </div>

      <div className="summary-grid">
        <ProgressCard label="Total attempts" value={summary.totalAttempts} helper="Saved locally" tone="teal" />
        <ProgressCard label="Practiced items" value={summary.totalPracticedItems} helper="Unique lessons" tone="blue" />
        <ProgressCard label="Listening accuracy" value={`${summary.listeningAccuracy}%`} helper={`${summary.listeningTotal} scored`} tone="amber" />
      </div>

      <div className="section-heading">
        <div>
          <p className="eyebrow">Modules</p>
          <h2>Choose a practice lane</h2>
        </div>
      </div>
      <div className="module-grid">
        <ModuleCard title="Shadowing Practice" description="Repeat professional phrases out loud." count={data.shadowing.length} tone="teal" onOpen={() => onNavigate("shadowing")} />
        <ModuleCard title="Sentence Builder" description="Grow short answers into confident sentences." count={data.sentenceBuilder.length} tone="blue" onOpen={() => onNavigate("sentenceBuilder")} />
        <ModuleCard title="Interview Practice" description="Prepare structured workplace answers." count={data.interviewPractice.length} tone="rose" onOpen={() => onNavigate("interviewPractice")} />
        <ModuleCard title="Listening Comprehension" description="Hear a phrase, choose the meaning." count={data.listeningComprehension.length} tone="amber" onOpen={() => onNavigate("listeningComprehension")} />
      </div>

      <section className="recent-panel">
        <div className="section-heading compact">
          <h2>Recent practice</h2>
        </div>
        {recent.length ? (
          <div className="history-list">
            {recent.map((attempt) => (
              <div className="history-row" key={attempt.id}>
                <strong>{MODULE_DEFINITIONS[attempt.module]?.progressLabel || attempt.module}</strong>
                <span>{attempt.lessonId}</span>
                <small>{attempt.difficulty || (attempt.correct ? "correct" : "review")}</small>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">No practice yet. Daily Practice is a good first run.</p>
        )}
      </section>
    </section>
  );
}

export default Dashboard;
