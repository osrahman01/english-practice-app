function ProgressCard({ label, value, helper, tone = "neutral" }) {
  return (
    <article className={`progress-card tone-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {helper ? <small>{helper}</small> : null}
    </article>
  );
}

export default ProgressCard;
