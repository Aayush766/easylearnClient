function Skeleton({ className = "", lines = 1 }) {
  return <div aria-hidden="true" className={`skeleton ${className}`.trim()}>{Array.from({ length: lines }, (_, index) => <span key={index} />)}</div>;
}

export default Skeleton;
