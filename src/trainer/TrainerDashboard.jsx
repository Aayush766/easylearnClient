import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  CloudUpload,
  FileText,
  Users,
  ArrowRight,
  CalendarDays,
} from "lucide-react";
import TrainerLayout from "./TrainerLayout";
import "./TrainerDashboard.css";
import "./TrainerDashboardPolish.css";
import trainerFullstack from "../assets/fullstack.png";
import api from "../services/api";
import { ActivityList, useTrainerActivity } from "./TrainerActivityFeed";
export default function TrainerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const activity = useTrainerActivity(5);
  useEffect(() => { api.get("/api/admin/trainer/dashboard").then(setDashboard).catch(() => setDashboard(null)); }, []);
  const orderedCourses = (dashboard?.courses || []).map((course) => [course._id, course.title, "Assigned course", course.thumbnail?.url || trainerFullstack]);
  return (
    <TrainerLayout>
      <div className="trainer-page">
        <header className="trainer-greeting">
          <div>
            <p>Welcome, {dashboard?.user?.name || "Trainer"}!</p>
            <span>Here’s what you can do today for your courses.</span>
          </div>
          <aside>
            “Teaching is not just a profession,
            <br />
            it’s a way to change lives.” <BookOpen />
          </aside>
        </header>
        <section className="trainer-overview-stats" aria-label="Trainer overview">
          {[[Users, dashboard?.summary?.learners ?? "—", "Learners reached", "Across your assigned courses"], [BookOpen, dashboard?.summary?.content ?? "—", "Lessons published", "Learning library"], [ClipboardList, dashboard?.summary?.assessments ?? "—", "Assessments", "Created and active"], [BarChart3, `${dashboard?.summary?.averageScore ?? 0}%`, "Average score", "Across course cohorts"]].map(([Icon, value, label, hint]) => <article key={label}><span><Icon size={19} /></span><div><strong>{value}</strong><b>{label}</b><small>{hint}</small></div></article>)}
        </section>
        <section className="trainer-panel trainer-courses-panel">
          <header>
            <div>
              <h1>My Assigned Courses</h1>
              <p>
                You can upload content, create assessments, and view results for
                the courses assigned to you.
              </p>
            </div>
            <Link to="/trainer/courses">
              View all <ArrowRight size={16} />
            </Link>
          </header>
          <div className="trainer-course-list">
            {orderedCourses.map(([, title, learners, image]) => (
              <article className="trainer-course-row" key={title}>
                <img src={image} alt="" />
                <div className="trainer-course-info">
                  <h2>{title}</h2>
                  <p>
                    <CalendarDays size={15} /> Batch 2025 <span />
                    <Users size={15} /> {learners}
                  </p>
                </div>
                <div className="trainer-course-actions">
                  <Link
                    to="/trainer/upload"
                    className="trainer-action trainer-action--upload"
                  >
                    <CloudUpload />
                    <span>
                      <b>Upload Content</b>
                      <small>Video, PDF, PPT, etc.</small>
                    </span>
                  </Link>
                  <Link
                    to="/trainer/assessments"
                    className="trainer-action trainer-action--assessment"
                  >
                    <FileText />
                    <span>
                      <b>Create Assessment</b>
                      <small>Pre / Post Test</small>
                    </span>
                  </Link>
                  <Link
                    to="/trainer/results"
                    className="trainer-action trainer-action--results"
                  >
                    <BarChart3 />
                    <span>
                      <b>View Results</b>
                      <small>See learner performance</small>
                    </span>
                  </Link>
                </div>
                <ArrowRight className="trainer-row-arrow" size={20} />
              </article>
            ))}
          </div>
        </section>
        <section className="trainer-bottom-grid">
          <article className="trainer-panel trainer-activity">
            <header>
              <h2>Recent Activity</h2>
              <span className="trainer-activity-live">Live · refreshes every 15 sec</span>
              <Link to="/trainer/activity">
                View all <ArrowRight size={15} />
              </Link>
            </header>
            <ActivityList {...activity} />
          </article>
          <article className="trainer-panel trainer-guide">
            <header>
              <h2>Quick Guide</h2>
            </header>
            <div>
              {[
                [
                  CloudUpload,
                  "1. Upload Content",
                  "Add video lectures, PDFs, PPTs or other learning material.",
                ],
                [
                  ClipboardList,
                  "2. Create Assessments",
                  "Create pre and post assessments to evaluate learner understanding.",
                ],
                [
                  BarChart3,
                  "3. View Results",
                  "Check learner performance and track progress.",
                ],
              ].map(([Icon, title, copy]) => (
                <section key={title}>
                  <i>
                    <Icon />
                  </i>
                  <b>{title}</b>
                  <p>{copy}</p>
                </section>
              ))}
            </div>
          </article>
        </section>
        <footer className="trainer-footer">
          © 2026 Prime Easy Learn Training Institute. All rights reserved.
          <span>Help | Privacy Policy | Terms & Conditions</span>
        </footer>
      </div>
    </TrainerLayout>
  );
}
