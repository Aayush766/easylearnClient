import { ArrowLeft, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import TrainerLayout from "./TrainerLayout";
import { ActivityList, useTrainerActivity } from "./TrainerActivityFeed";
import "./TrainerDashboard.css";
import "./TrainerDashboardPolish.css";

export default function TrainerActivityPage() {
  const activity = useTrainerActivity(100);
  return <TrainerLayout>
    <div className="trainer-page">
      <section className="trainer-panel trainer-activity trainer-activity-page">
        <header>
          <div><h1><Clock3 size={19} /> Recent Activity</h1><p>Actions from your assigned courses, refreshed every 15 seconds.</p></div>
          <Link to="/trainer"><ArrowLeft size={15} /> Dashboard</Link>
        </header>
        <ActivityList {...activity} emptyMessage="No activity has been recorded for your account yet." />
      </section>
    </div>
  </TrainerLayout>;
}
