function Loader({ label = "Loading" }) {
  return <div aria-label={label} className="loader" role="status"><span className="loader__spinner" />{label}</div>;
}

export default Loader;
