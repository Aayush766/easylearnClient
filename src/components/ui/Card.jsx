function Card({ children, className = "", title, action }) {
  return (
    <section className={`card ${className}`.trim()}>
      {(title || action) && <div className="card__header"><h2>{title}</h2>{action}</div>}
      {children}
    </section>
  );
}

export default Card;
