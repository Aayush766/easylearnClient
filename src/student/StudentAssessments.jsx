import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CheckCircle2, ChevronDown, Clock3, FileCheck2, FileText, HelpCircle, LayoutGrid, List, Play, RotateCcw, Sparkles, Target, Trophy, XCircle } from "lucide-react";
import StudentLayout from "./StudentLayout";
import api from "../services/api";
import herostudent from "../public/assets/student/hero-student.png";
import "./StudentAssessments.css";
import "./StudentExperiencePolish.css";

const TABS = [
  { id: "all", label: "All Assessments" },
  { id: "pre", label: "Pre Assessments" },
  { id: "post", label: "Post Assessments" },
  { id: "attempted", label: "Attempted" },
];

function getVisibleAssessments(tab, assessments) {
  if (tab === "pre") return assessments.filter((item) => item.typeClass === "pre");
  if (tab === "post") return assessments.filter((item) => item.typeClass === "post");
  if (tab === "attempted") return assessments.filter((item) => item.attempt);
  return assessments;
}

function AssessmentHero() {
  return <section className="assessment-hero"><div className="assessment-hero__badge"><Sparkles size={14} /><span>Evaluate · Improve · Grow</span></div><div className="assessment-hero__content"><h1>Assessments</h1><p>Review your course assessments, attempt a test, and track your results.</p></div><div className="assessment-hero__visual" aria-hidden="true"><img src={herostudent} alt="" className="assessment-hero__img" /></div></section>;
}

function AssessmentTabs({ activeTab, onChange }) {
  return <div className="assessment-tabs" role="tablist" aria-label="Assessment filters">{TABS.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} className={`assessment-tab ${activeTab === tab.id ? "assessment-tab--active" : ""}`} onClick={() => onChange(tab.id)}>{tab.label}</button>)}</div>;
}

function CourseSelector({ value, onChange, courses }) {
  return <div className="assessment-course-selector"><label htmlFor="assessment-course">Course Scope</label><div className="assessment-select"><BookOpen size={16} className="assessment-select__icon" /><select id="assessment-course" value={value} onChange={(event) => onChange(event.target.value)}><option value="">Select a course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select><ChevronDown size={16} className="assessment-select__chevron" /></div></div>;
}

function SummaryCard({ icon: Icon, value, label, variant }) {
  return <div className={`assessment-summary-card assessment-summary-card--${variant}`}><div className="assessment-summary-card__icon"><Icon size={20} /></div><div className="assessment-summary-card__content"><strong>{value}</strong><span>{label}</span></div></div>;
}

function AssessmentItem({ assessment, viewMode }) {
  const Icon = assessment.icon;
  const pending = assessment.status === "pending";
  const resultBadge = assessment.status === "completed"
    ? <div className="assessment-status-badge assessment-status-badge--completed"><span>Score</span><strong>{Math.round(assessment.score || 0)}%</strong></div>
    : <div className="assessment-status-badge assessment-status-badge--neutral"><span>Status</span><strong>{pending ? "Pending review" : "Not started"}</strong></div>;
  const action = assessment.attempt
    ? <Link to={`/student/assessments/${assessment.id}/result`} className="assessment-button assessment-button--outline">{pending ? "View answers" : "View Result"}</Link>
    : <Link to={`/student/assessments/${assessment.id}`} className="assessment-button assessment-button--primary"><Play size={13} />Start Now</Link>;
  return <article className={`assessment-card assessment-card--${viewMode}`}><div className={`assessment-card__icon assessment-card__icon--${assessment.iconClass}`}><Icon size={20} /></div><div className="assessment-card__body"><div className="assessment-card__header"><h3>{assessment.title}</h3><span className={`assessment-type assessment-type--${assessment.typeClass}`}>{assessment.type}</span></div><p className="assessment-card__description">{assessment.description}</p></div><div className="assessment-card__meta"><span><FileText size={14} />{assessment.questions} Questions</span><span><Clock3 size={14} />{assessment.duration}</span></div><div className="assessment-card__result">{resultBadge}</div><div className="assessment-card__action">{action}</div></article>;
}

function PerformanceCard({ assessments }) {
  const scores = assessments.map((row) => row.attempt?.percentage).filter((score) => Number.isFinite(Number(score))).map(Number);
  const preScore = assessments.find((row) => row.typeClass === "pre" && row.attempt)?.attempt?.percentage || 0;
  const postScore = assessments.find((row) => row.typeClass === "post" && row.attempt)?.attempt?.percentage || 0;
  const average = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  return <section className="performance-card"><div className="panel-heading"><h2>Performance Snapshot</h2><Link to="/student/progress" className="report-link">Detailed Report <ArrowRight size={14} /></Link></div><div className="performance-chart"><div className="performance-bars">{[["Pre-Test", preScore, "pre"], ["Post-Test", postScore, "post"]].map(([label, score, tone]) => <div className="performance-bar" key={label}><span className="performance-bar__value">{score}%</span><div className="performance-bar__track"><div className={`performance-bar__fill performance-bar__fill--${tone}`} style={{ height: `${score}%` }} /></div><span className="performance-bar__label">{label}</span></div>)}</div><div className="performance-donut-wrapper"><div className="performance-donut"><div className="performance-donut__inner"><strong>{average}%</strong></div></div><span className="performance-donut__label">Average Score</span></div></div><div className="performance-success"><div className="performance-success__icon"><Trophy size={18} /></div><div><strong>{scores.length ? "Your performance" : "No results yet"}</strong><p>{scores.length ? `Average across ${scores.length} submitted assessment${scores.length === 1 ? "" : "s"}.` : "Complete an assessment to see your score here."}</p></div></div></section>;
}

function AssessmentInstructions() {
  return <section className="assessment-instructions"><div className="panel-heading"><h2>Before You Begin</h2><Target size={17} /></div><ul><li>Read each question carefully before submitting.</li><li>Timed assessments show the countdown while you work.</li><li>Your remaining attempts depend on the assessment settings.</li><li>Descriptive answers may need trainer review.</li></ul></section>;
}

function NeedHelp() {
  return <section className="assessment-help"><HelpCircle size={18} /><div><strong>Need help?</strong><p>Contact your trainer if an assessment is unavailable or you need support.</p><Link to="/student/support">Get support <ArrowRight size={13} /></Link></div></section>;
}

function AssessmentBottomCTA() {
  return <section className="assessment-bottom-cta"><div><span>Keep learning</span><h2>Review your lessons before your next assessment.</h2></div><Link to="/student/courses" className="assessment-button assessment-button--outline">My courses <ArrowRight size={14} /></Link></section>;
}

function AssessmentFooter() {
  return <footer className="assessment-footer"><span>© 2026 Prime Easy Learn Training Institute. All rights reserved.</span><div className="assessment-footer__links"><Link to="/student/support">Support</Link><span>·</span><Link to="/student/profile">Account settings</Link></div></footer>;
}

export default function StudentAssessments() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [assessments, setAssessments] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([api.get("/api/learner/my-courses"), api.get("/api/attempts", { params: { limit: 100 } })])
      .then(([courseResult, attemptResult]) => {
        if (!active) return;
        const options = (courseResult?.courses || []).filter((row) => ["ACTIVE", "COMPLETED"].includes(row.enrollment?.status)).map((row) => row.enrollment.courseId).filter((course) => course?._id).map((course) => ({ id: String(course._id), title: course.title }));
        setCourses(options); setSelectedCourse(options[0]?.id || "");
        const rows = [...(attemptResult?.items || [])];
        const loadMore = async () => {
          for (let page = 2; page <= Number(attemptResult?.totalPages || 1); page += 1) {
            const result = await api.get("/api/attempts", { params: { page, limit: 100 } });
            rows.push(...(result?.items || []));
          }
          if (active) setAttempts(rows);
        };
        return loadMore();
      })
      .catch((loadError) => { if (active) setError(loadError.message || "Could not load your assessments."); })
      .finally(() => { if (active) setLoadingCourses(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedCourse) { setAssessments([]); return undefined; }
    let active = true;
    setLoadingAssessments(true); setError("");
    api.get("/api/assessments", { params: { courseId: selectedCourse, limit: 100 } })
      .then((result) => { if (active) setAssessments(result?.items || []); })
      .catch((loadError) => { if (active) { setAssessments([]); setError(loadError.message || "Could not load assessments for this course."); } })
      .finally(() => { if (active) setLoadingAssessments(false); });
    return () => { active = false; };
  }, [selectedCourse]);

  const selectedAssessments = useMemo(() => assessments.map((assessment) => {
    const attempt = attempts.find((row) => String(row.assessmentId?._id || row.assessmentId) === String(assessment._id));
    const pendingReview = Number(attempt?.pendingReviewCount || 0) > 0;
    const pre = assessment.type === "PRE";
    const post = assessment.type === "POST";
    return { id: assessment._id, title: assessment.title, description: assessment.description || assessment.moduleId?.title || "Assessment for this course.", type: pre ? "Pre Assessment" : post ? "Post Assessment" : "Module Assessment", typeClass: pre ? "pre" : post ? "post" : "module", questions: assessment.questionCount || 0, duration: assessment.durationMinutes ? `${assessment.durationMinutes} Mins` : "No time limit", score: attempt?.percentage, attempt, status: pendingReview ? "pending" : attempt ? "completed" : "not-attempted", icon: pre || post ? FileText : FileCheck2, iconClass: pre ? "purple" : post ? "blue" : attempt ? "green" : "red" };
  }), [assessments, attempts]);
  const visibleAssessments = useMemo(() => getVisibleAssessments(activeTab, selectedAssessments), [activeTab, selectedAssessments]);
  const completedCount = selectedAssessments.filter((assessment) => assessment.attempt).length;
  const pendingCount = selectedAssessments.filter((assessment) => assessment.status === "pending").length;
  const unattemptedCount = selectedAssessments.length - completedCount;

  return <StudentLayout><div className="student-assessments"><AssessmentHero /><div className="assessment-container"><AssessmentTabs activeTab={activeTab} onChange={setActiveTab} /><div className="assessment-layout"><main className="assessment-main"><CourseSelector value={selectedCourse} onChange={setSelectedCourse} courses={courses} /><div className="assessment-summary"><SummaryCard icon={FileText} value={selectedAssessments.length} label="Total" variant="purple" /><SummaryCard icon={CheckCircle2} value={completedCount} label="Attempted" variant="green" /><SummaryCard icon={Clock3} value={pendingCount} label="Pending review" variant="orange" /><SummaryCard icon={XCircle} value={unattemptedCount} label="Unattempted" variant="red" /></div>{error && <p className="assessment-load-error" role="alert">{error}</p>}<section className="assessment-list-section"><div className="assessment-list-heading"><div><span className="assessment-subtitle">Course Evaluations</span><h2>{courses.find((course) => course.id === selectedCourse)?.title || "Your assessments"}</h2></div><div className="assessment-list-controls"><span className="assessment-count">{visibleAssessments.length} Assessments</span><div className="view-mode-toggle" role="group" aria-label="View Mode"><button type="button" className={`view-mode-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")} title="List View"><List size={16} /></button><button type="button" className={`view-mode-btn ${viewMode === "block" ? "active" : ""}`} onClick={() => setViewMode("block")} title="Block Grid View"><LayoutGrid size={16} /></button></div></div></div><div className={`assessment-grid assessment-grid--${viewMode}`}>{loadingCourses || loadingAssessments ? <p className="assessment-loading">Loading assessments…</p> : visibleAssessments.length ? visibleAssessments.map((assessment) => <AssessmentItem key={assessment.id} assessment={assessment} viewMode={viewMode} />) : <div className="assessment-empty"><div className="assessment-empty__icon"><RotateCcw size={20} /></div><h3>No Assessments Found</h3><p>{selectedCourse ? "There are no published assessments matching these filters." : "You are not enrolled in a course with assessments yet."}</p></div>}</div></section></main><aside className="assessment-sidebar"><PerformanceCard assessments={selectedAssessments} /><AssessmentInstructions /><NeedHelp /></aside></div><AssessmentBottomCTA /></div><footer className="assessment-footer"><span>© 2026 Prime Easy Learn Training Institute. All rights reserved.</span><div className="assessment-footer__links"><Link to="/student/support">Support</Link><span>·</span><Link to="/student/profile">Account settings</Link></div></footer></div></StudentLayout>;
}
