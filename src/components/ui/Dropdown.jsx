import { ChevronDown } from "lucide-react";

function Dropdown({ children, label, onClick }) {
  return <details className="dropdown"><summary>{label}<ChevronDown size={16} /></summary><div className="dropdown__menu" onClick={onClick}>{children}</div></details>;
}

export default Dropdown;
