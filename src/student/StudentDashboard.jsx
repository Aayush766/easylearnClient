import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StudentLayout from "./StudentLayout";
import herostudent from "../public/assets/student/hero-student.png";
import bottombanner from "../public/assets/student/bottom-banner.png";
import fullstackImage from "../assets/fullstack.png";
import {
  Bookmark,
  BarChart3,
  ClipboardCheck,
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileBadge,
  FileText,
  Flame,
  LayoutDashboard,
  MessageSquare,
  Play,
  Trophy,
  ArrowUpRight,
  Sparkles,
  Zap,
  Target
} from "lucide-react";
import "./StudentDashboard.css";
import useAuth from "../context/useAuth";
import api from "../services/api";

function Donut({ value, size = 90 }) {
  return (
    <div className="vibe-donut" style={{ "--value": `${value * 3.6}deg`, "--size": `${size}px` }}>
      <div className="vibe-donut__inner">
        <strong>{value}%</strong>
        <span>Overall</span>
      </div>
    </div>
  );
}

function DashboardHero({ progress }) {
  const { user } = useAuth();
  const status = progress >= 75 ? "On Track" : progress > 0 ? "In Progress" : "Get Started";
  return (
    <section className="vibe-hero">
      <div className="vibe-hero__bg-glow" />
      <div className="vibe-hero__copy">
        <div className="vibe-badge">
          <Sparkles size={13} />
          <span>Pro Learner Mode</span>
        </div>
        <h1>Good Evening, <b>{user?.name?.split(" ")[0] || "Learner"}</b> <span className="wave">👋</span></h1>
        <h2>Keep pushing boundaries. Code. Design. Conquer.</h2>
        <p>“Discipline today creates opportunities tomorrow.”</p>
      </div>

      <div className="vibe-hero__person">
        <img src={herostudent} alt="Student Hero" />
        <div className="vibe-hero__scribble">
          Same<br />Skills<br />
          <b>Brighter<br />Future ✨</b>
        </div>
      </div>

      <div className="vibe-hero__progress-card">
        <Donut value={progress} size={84} />
        <div className="vibe-hero__progress-info">
          <div className="vibe-status-pill">
            <span className="pulse-dot" /> {status}
          </div>
          <strong>Overall Progress</strong>
          <span>{progress === 100 ? "All courses completed!" : progress > 0 ? "You're doing amazing!" : "Start a lesson to track your progress."}</span>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon: Icon, value, title, subtitle, tone = "blue" }) {
  return (
    <article className={`vibe-stat vibe-stat--${tone}`}>
      <div className="vibe-stat__icon">
        <Icon size={22} />
      </div>
      <div className="vibe-stat__content">
        <strong>{value}</strong>
        <b>{title}</b>
        <small>{subtitle}</small>
      </div>
    </article>
  );
}

function CourseCard({ course }) {
  return (
    <article className="vibe-course">
      <div className="vibe-course__image-wrap">
        <img src={course.image} alt={course.title} />
        <div className="vibe-course__overlay" />
        <span className="vibe-course__tag" style={{ borderColor: course.color, color: course.color }}>
          {course.tag}
        </span>
      </div>
      <div className="vibe-course__body">
        <h3>{course.title}</h3>
        <p>{course.subtitle}</p>

        <div className="vibe-course__progress-bar">
          <div className="vibe-course__track">
            <div className="vibe-course__fill" style={{ width: `${course.progress}%`, background: course.color }} />
          </div>
          <b>{course.progress}%</b>
        </div>

        <div className="vibe-course__meta">
          <span><FileText size={14} /> {course.lessons}</span>
          <span><CalendarDays size={14} /> {course.valid}</span>
        </div>

        <Link to={`/student/courses/${course.id}`} className="vibe-course__button">
          <span>Continue Learning</span>
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  );
}

function TodayPlan() {
  return (
    <aside className="vibe-card">
      <header className="vibe-card__head">
        <div>
          <h3>Today's Schedule</h3>
          <span>20 Sep 2025</span>
        </div>
        <a href="#calendar" className="vibe-link">Calendar <ArrowUpRight size={12} /></a>
      </header>
      <div className="vibe-plan">
        <div className="vibe-plan__item">
          <span className="plan-icon blue"><CalendarDays size={16} /></span>
          <p>
            <b>UI/UX Design - Live Class</b>
            <small><span className="live-badge">LIVE</span> 10:00 AM – 11:00 AM</small>
          </p>
        </div>
        <div className="vibe-plan__item">
          <span className="plan-icon emerald"><Check size={16} /></span>
          <p>
            <b>Complete Lesson 3</b>
            <small>UI Components & Systems</small>
          </p>
        </div>
        <div className="vibe-plan__item">
          <span className="plan-icon rose"><FileText size={16} /></span>
          <p>
            <b>Attempt Pre-Assessment</b>
            <small className="danger">Due Today</small>
          </p>
        </div>
      </div>
    </aside>
  );
}

function Streak({ streak = { currentDays: 0, week: [] } }) {
  const days = streak.week || [];
  return (
    <aside className="vibe-card streak-card">
      <h3>Learning Streak</h3>
      <div className="streak-main">
        <div className="flame-glow">
          <Flame size={28} />
        </div>
        <div>
          <strong>{streak.currentDays || 0} Day{streak.currentDays === 1 ? "" : "s"} Streak</strong>
          <span>{streak.currentDays ? "Consistency builds mastery." : "Complete a lesson to start a streak."}</span>
        </div>
      </div>
      <div className="streak-days">
        {days.map((day, i) => (
          <div key={day.day || i} className="streak-day-item">
            <span className={day.active ? "done" : ""}>
              {day.active ? <Check size={12} /> : ""}
            </span>
            <small>{new Date(`${day.day}T00:00:00`).toLocaleDateString(undefined, { weekday: "short" })}</small>
          </div>
        ))}
      </div>
    </aside>
  );
}

function ProgressPanel({ progress, completedLessons, totalLessons, attempts = [], trackedLearningSeconds = 0 }) {
  const passed = attempts.filter((attempt) => attempt.result === "PASS").length;
  const scored = attempts.filter((attempt) => Number.isFinite(Number(attempt.percentage)));
  const average = scored.length ? Math.round(scored.reduce((sum, attempt) => sum + Number(attempt.percentage), 0) / scored.length) : null;
  const minutes = Math.floor(trackedLearningSeconds / 60);
  const time = minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;
  return (
    <section className="vibe-card progress-panel">
      <header className="vibe-card__head">
        <h3>My Analytics</h3>
      </header>
      <div className="progress-content">
        <Donut value={progress} size={110} />
        <div className="progress-list">
          <div className="progress-row">
            <span className="mini emerald"><FileText /></span>
            <b>Lessons Completed</b>
            <strong>{completedLessons} / {totalLessons}</strong>
          </div>
          <div className="progress-row">
            <span className="mini amber"><FileText /></span>
            <b>Assessments Passed</b>
            <strong>{passed} / {attempts.length}</strong>
          </div>
          <div className="progress-row">
            <span className="mini blue"><Trophy /></span>
            <b>Average Score</b>
            <strong>{average == null ? "—" : `${average}%`}</strong>
          </div>
          <div className="progress-row">
            <span className="mini purple"><Clock3 /></span>
            <b>Time Spent</b>
            <strong>{time}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

function Achievement({ certificates = 0 }) {
  return (
    <section className="vibe-card achievement">
      <h3>Latest Achievement</h3>
      <div className="achievement-box">
        <div className="trophy-glow">
          <Trophy size={28} />
        </div>
        <b>{certificates ? "Certificates Earned" : "Your next milestone"}</b>
        <span>{certificates ? `${certificates} verified certificate${certificates === 1 ? "" : "s"}` : "Complete an enrolled course to earn your first certificate."}</span>
      </div>
      <Link to="/student/certificates" className="vibe-btn-ghost">View Certificate</Link>
    </section>
  );
}

function QuickLinks() {
  return (
    <section className="vibe-card quick-links">
      <h3>Quick Actions</h3>
      <div className="quick-links__grid">
        <Link to="/student/assessments"><span><FileText /></span>Assessments</Link>
        <Link to="/student/courses"><span><BookOpen /></span>My Courses</Link>
        <Link to="/student/certificates"><span><FileBadge /></span>Certificates</Link>
        <Link to="/student/attendance"><span><ClipboardCheck /></span>My Attendance</Link>
        <Link to="/student/support"><span><CircleHelp /></span>Support</Link>
      </div>
    </section>
  );
}

export default function StudentDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [progressData, setProgressData] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [courseFilter, setCourseFilter] = useState("all");
  const activeCourses = enrolledCourses.filter((course) => !course.isFreePreview);
  const completedLessons = activeCourses.reduce((total, course) => total + course.completedLessons, 0);
  const totalLessons = activeCourses.reduce((total, course) => total + course.totalContent, 0);
  const overallProgress = totalLessons ? Math.round(completedLessons * 100 / totalLessons) : 0;
  useEffect(() => {
    let active = true;
    Promise.all([api.get("/api/learner/dashboard"), api.get("/api/learner/my-courses"), api.get("/api/learner/progress/summary"), api.get("/api/attempts", { params: { limit: 100 } })]).then(([summary, courseResult, progress, attemptResult]) => {
      if (!active) return;
      setDashboard(summary);
      setProgressData(progress);
      setAttempts(attemptResult?.items || []);
      setEnrolledCourses((courseResult?.courses || []).map((row) => {
        const course = row.enrollment?.courseId || {};
        return { id: course._id, title: course.title || "Course", subtitle: course.description || "", progress: row.progressPercent || 0, completedLessons: row.completedContent || 0, totalContent: row.totalContent || 0, isFreePreview: Boolean(row.isFreePreview), lessons: `${row.completedContent || 0} / ${row.totalContent || 0} Lessons`, valid: row.enrollment?.expiryDate ? `Valid until ${new Date(row.enrollment.expiryDate).toLocaleDateString()}` : "", image: course.thumbnail?.url || fullstackImage, color: "#2563eb", tag: row.enrollment?.status || "Enrolled" };
      }));
    }).catch(() => { if (active) setDashboard(null); });
    api.get("/api/attendance", { params: { limit: 1 } }).then((result) => { if (active) setAttendance(result); }).catch(() => {});
    return () => { active = false; };
  }, []);
  const visibleCourses = enrolledCourses.filter((course) => courseFilter === "all" || (courseFilter === "progress" ? course.progress < 100 : course.progress >= 100));
  return (
    <StudentLayout>
      <div className="student-page">
        <DashboardHero progress={overallProgress} />

        <section className="student-stats">
          <Stat icon={Play} value={dashboard?.summary?.enrolledCourses ?? "—"} title="Enrolled Courses" subtitle="Your active programs" tone="blue" />
          <Stat icon={BarChart3} value={enrolledCourses.reduce((total, course) => total + course.completedLessons, 0)} title="Lessons Done" subtitle="Across enrolled courses" tone="emerald" />
          <Stat icon={Clock3} value={Math.floor((progressData?.summary?.trackedLearningSeconds || 0) / 3600)} title="Hours Learned" subtitle="Tracked course learning time" tone="purple" />
          <Stat icon={Trophy} value={dashboard?.summary?.certificates ?? "—"} title="Certificates" subtitle="Verified badges" tone="amber" />
          <Stat icon={ClipboardCheck} value={attendance?.total ?? "?"} title="Attendance sessions" subtitle={(attendance?.summary?.PRESENT || 0) + " present / " + (attendance?.summary?.ABSENT || 0) + " absent"} tone="blue" />
        </section>

        <section className="student-content">
          <div className="student-main-column">
            <section className="student-section">
              <header className="student-section__head">
                <h2>My Courses</h2>
                <div className="student-course-tabs">
                  {[["all", `All Courses (${enrolledCourses.length})`], ["progress", `In Progress (${enrolledCourses.filter((course) => course.progress < 100).length})`], ["completed", `Completed (${enrolledCourses.filter((course) => course.progress >= 100).length})`]].map(([key, label]) => <button type="button" key={key} className={courseFilter === key ? "active" : ""} onClick={() => setCourseFilter(key)}>{label}</button>)}
                </div>
              </header>

              <div className="student-course-grid">
                {visibleCourses.map(course => <CourseCard key={course.id} course={course} />)}
                {!visibleCourses.length && <p>{enrolledCourses.length ? "No courses in this group yet." : "No enrolled courses yet."}</p>}
              </div>
            </section>

            <section className="student-lower-grid">
              <ProgressPanel progress={overallProgress} completedLessons={completedLessons} totalLessons={totalLessons} attempts={attempts} trackedLearningSeconds={progressData?.summary?.trackedLearningSeconds || 0} />
              <Achievement certificates={dashboard?.summary?.certificates || 0} />
              <QuickLinks />
            </section>

            <section className="student-bottom-banner">
              <img src={bottombanner} alt="Inspirational Banner" />
              <div className="banner-overlay">
                <h4>Small daily wins build massive results.</h4>
                <p>Keep grinding, your future self will thank you.</p>
              </div>
            </section>
          </div>

          <div className="student-right-column">
            {/* <TodayPlan /> */}
            <Streak streak={progressData?.streak} />
          </div>
        </section>

        <footer className="student-footer">
          <span>© 2026 Prime Easy Learn Training Institute. All rights reserved.</span>
          <div className="footer-links">
            <a href="#privacy">Privacy</a>
            <i>•</i>
            <a href="#terms">Terms</a>
            <i>•</i>
            <a href="#help">Help</a>
          </div>
        </footer>
      </div>
    </StudentLayout>
  );
}
