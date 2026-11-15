function Textarea({ className = "", error, id, label, hint, ...props }) {
  const inputId = id || props.name;

  return (
    <label className="field" htmlFor={inputId}>
      {label && <span className="field__label">{label}</span>}
      <textarea aria-invalid={Boolean(error)} className={`field__control field__textarea ${error ? "field__control--error" : ""} ${className}`.trim()} id={inputId} {...props} />
      {(error || hint) && <span className={error ? "field__error" : "field__hint"}>{error || hint}</span>}
    </label>
  );
}

export default Textarea;
