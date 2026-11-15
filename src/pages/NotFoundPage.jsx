import { Link } from "react-router-dom";
import { Button } from "../components/ui";
function NotFoundPage() { return <main className="not-found"><p className="eyebrow">404</p><h1>Page not found</h1><p>The page you’re looking for doesn’t exist or may have moved.</p><Link to="/"><Button>Return home</Button></Link></main>; }
export default NotFoundPage;
