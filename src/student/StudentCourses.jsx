import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import StudentLayout from "./StudentLayout";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Compass,
  FileBadge2,
  FileText,
  Grid2X2,
  List,
  RefreshCw,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import "./StudentCourses.css";
import "./StudentExperiencePolish.css";
import herostudent from "../public/assets/student/hero-student.png";
import fullstackImage from "../assets/fullstack.png";
import uiuxImage from "../assets/uiux.png";
import marketingImage from "../assets/marketing.png";
import dataAnalyticsImage from "../assets/dataanalytics.png";
import api from "../services/api";

const FILTERS = [
  { id: "all", label: "All Courses" },
  { id: "progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
  { id: "expired", label: "Expired" },
];

function fallbackCourseImage(course) {
  const name = `${course.slug || ""} ${course.title || ""}`.toLowerCase();
  if (name.includes("design") || name.includes("ui-ux")) return uiuxImage;
  if (name.includes("marketing")) return marketingImage;
  if (name.includes("data")) return dataAnalyticsImage;
  return fullstackImage;
}

function getFilterStatus(filterId) {
  if (filterId === "progress") return "In Progress";
  if (filterId === "completed") return "Completed";
  if (filterId === "expired") return "Expired";
  return null;
}

function StatusBadge({ tone, children }) {
  return (
    <span className={`sc-badge sc-badge--${tone}`}>
      <span className="sc-badge__dot" />
      {children}
    </span>
  );
}

function CourseMetaRow({ icon: Icon, label, value, tone = "default", link, subtext }) {
  return (
    <div className={`sc-meta-item sc-meta-item--${tone}`}>
      <div className="sc-meta-item__header">
        <Icon size={12} className="sc-meta-item__icon" />
        <span className="sc-meta-item__label">{label}</span>
      </div>
      <div className="sc-meta-item__body">
        {link ? (
          <Link to={link} className="sc-meta-item__link">
            {value}
          </Link>
        ) : (
          <span className="sc-meta-item__value">{value}</span>
        )}
        {subtext && <span className="sc-meta-item__subtext">{subtext}</span>}
      </div>
    </div>
  );
}

function CourseCard({ course }) {
  const coursePath = `/student/courses/${course.id}`;

  return (
    <article className="sc-card">
      <div className="sc-card__media">
        <img src={course.image} alt={course.title} loading="lazy" />
        <div className="sc-card__overlay" />

        <div className="sc-card__badges">
          <StatusBadge tone={course.statusTone}>{course.status}</StatusBadge>
          <span className="sc-card__category">{course.category}</span>
        </div>
      </div>

      <div className="sc-card__body">
        <h3 className="sc-card__title" title={course.title}>
          {course.title}
        </h3>
        <p className="sc-card__desc">{course.description}</p>

        {/* Progress Bar */}
        <div className="sc-progress">
          <div className="sc-progress__header">
            <span className="sc-progress__label">Progress</span>
            <span className="sc-progress__val">{course.progress}%</span>
          </div>
          <div className="sc-progress__track">
            <div
              className={`sc-progress__fill sc-progress__fill--${course.statusTone}`}
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>

        {/* Metadata Grid (2-Column Compact Layout) */}
        <div className="sc-card__meta-grid">
          <CourseMetaRow
            icon={Calendar}
            label="Enrolled"
            value={course.startDate}
          />
          <CourseMetaRow
            icon={Clock}
            label={course.dateLabel}
            value={course.dateValue}
            subtext={course.dateSubtext}
            tone={course.dateTone}
          />
          <CourseMetaRow
            icon={BookOpen}
            label="Modules"
            value={course.lessons}
          />
          <CourseMetaRow
            icon={FileText}
            label="Assessments"
            value={course.assessments}
          />
          <CourseMetaRow
            icon={Award}
            label="Certificate"
            value={course.certificate}
              link={course.certificateLink ? "/student/certificates" : undefined}
          />
          {course.finalScore && (
            <CourseMetaRow
              icon={FileBadge2}
              label="Final Score"
              value={course.finalScore}
              tone="success"
            />
          )}
        </div>

        {course.expiredMessage && (
          <div className="sc-card__expired-alert">
            <p>{course.expiredMessage}</p>
          </div>
        )}

        {/* Action Buttons (Side-by-Side) */}
        <div className="sc-card__actions">
          {course.disabled ? <span className={`sc-btn sc-btn--${course.actionTone} is-disabled`} aria-disabled="true">{course.action}</span> : <Link to={coursePath} className={`sc-btn sc-btn--${course.actionTone}`}>{course.action}<ChevronRight size={14} /></Link>}
          {course.disabled ? <span className="sc-btn sc-btn--ghost is-disabled" aria-disabled="true">Details</span> : <Link to={coursePath} className="sc-btn sc-btn--ghost">Details</Link>}
        </div>
      </div>
    </article>
  );
}

function CourseHero({ total, inProgress, completed }) {
  return (
    <section className="sc-hero">
      <div className="sc-hero__bg">
        <div className="sc-hero__glow-1" />
        <div className="sc-hero__glow-2" />
        <div className="sc-hero__grid-pattern" />
      </div>

      <div className="sc-hero__container">
        <div className="sc-hero__content">
          <div className="sc-hero__pill">
            <Sparkles size={13} />
            <span>Interactive Learning Dashboard</span>
          </div>
          <h1>
            My Learning <span className="sc-hero__gradient-text">Journey</span>
          </h1>
          <p>
            Track your ongoing courses, complete assessments, download certificates, and level up your skills.
          </p>

          <div className="sc-hero__stats">
            <div className="sc-hero__stat-item">
              <strong>{total}</strong>
              <span>Total Enrolled</span>
            </div>
            <div className="sc-hero__stat-divider" />
            <div className="sc-hero__stat-item">
              <strong>{inProgress}</strong>
              <span>In Progress</span>
            </div>
            <div className="sc-hero__stat-divider" />
            <div className="sc-hero__stat-item">
              <strong>{completed}</strong>
              <span>Completed</span>
            </div>
          </div>
        </div>

        <div className="sc-hero__banner">
          <div className="sc-hero__circle" />
          
          <div className="sc-hero__floating-chip sc-hero__floating-chip--left">
            <div className="sc-hero__chip-icon sc-hero__chip-icon--orange">
              <Zap size={14} />
            </div>
            <div>
              <small>Goal</small>
              <strong>Learn &amp; Grow</strong>
            </div>
          </div>

          <div className="sc-hero__floating-chip sc-hero__floating-chip--right">
            <div className="sc-hero__chip-icon sc-hero__chip-icon--green">
              <CheckCircle2 size={14} />
            </div>
            <div>
              <small>Status</small>
              <strong>On Track</strong>
            </div>
          </div>

          <img
            src={herostudent}
            alt="Student Learning"
            className="sc-hero__student-img"
          />
        </div>
      </div>
    </section>
  );
}

function CourseFilters({ activeFilter, onFilterChange, courses }) {
  const counts = {
    all: courses.length,
    progress: courses.filter((course) => course.status === "In Progress").length,
    completed: courses.filter((course) => course.status === "Completed").length,
    expired: courses.filter((course) => course.status === "Expired").length,
  };
  return (
    <div className="sc-filters" role="tablist" aria-label="Course filters">
      {FILTERS.map((filter) => (
        <button
          key={filter.id}
          type="button"
          role="tab"
          aria-selected={activeFilter === filter.id}
          className={`sc-filters__btn ${activeFilter === filter.id ? "is-active" : ""}`}
          onClick={() => onFilterChange(filter.id)}
        >
          <span>{filter.label}</span>
          <span className="sc-filters__count">{counts[filter.id]}</span>
        </button>
      ))}
    </div>
  );
}

function CourseToolbar({ searchQuery, onSearchChange, sort, onSortChange, view, onViewChange }) {
  return (
    <div className="sc-toolbar">
      <div className="sc-toolbar__search">
        <Search size={14} className="sc-toolbar__search-icon" />
        <input
          type="text"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="sc-toolbar__right">
        <div className="sc-toolbar__sort">
          <label htmlFor="course-sort">Sort by</label>
          <div className="sc-select">
            <select
              id="course-sort"
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
            >
              <option value="recent">Recently Enrolled</option>
              <option value="progress">Highest Progress</option>
              <option value="name">Course Name (A-Z)</option>
            </select>
            <ChevronDown size={12} className="sc-select__arrow" />
          </div>
        </div>

        <div className="sc-view-toggle" aria-label="View mode">
          <button
            type="button"
            className={view === "grid" ? "is-active" : ""}
            onClick={() => onViewChange("grid")}
            aria-label="Grid view"
          >
            <Grid2X2 size={14} />
          </button>
          <button
            type="button"
            className={view === "list" ? "is-active" : ""}
            onClick={() => onViewChange("list")}
            aria-label="List view"
          >
            <List size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ExploreCourses() {
  return (
    <section className="sc-explore">
      <div className="sc-explore__glow" />
      <div className="sc-explore__content">
        <div className="sc-explore__left">
          <div className="sc-explore__badge">
            <Compass size={13} />
            <span>Expand Your Knowledge</span>
          </div>
          <h2>Ready to learn something new?</h2>
          <p>
            Upgrade your skills with our latest industry-aligned certification programs and bootcamps.
          </p>
          <Link to="/student/courses/catalog" className="sc-btn sc-btn--primary">
            Browse All Courses
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="sc-explore__benefits">
          <div className="sc-explore__benefit-card">
            <div className="sc-explore__icon">
              <BookOpen size={16} />
            </div>
            <div>
              <strong>20+ Courses</strong>
              <small>Industry-focused curricula</small>
            </div>
          </div>

          <div className="sc-explore__benefit-card">
            <div className="sc-explore__icon">
              <RefreshCw size={16} />
            </div>
            <div>
              <strong>Self-Paced</strong>
              <small>Learn anytime, anywhere</small>
            </div>
          </div>

          <div className="sc-explore__benefit-card">
            <div className="sc-explore__icon">
              <Award size={16} />
            </div>
            <div>
              <strong>Certificates</strong>
              <small>Boost your resume</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="sc-footer">
      <div className="sc-footer__container">
        <span>© 2025 Prime Easy Learn Training Institute. All rights reserved.</span>

        <div className="sc-footer__links">
          <a href="#privacy">Privacy Policy</a>
          <span className="sc-footer__dot">•</span>
          <a href="#terms">Terms &amp; Conditions</a>
          <span className="sc-footer__dot">•</span>
          <a href="#help">Help Center</a>
        </div>
      </div>
    </footer>
  );
}

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [coursesError, setCoursesError] = useState("");
  useEffect(() => {
    let active = true;
    api.get("/api/learner/my-courses").then((result) => {
      const rows = result?.items || result?.courses || (Array.isArray(result) ? result : []);
      if (active) setCourses(rows.map((entry) => {
        const enrollment = entry.enrollment || null;
        const course = entry.courseId || enrollment?.courseId || entry.course || entry;
        const progress = Math.max(0, Math.min(100, Number(entry.progressPercent ?? entry.progress ?? 0)));
        const enrollmentStatus = enrollment?.status || entry.status;
        const expired = enrollmentStatus === "EXPIRED" || enrollmentStatus === "SUSPENDED" || (enrollment?.expiryDate && new Date(enrollment.expiryDate) < new Date());
        const upcoming = enrollmentStatus === "UPCOMING" || (enrollment?.startDate && new Date(enrollment.startDate) > new Date());
        const status = entry.isFreePreview ? "Free Preview" : enrollmentStatus === "COMPLETED" ? "Completed" : expired ? "Expired" : upcoming ? "Upcoming" : progress ? "In Progress" : "Not Started";
        const statusTone = status === "Completed" ? "complete" : status === "In Progress" ? "progress" : status === "Expired" ? "expired" : "neutral";
        return { ...course, id: course._id || course.id, title: course.title || "Course", category: course.categoryId?.name || course.category || "Course", description: course.description || "", progress, status, statusTone, startDate: enrollment?.startDate ? new Date(enrollment.startDate).toLocaleDateString() : entry.isFreePreview ? "Open access" : "Enrolled", dateLabel: status === "Expired" ? "Expired On" : entry.isFreePreview ? "Access" : "Valid Until", dateValue: enrollment?.expiryDate ? new Date(enrollment.expiryDate).toLocaleDateString() : entry.isFreePreview ? "Free preview" : "Active", dateSubtext: "", dateTone: status === "Expired" ? "danger" : "success", lessons: `${entry.completedContent || 0} / ${entry.totalContent || 0}`, assessments: `${entry.completedAssessments || 0} / ${entry.assessmentCount || 0}`, certificate: status === "Completed" ? "View certificates" : "Not available", certificateLink: status === "Completed", image: course.thumbnail?.url || fallbackCourseImage(course), action: entry.isFreePreview ? "Preview Course" : expired ? "Access expired" : upcoming ? "Not started" : progress ? "Continue" : "Start Learning", actionTone: "primary", disabled: expired || upcoming };
      }));
    }).catch((error) => { if (active) setCoursesError(error.message); });
    return () => { active = false; };
  }, []);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("recent");
  const [view, setView] = useState("grid");

  const visibleCourses = useMemo(() => {
    const status = getFilterStatus(activeFilter);


    return courses.filter((course) => {
      const matchesFilter = status ? course.status === status : true;
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    }).sort((a, b) => {
      if (sort === "progress") return b.progress - a.progress;
      if (sort === "name") return a.title.localeCompare(b.title);
      return Number(a.displayOrder || 0) - Number(b.displayOrder || 0);
    });
  }, [activeFilter, searchQuery, sort, courses]);

  return (
    <StudentLayout>
      <div className="sc-page">
        <CourseHero total={courses.length} inProgress={courses.filter((course) => course.status === "In Progress").length} completed={courses.filter((course) => course.status === "Completed").length} />

        <div className="sc-controls">
          <CourseFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            courses={courses}
          />

          <CourseToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sort={sort}
            onSortChange={setSort}
            view={view}
            onViewChange={setView}
          />
        </div>

        <section
          className={`sc-grid sc-grid--${view}`}
          aria-label="Enrolled courses"
        >
          {coursesError && <p role="alert">Could not load your courses: {coursesError}</p>}
          {visibleCourses.length > 0 ? (
            visibleCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))
          ) : (
            <div className="sc-empty">
              <p>No courses found matching your criteria.</p>
            </div>
          )}
        </section>

        <ExploreCourses />
      </div>

      <Footer />
    </StudentLayout>
  );
}
