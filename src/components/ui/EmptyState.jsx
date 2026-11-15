import { Inbox } from "lucide-react";
import Button from "./Button";

function EmptyState({ action, actionLabel, description, icon: Icon = Inbox, title }) {
  return <section className="state state--empty"><Icon aria-hidden="true" size={32} /><h2>{title}</h2><p>{description}</p>{action && <Button onClick={action} variant="secondary">{actionLabel}</Button>}</section>;
}

export default EmptyState;
