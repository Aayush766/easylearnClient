import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Clock3, Search } from "lucide-react";
import api from "../services/api";
import StudentLayout from "./StudentLayout";
import fullstackImage from "../assets/fullstack.png";
import uiuxImage from "../assets/uiux.png";
import marketingImage from "../assets/marketing.png";
import dataImage from "../assets/dataanalytics.png";
import "./StudentCourseCatalog.css";

function imageFor(course) { const title = `${course.title || ""} ${course.categoryId?.name || ""}`.toLowerCase(); return title.includes("design") ? uiuxImage : title.includes("market") ? marketingImage : title.includes("data") || title.includes("python") ? dataImage : fullstackImage; }

export default function StudentCourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { let active = true; api.get("/api/courses/categories").then((result) => { if (active) setCategories(result?.items || []); }).catch(() => {}); return () => { active = false; }; }, []);
  useEffect(() => { let active = true; setLoading(true); setError(""); api.get("/api/courses/catalog", { params: { limit: 100, search: search.trim() || undefined, categoryId: categoryId || undefined } }).then((result) => { if (active) setCourses(result?.items || []); }).catch((loadError) => { if (active) { setCourses([]); setError(loadError.message || "Could not load the course catalog."); } }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [search, categoryId]);
  return <StudentLayout><main className="student-catalog"><header><div><span>LEARN SOMETHING NEW</span><h1>Course Catalog</h1><p>Explore published programs and continue courses you already have access to.</p></div><Link to="/student/courses">My Courses</Link></header><div className="student-catalog__filters"><label><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search courses" /></label><select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} aria-label="Filter by category"><option value="">All categories</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></div>{error && <p className="student-catalog__error" role="alert">{error}</p>}{loading ? <div className="student-catalog__empty" role="status">Loading courses…</div> : courses.length ? <section className="student-catalog__grid">{courses.map((course) => <article key={course._id}><img src={course.thumbnail?.url || imageFor(course)} alt="" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = imageFor(course); }} /><div className="student-catalog__body"><span>{course.categoryId?.name || "Course"}</span><h2>{course.title}</h2><p>{course.description || "Build practical skills with this instructor-led learning program."}</p><small><BookOpen size={14} /> {course.hasFreePreview ? "Free preview available" : course.isEnrolled ? "Enrolled" : "Enrollment required"}{course.durationMinutes ? <><i /> <Clock3 size={14} /> {course.durationMinutes} min</> : null}</small><div>{course.isEnrolled || course.hasFreePreview ? <Link to={`/student/courses/${course._id}`}>{course.isEnrolled ? "Continue learning" : "Preview course"}</Link> : <Link to="/student/support">Request enrollment</Link>}</div></div></article>)}</section> : <div className="student-catalog__empty"><h2>No courses found</h2><p>Try another search or category, or check back later for new programs.</p></div>}</main></StudentLayout>;
}
