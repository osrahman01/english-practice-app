function ModuleCard({ title, description, count, tone = "teal", onOpen }) {
  return (
    <button className={`module-card tone-${tone}`} type="button" onClick={onOpen}>
      <span className="module-card-count">{count}</span>
      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <span className="module-card-action">Start</span>
    </button>
  );
}

export default ModuleCard;
