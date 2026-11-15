import { TriangleAlert } from "lucide-react";
import Button from "./Button";

function ErrorState({ onRetry, description = "We couldn't load this information. Please try again.", title = "Something went wrong" }) {
  return <section className="state state--error"><TriangleAlert aria-hidden="true" size={32} /><h2>{title}</h2><p>{description}</p>{onRetry && <Button onClick={onRetry} variant="secondary">Try again</Button>}</section>;
}

export default ErrorState;
