function PracticeControls({ onPrevious, onNext, onMark, disablePrevious, disableNext }) {
  return (
    <div className="practice-controls">
      <div className="difficulty-row" aria-label="Mark difficulty">
        <button type="button" className="difficulty easy" onClick={() => onMark("easy")}>Easy</button>
        <button type="button" className="difficulty medium" onClick={() => onMark("medium")}>Medium</button>
        <button type="button" className="difficulty hard" onClick={() => onMark("hard")}>Hard</button>
      </div>
      <div className="step-nav">
        <button type="button" className="secondary-button" onClick={onPrevious} disabled={disablePrevious}>Previous</button>
        <button type="button" className="primary-button" onClick={onNext} disabled={disableNext}>Next</button>
      </div>
    </div>
  );
}

export default PracticeControls;
