function Avatar({ alt = "", name = "", size = "md", src }) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?";
  return <span aria-label={alt || name} className={`avatar avatar--${size}`}>{src ? <img alt={alt || name} src={src} /> : initials}</span>;
}

export default Avatar;
