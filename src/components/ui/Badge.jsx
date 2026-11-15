const normalizeStatus = (value) => String(value || "default").toLowerCase().replaceAll("_", "-");

function Badge({ children, status = "default" }) {
  return <span className={`badge badge--${normalizeStatus(status)}`}>{children}</span>;
}

export default Badge;
