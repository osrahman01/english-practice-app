import { useMemo, useState } from "react";
import ProgressCard from "../components/ProgressCard.jsx";
import { clearProgress, exportAttemptsToCsv, getAttempts, getProgressSummary } from "../services/progressService.js";
import { MODULE_DEFINITIONS } from "../services/contentService.js";

function Progress() {
  const [version, setVersion] = useState(0);
  const summary = useMemo(() => getProgressSummary(), [version]);
  const attempts = useMemo(() => getAttempts(), [version]);

  const exportCsv = () => {
    const csv = exportAttemptsToCsv();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "english-practice-progress.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    clearProgress();
    setVersion((current) => current + 1);
  };

  return (
    <section>
      <div className="page-heading">
        <p className="eyebrow">Progress</p>
        <h1>Your practice history</h1>
        <p>All progress is stored locally in this browser for Phase 1.</p>
      </div>
      <div className="summary-grid">
        <ProgressCard label="Total attempts" value={summary.totalAttempts} helper="All modules" tone="teal" />
        <ProgressCard label="Easy" value={summary.easy} helper="Confident reps" tone="green" />
        <ProgressCard label="Medium" value={summary.medium} helper="Needs light review" tone="amber" />
        <ProgressCard label="Hard" value={summary.hard} helper="Practice again" tone="rose" />
        <ProgressCard label="Listening accuracy" value={`${summary.listeningAccuracy}%`} helper={`${summary.listeningCorrect}/${summary.listeningTotal} correct`} tone="blue" />
      </div>

      <div className="progress-layout">
        <section className="report-panel">
          <h2>Practice by module</h2>
          {Object.values(MODULE_DEFINITIONS).map((module) => (
            <div className="bar-row" key={module.id}>
              <span>{module.progressLabel}</span>
              <div><i style={{ width: `${Math.min((summary.byModule[module.id] || 0) * 8, 100)}%` }} /></div>
              <strong>{summary.byModule[module.id] || 0}</strong>
            </div>
          ))}
        </section>
        <section className="report-panel">
          <div className="panel-actions">
            <h2>Recent history</h2>
            <div>
              <button className="secondary-button" type="button" onClick={exportCsv}>Export CSV</button>
              <button className="danger-button" type="button" onClick={reset}>Reset</button>
            </div>
          </div>
          <div className="history-list">
            {attempts.slice(0, 12).map((attempt) => (
              <div className="history-row" key={attempt.id}>
                <strong>{MODULE_DEFINITIONS[attempt.module]?.progressLabel || attempt.module}</strong>
                <span>{attempt.lessonId}</span>
                <small>{attempt.difficulty || (attempt.correct ? "correct" : "review")}</small>
              </div>
            ))}
            {!attempts.length ? <p className="muted">No attempts saved yet.</p> : null}
          </div>
        </section>
      </div>
    </section>
  );
}

export default Progress;
