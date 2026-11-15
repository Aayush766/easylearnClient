import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, BookOpen, Check, CheckCircle2, ChevronRight, Clock3, Flame, PlayCircle, Star, Trophy, TrendingUp } from "lucide-react";
import api from "../services/api";
import herostudent from "../public/assets/student/hero-student.png";
import StudentLayout from "./StudentLayout";
import "./StudentProgress.css";
import "./StudentProgressDetails.css";
import fullstackImage from "../assets/fullstack.png";
import uiuxImage from "../assets/uiux.png";
import marketingImage from "../assets/marketing.png";
import dataImage from "../assets/dataanalytics.png";

const fallbackImage = (title = "") => {
  const name = title.toLowerCase();
  if (name.includes("design") || name.includes("ui/ux")) return uiuxImage;
  if (name.includes("market")) return marketingImage;
  if (name.includes("data") || name.includes("python")) return dataImage;
  return fullstackImage;
};
const formatDuration = (seconds = 0) => {
  const minutes = Math.floor(Number(seconds || 0) / 60);
  const hours = Math.floor(minutes / 60);
  return hours ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
};

function ProgressHeader() {
  return <section className="progress-page-header"><div className="progress-heading"><h1>My Progress</h1><p>See your course completion, assessment growth, and learning streak.</p></div><div className="progress-hero"><div className="progress-hero__copy"><strong>Learn<br />Practice<br />Improve<br />Succeed</strong></div><div className="progress-hero__person"><img src={herostudent} alt="Student learning" /></div><div className="progress-hero__quote">Small steps<br />every day<br />create lasting<br />progress.</div><span className="progress-hero__line progress-hero__line--left" /><span className="progress-hero__line progress-hero__line--right" /></div></section>;
}

function ProgressStats({ summary }) {
  const stats = [
    { icon: <BookOpen size={24} />, value: summary.enrolledCourses, label: "Enrolled Courses", theme: "purple" },
    { icon: <CheckCircle2 size={24} />, value: summary.completedCourses, label: "Courses Completed", theme: "green" },
    { icon: <TrendingUp size={24} />, value: `${summary.overallProgress}%`, label: "Overall Progress", theme: "blue" },
    { icon: <BarChart3 size={24} />, value: summary.averageImprovement == null ? "—" : `${summary.averageImprovement > 0 ? "+" : ""}${summary.averageImprovement} pts`, label: "Average Improvement", sublabel: "Pre vs post assessment", theme: "orange" },
  ];
  return <section className="progress-stats">{stats.map((stat) => <div className="progress-stat-card" key={stat.label}><div className={`progress-stat-icon progress-stat-icon--${stat.theme}`}>{stat.icon}</div><div className="progress-stat-content"><strong>{stat.value}</strong><span>{stat.label}</span>{stat.sublabel && <small>{stat.sublabel}</small>}</div></div>)}</section>;
}

function ProgressMetric({ icon, value, label, theme }) {
  return <div className="overall-metric"><div className={`overall-metric-icon overall-metric-icon--${theme}`}>{icon}</div><div><strong>{value}</strong><span>{label}</span></div></div>;
}

function OverallProgress({ summary }) {
  return <section className="progress-card overall-progress-card"><div className="progress-card-heading"><h2>Overall Completion</h2><p>{summary.overallProgress}% of published lessons completed across your enrolled courses.</p></div><div className="overall-progress-bar-row"><div className="overall-progress-track"><div className="overall-progress-fill" style={{ width: `${summary.overallProgress}%` }} /></div><strong>{summary.overallProgress}%</strong></div><div className="overall-metrics"><ProgressMetric icon={<PlayCircle size={18} />} value={`${summary.completedLessons} / ${summary.totalLessons}`} label="Lessons Completed" theme="blue" /><ProgressMetric icon={<CheckCircle2 size={18} />} value={`${summary.assessmentsAttempted} / ${summary.totalAssessments}`} label="Assessments Attempted" theme="green" /><ProgressMetric icon={<Clock3 size={18} />} value={formatDuration(summary.trackedLearningSeconds)} label="Learning Time Tracked" theme="blue" /><ProgressMetric icon={<Trophy size={18} />} value={summary.certificates} label="Certificates Earned" theme="orange" /></div></section>;
}

function PerformanceImprovement({ courses }) {
  const rows = courses.filter((course) => Number.isFinite(Number(course.preScore)) && Number.isFinite(Number(course.postScore)));
  const bars = rows.slice(0, 5).map((course) => ({ ...course, label: course.title.length > 15 ? `${course.title.slice(0, 13)}…` : course.title }));
  return <section className="progress-card performance-card"><div className="performance-header-row"><div className="progress-card-heading"><h2>Assessment Growth</h2><p>Pre vs post assessment scores</p></div><div className="performance-legend"><span><i className="performance-legend__pre" /> Pre</span><span><i className="performance-legend__post" /> Post</span></div></div>{bars.length ? <><div className="performance-chart"><div className="chart-y-axis"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><div className="chart-area"><div className="chart-grid"><span /><span /><span /><span /><span /></div><div className="chart-bars">{bars.map((bar) => <div className="chart-group" key={bar.courseId}><div className="chart-columns"><div className="chart-column"><strong>{bar.preScore}%</strong><div className="chart-bar chart-bar--pre" style={{ "--bar-height": `${Math.max(0, Math.min(100, bar.preScore))}%` }} /></div><div className="chart-column"><strong>{bar.postScore}%</strong><div className="chart-bar chart-bar--post" style={{ "--bar-height": `${Math.max(0, Math.min(100, bar.postScore))}%` }} /></div></div><span className="chart-label">{bar.label}</span></div>)}</div></div></div><div className="assessment-growth-details" aria-label="Detailed assessment scores">{bars.map((bar) => <div key={`${bar.courseId}-growth`}><span>{bar.title}</span><span>Before <b>{bar.preScore}%</b></span><span>After <b>{bar.postScore}%</b></span><strong>{bar.improvement > 0 ? "+" : ""}{bar.improvement} pts</strong></div>)}</div></> : <div className="progress-empty-inline"><BarChart3 size={22} /><p>Complete both a pre-assessment and a post-assessment to see score growth here.</p></div>}</section>;
}

function CourseProgress({ courses }) {
  const [activeTab, setActiveTab] = useState("all");
  const filteredCourses = useMemo(() => activeTab === "progress" ? courses.filter((course) => course.statusType !== "completed") : activeTab === "completed" ? courses.filter((course) => course.statusType === "completed") : courses, [activeTab, courses]);
  return <section className="progress-card course-progress-card"><div className="course-progress-heading"><div className="progress-card-heading"><h2>Course Breakdown</h2></div><div className="course-progress-tabs"><button type="button" className={`course-progress-tab ${activeTab === "all" ? "course-progress-tab--active" : ""}`} onClick={() => setActiveTab("all")}>All Courses ({courses.length})</button><button type="button" className={`course-progress-tab ${activeTab === "progress" ? "course-progress-tab--active" : ""}`} onClick={() => setActiveTab("progress")}>In Progress</button><button type="button" className={`course-progress-tab ${activeTab === "completed" ? "course-progress-tab--active" : ""}`} onClick={() => setActiveTab("completed")}>Completed</button></div></div><div className="course-progress-list">{filteredCourses.map((course) => <div className="course-progress-row" key={course.id}><img src={course.image || fallbackImage(course.title)} alt="" className="course-progress-image" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackImage(course.title); }} /><div className="course-progress-info"><h3>{course.title}</h3><span>{course.completedLessons} / {course.totalLessons} lessons</span></div><div className="course-progress-meter"><div className="course-progress-track"><div className={`course-progress-fill ${course.progressPercent === 100 ? "course-progress-fill--completed" : ""}`} style={{ width: `${course.progressPercent}%` }} /></div><strong>{course.progressPercent}%</strong></div><span className={`course-status course-status--${course.statusType}`}>{course.status}</span><Link to={`/student/courses/${course.id}`} className="course-progress-arrow" aria-label={`Open ${course.title}`}><ChevronRight size={18} /></Link></div>)}{!filteredCourses.length && <div className="progress-empty-inline"><BookOpen size={22} /><p>{activeTab === "completed" ? "You have not completed a course yet." : activeTab === "progress" ? "All your enrolled courses are complete." : "Enroll in a course to start tracking your progress."}</p>{activeTab === "all" && <Link to="/student/courses">Browse courses</Link>}</div>}</div></section>;
}

function LearningStreak({ streak }) {
  const days = (streak.week || []).map((item) => ({ name: new Date(`${item.day}T00:00:00`).toLocaleDateString(undefined, { weekday: "short" }), active: item.active }));
  return <section className="progress-card learning-streak-card"><div className="streak-content"><div className="streak-heading"><div className="streak-icon"><Flame size={26} /></div><div><h2>Learning Streak</h2><strong>{streak.currentDays} {streak.currentDays === 1 ? "Day" : "Days"} Active</strong><p>{streak.currentDays ? "Keep your daily momentum going!" : "Complete a lesson to start your streak."}</p></div></div><div className="streak-days">{days.map((day, index) => <div className="streak-day" key={`${day.name}-${index}`}><span className={`streak-day-circle ${day.active ? "streak-day-circle--active" : ""}`}>{day.active && <Check size={14} />}</span><small>{day.name}</small></div>)}</div></div><div className="streak-message"><strong>Consistency<br />Creates<br />Success</strong><span className="streak-message-line" /></div></section>;
}

function Achievements({ summary, streak, courses }) {
  const achievements = [
    ...(summary.completedLessons > 0 ? [{ icon: <BookOpen size={22} />, title: "First Step", description: "Completed your first lesson", theme: "green" }] : []),
    ...(summary.completedCourses > 0 ? [{ icon: <Trophy size={22} />, title: "Course Finisher", description: `Completed ${summary.completedCourses} course${summary.completedCourses === 1 ? "" : "s"}`, theme: "green" }] : []),
    ...(courses.some((course) => course.postScore >= 80) ? [{ icon: <Star size={22} />, title: "High Achiever", description: "Scored 80% or higher", theme: "blue" }] : []),
    ...(streak.currentDays >= 7 ? [{ icon: <Flame size={22} />, title: "Weekly Streak", description: "Learned 7 or more days in a row", theme: "purple" }] : []),
  ];
  return <section className="progress-card achievements-card"><div className="achievements-heading"><h2>Your Achievements</h2><Link to="/student/certificates">Certificates <ChevronRight size={14} /></Link></div>{achievements.length ? <div className="achievement-list">{achievements.map((item) => <div className="achievement" key={item.title}><div className={`achievement-icon achievement-icon--${item.theme}`}>{item.icon}</div><strong>{item.title}</strong><span>{item.description}</span></div>)}</div> : <div className="progress-empty-inline"><Trophy size={22} /><p>Your learning milestones will appear here as you complete lessons, courses, and assessments.</p></div>}</section>;
}

function ProgressFooter() {
  return <footer className="progress-footer"><span>© 2026 Prime Easy Learn Training Institute.</span><div className="progress-footer-links"><Link to="/student/support">Help &amp; Support</Link><span>|</span><Link to="/student/profile">Account settings</Link></div></footer>;
}

export default function StudentProgress() {
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api.get("/api/learner/progress/summary")
      .then((result) => { if (active) setProgress(result); })
      .catch((loadError) => { if (active) setError(loadError.message || "Could not load your progress."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retryKey]);

  const summary = progress?.summary;
  return <StudentLayout><div className="student-progress"><main className="progress-main"><ProgressHeader />{error && <div className="progress-state progress-state--error" role="alert"><p>{error}</p><button type="button" onClick={() => setRetryKey((value) => value + 1)}>Try again</button></div>}{loading ? <div className="progress-state" role="status">Loading your learning progress…</div> : summary ? <><ProgressStats summary={summary} /><div className="progress-primary-grid"><div className="progress-left-column"><OverallProgress summary={summary} /><CourseProgress courses={progress.courses || []} /></div><div className="progress-right-column"><PerformanceImprovement courses={progress.assessmentGrowth || []} /><LearningStreak streak={progress.streak || { currentDays: 0, week: [] }} /><Achievements summary={summary} streak={progress.streak || { currentDays: 0 }} courses={progress.assessmentGrowth || []} /></div></div></> : !error ? <div className="progress-state"><p>Progress data is not available yet.</p></div> : null}</main><ProgressFooter /></div></StudentLayout>;
}
