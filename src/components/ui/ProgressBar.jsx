function ProgressBar({ label, value = 0 }) {
  const percentage = Math.min(100, Math.max(0, Number(value) || 0));
  return <div aria-label={label || `Progress: ${percentage}%`} aria-valuemax="100" aria-valuemin="0" aria-valuenow={percentage} className="progress" role="progressbar"><span style={{ width: `${percentage}%` }} /></div>;
}

export default ProgressBar;
