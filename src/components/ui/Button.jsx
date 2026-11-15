function Button({ children, className = "", type = "button", variant = "primary", isLoading = false, disabled = false, ...props }) {
  return (
    <button className={`button button--${variant} ${className}`.trim()} disabled={disabled || isLoading} type={type} {...props}>
      {isLoading ? "Please wait…" : children}
    </button>
  );
}

export default Button;
