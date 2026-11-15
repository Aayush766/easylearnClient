import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

const icons = { error: TriangleAlert, info: Info, success: CheckCircle2 };

function Toast({ message, onClose, type = "success" }) {
  const Icon = icons[type] || Info;
  return <div className={`toast toast--${type}`} role="status"><Icon size={20} /><span>{message}</span>{onClose && <button aria-label="Dismiss notification" className="icon-button" onClick={onClose} type="button"><X size={18} /></button>}</div>;
}

export default Toast;
