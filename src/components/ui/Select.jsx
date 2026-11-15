function Select({ children, className = "", error, id, label, hint, ...props }) {
  const inputId = id || props.name;

  return (
    <label className="field" htmlFor={inputId}>
      {label && <span className="field__label">{label}</span>}
      <select aria-invalid={Boolean(error)} className={`field__control ${error ? "field__control--error" : ""} ${className}`.trim()} id={inputId} {...props}>
        {children}
      </select>
      {(error || hint) && <span className={error ? "field__error" : "field__hint"}>{error || hint}</span>}
    </label>
  );
}

export default Select;
