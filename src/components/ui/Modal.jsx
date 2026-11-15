import { useEffect } from "react";
import { X } from "lucide-react";

function Modal({ children, isOpen, onClose, title }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div aria-modal="true" className="modal-backdrop" onMouseDown={onClose} role="dialog">
      <section className="modal" onMouseDown={(event) => event.stopPropagation()}>
        <header className="modal__header"><h2>{title}</h2><button aria-label="Close dialog" className="icon-button" onClick={onClose} type="button"><X size={20} /></button></header>
        <div className="modal__body">{children}</div>
      </section>
    </div>
  );
}

export default Modal;
