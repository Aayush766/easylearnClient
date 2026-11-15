import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  ListVideo,
  Maximize,
  Pause,
  Play,
  Search,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import StudentLayout from "./StudentLayout";
import { bookmarkId, readBookmarks, writeBookmarks } from "./bookmarkStore";
import fullstackImage from "../assets/fullstack.png";
import uiuxImage from "../assets/uiux.png";
import marketingImage from "../assets/marketing.png";
import dataImage from "../assets/dataanalytics.png";
import "./StudentCourseLearning.css";

const COURSES = {
  "full-stack": {
    title: "Full Stack Web Development",
    category: "Web Development",
    image: fullstackImage,
    progress: 65,
    chapters: [
      { title: "Getting Started with the Web", duration: "18 min", ebook: "Web Foundations: HTML, CSS & the Browser", video: "HTML & CSS: Build Your First Page", videoUrl: "", text: "Start with the structure of the web: how browsers request pages, how HTML gives content meaning, and how CSS turns that structure into a clear visual experience. In this chapter, you will set up your workspace and build a small, accessible profile page." },
      { title: "JavaScript Essentials", duration: "24 min", ebook: "JavaScript Essentials", video: "JavaScript Essentials: From Values to Events", videoUrl: "", text: "JavaScript adds behavior to the page. Work through values, functions, arrays, objects, and events, then combine them to build interactive features. The examples focus on readable code and small steps you can test as you go." },
      { title: "React Components & State", duration: "32 min", ebook: "Building Interfaces with React", video: "React Components & State", videoUrl: "", text: "React helps you compose an interface from reusable components. Learn props, state, event handling, and effects while building a course dashboard that responds to user input." },
      { title: "Node.js and Express APIs", duration: "28 min", ebook: "A Practical Guide to Node.js APIs", video: "Node.js and Express APIs", videoUrl: "", text: "Create a server with Node.js and Express, define clear routes, validate input, and return useful responses. You will shape a small REST API that a frontend can consume." },
      { title: "MongoDB & Deployment", duration: "35 min", ebook: "From Database to Deployment", video: "MongoDB & Deployment", videoUrl: "", text: "Store application data in MongoDB, connect it to your API, and prepare the full application for deployment. Finish with a checklist for environment variables, security, and production readiness." },
    ],
  },
  "ui-ux": {
    title: "UI/UX Design Masterclass",
    category: "UI/UX Design",
    image: uiuxImage,
    progress: 38,
    chapters: [
      { title: "Design Thinking & Research", duration: "20 min", ebook: "A Field Guide to UX Research", video: "Design Thinking & UX Research", videoUrl: "", text: "Good design begins with understanding people. Practice writing research questions, mapping assumptions, and turning interview observations into useful themes and opportunity statements." },
      { title: "Information Architecture", duration: "22 min", ebook: "Organizing Content for People", video: "Information Architecture Basics", videoUrl: "", text: "Arrange information around the way people think and the tasks they need to complete. This chapter covers content inventories, simple sitemaps, and card sorting." },
      { title: "Wireframes & Prototypes", duration: "27 min", ebook: "From Wireframe to Prototype", video: "Wireframes & Interactive Prototypes", videoUrl: "", text: "Move from rough layout sketches to interactive prototypes. Use hierarchy, spacing, and clear interaction states to communicate an idea before polishing the visual details." },
      { title: "Visual Design Systems", duration: "30 min", ebook: "Building a Flexible Design System", video: "Visual Design Systems", videoUrl: "", text: "Create a consistent visual language with type scales, color roles, spacing tokens, and reusable components. Learn how to document decisions so a team can use them confidently." },
      { title: "Usability Testing", duration: "19 min", ebook: "A Practical Usability Testing Handbook", video: "Usability Testing in Practice", videoUrl: "", text: "Plan a short usability session, give participants realistic tasks, and capture what they do without leading them. Turn findings into a prioritized list of design improvements." },
    ],
  },
  "digital-marketing": {
    title: "Digital Marketing Essentials",
    category: "Digital Marketing",
    image: marketingImage,
    progress: 100,
    chapters: [
      { title: "Digital Strategy & Goals", duration: "18 min", ebook: "The Digital Marketing Playbook", video: "Digital Strategy & Campaign Goals", videoUrl: "", text: "Connect business goals to a focused digital strategy. Define an audience, choose useful channels, and set measurable objectives before planning campaigns." },
      { title: "Search Engine Optimization", duration: "26 min", ebook: "SEO: Search Visibility Fundamentals", video: "SEO: Search Visibility Fundamentals", videoUrl: "", text: "Help useful content reach the people searching for it. Explore search intent, page structure, technical basics, and a sustainable approach to keyword research." },
      { title: "Content & Social Campaigns", duration: "24 min", ebook: "Content That Connects", video: "Content & Social Campaigns", videoUrl: "", text: "Plan a consistent content calendar around audience needs. Choose formats for each platform, write clear calls to action, and keep campaign messaging recognizable." },
      { title: "Paid Search & Google Ads", duration: "29 min", ebook: "Paid Search Campaigns", video: "Paid Search & Google Ads", videoUrl: "", text: "Build a paid search campaign with a clear objective, tightly related keywords, useful ad copy, and a landing page that follows through on the promise." },
      { title: "Analytics & Optimization", duration: "21 min", ebook: "Measure What Matters", video: "Marketing Analytics & Optimization", videoUrl: "", text: "Read campaign results in context. Choose a small set of meaningful metrics, find drop-offs, and use controlled experiments to improve future performance." },
    ],
  },
  "data-analytics": {
    title: "Data Analytics with Python",
    category: "Data Science",
    image: dataImage,
    progress: 100,
    chapters: [
      { title: "Python & Jupyter Setup", duration: "17 min", ebook: "Python for Data Analysis: First Steps", video: "Python & Jupyter: Your Analysis Workspace", videoUrl: "", text: "Set up a notebook environment and learn the Python basics used throughout an analysis: variables, collections, functions, and a repeatable workflow for exploring data." },
      { title: "Working with Pandas", duration: "28 min", ebook: "Pandas: Tables, Filters & Joins", video: "Working with Pandas DataFrames", videoUrl: "", text: "Load tabular data into a DataFrame, inspect its shape, select and filter rows, handle missing values, and combine tables to prepare a trustworthy dataset." },
      { title: "Exploratory Data Analysis", duration: "25 min", ebook: "Exploring Data with Confidence", video: "Exploratory Data Analysis", videoUrl: "", text: "Use descriptive statistics and visual checks to understand distributions, relationships, and unusual records. Keep notes about assumptions and data quality as you explore." },
      { title: "Visualization & Storytelling", duration: "23 min", ebook: "Data Visualization That Explains", video: "Visualization & Data Storytelling", videoUrl: "", text: "Choose charts that fit the question, label them clearly, and organize findings into a short story that helps a reader decide what to do next." },
      { title: "Machine Learning Basics", duration: "31 min", ebook: "A First Model with Scikit-learn", video: "Machine Learning with Scikit-learn", videoUrl: "", text: "Train a simple model with a thoughtful train-test split. Compare a baseline to a first model, inspect errors, and explain what the result can and cannot tell you." },
    ],
  },
};

export default function StudentCourseLearning() {
  const { id } = useParams();
  const fallbackCourse = COURSES[id] || COURSES["full-stack"];
  const [courseData, setCourseData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [progressRows, setProgressRows] = useState([]);
  const [bookmarks, setBookmarks] = useState(() => readBookmarks());
  const [readerPdfUrl, setReaderPdfUrl] = useState("");
  const [readerError, setReaderError] = useState("");
  const [readerLoading, setReaderLoading] = useState(false);
  useEffect(() => {
    let active = true;
    api.get(`/api/learner/courses/${id}/player`).then((result) => {
      if (!active) return;
      const courseRecord = result?.course || {};
      const chapters = (result?.content || []).map((item) => ({
        contentId: item._id,
        title: item.title,
        ebook: item.title,
        video: item.title,
        mediaType: item.type,
        videoProvider: item.playbackProvider,
        videoUrl: item.type === "VIDEO" ? item.playbackUrl || "" : "",
        ebookUrl: item.type !== "VIDEO" ? item.readerUrl || item.file?.url || "" : "",
        readerUrl: item.type === "PDF" ? item.readerUrl || "" : "",
        downloadable: item.downloadable,
        addToNotes: item.addToNotes,
        text: item.description || "Open this lesson to view its course material.",
        duration: item.durationSeconds ? `${Math.ceil(item.durationSeconds / 60)} min` : "",
      }));
      const rows = result?.progress || [];
      setProgressRows(rows);
      setCourseData({ ...fallbackCourse, id: String(courseRecord._id || id), title: courseRecord.title || fallbackCourse.title, category: courseRecord.categoryId?.name || fallbackCourse.category, image: courseRecord.thumbnail?.url || fallbackCourse.image, enrollment: result?.enrollment || null, chapters });
      const done = Object.fromEntries(rows.filter((row) => row.completed).map((row) => [chapters.findIndex((chapter) => String(chapter.contentId) === String(row.contentId)), true]).filter(([index]) => index >= 0));
      setCompleted(done);
    }).catch((error) => { if (active) setLoadError(error.message); });
    return () => { active = false; };
  }, [id, fallbackCourse]);
  const course = useMemo(() => courseData || { ...fallbackCourse, chapters: [] }, [courseData, fallbackCourse]);
  const [mode, setMode] = useState("video");
  const [activeIndex, setActiveIndex] = useState(0);
  const [completed, setCompleted] = useState({});
  const [search, setSearch] = useState("");
  const [readerOpen, setReaderOpen] = useState(false);
  const [showChapterMenu, setShowChapterMenu] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [videoTime, setVideoTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const progressTimer = useRef(null);
  const activeChapter = course.chapters[activeIndex] || { title: "No published lessons yet", ebook: "No course material", video: "No course material", videoUrl: "", text: "Your trainer has not published lessons for this course yet.", duration: "" };
  const bookmark = activeChapter.contentId ? { contentId: String(activeChapter.contentId), courseId: String(course.id || id), courseTitle: course.title, title: activeChapter.title, type: activeChapter.mediaType || "MATERIAL", duration: activeChapter.duration || "", savedAt: new Date().toISOString() } : null;
  const openPdfReader = async () => {
    setReaderError("");
    setReaderLoading(true);
    try {
      const pdf = await api.get(activeChapter.readerUrl, { responseType: "blob" });
      if (!(pdf instanceof Blob) || !pdf.size) throw new Error("The PDF response was empty.");
      setReaderPdfUrl((current) => { if (current) URL.revokeObjectURL(current); return URL.createObjectURL(pdf); });
      setReaderOpen(true);
    } catch (error) {
      setReaderError(error.status === 502
        ? "Cloudinary is blocking PDF delivery. Enable ‘Allow delivery of PDF and ZIP files’ in Cloudinary Console → Settings → Security, then try again."
        : error.message || "The PDF could not be loaded. Please try again.");
    } finally { setReaderLoading(false); }
  };
  useEffect(() => () => { if (readerPdfUrl) URL.revokeObjectURL(readerPdfUrl); }, [readerPdfUrl]);
  const isBookmarked = bookmark && bookmarks.some((item) => bookmarkId(item) === bookmarkId(bookmark));
  const toggleBookmark = () => {
    if (!bookmark) return;
    const updated = isBookmarked ? bookmarks.filter((item) => bookmarkId(item) !== bookmarkId(bookmark)) : [bookmark, ...bookmarks];
    writeBookmarks(updated);
    setBookmarks(updated);
  };
  const modeChapters = useMemo(() => course.chapters.filter((chapter) => mode === "video" ? chapter.mediaType === "VIDEO" : chapter.mediaType !== "VIDEO"), [course, mode]);
  const visibleChapters = useMemo(() => modeChapters.filter((chapter) => chapter.title.toLowerCase().includes(search.toLowerCase())), [modeChapters, search]);
  const completedCount = Object.values(completed).filter(Boolean).length;
  const courseProgress = course.chapters.length ? Math.round(completedCount * 100 / course.chapters.length) : 0;

  useEffect(() => {
    if (!courseData?.enrollment) return;
    Object.entries(completed).filter(([, done]) => done).forEach(([index]) => {
      const contentId = course.chapters[Number(index)]?.contentId;
      if (contentId) api.post("/api/learner/progress", { contentId, progressPercent: 100, completed: true }).then(({ progress }) => setProgressRows((rows) => [...rows.filter((row) => row.contentId !== contentId), progress])).catch(() => {});
    });
  }, [completed, id, courseData, course.chapters]);

  useEffect(() => {
    const chapter = course.chapters[activeIndex];
    if (!courseData?.enrollment || !chapter?.contentId || chapter.mediaType !== "VIDEO" || !videoDuration) return undefined;
    window.clearTimeout(progressTimer.current);
    progressTimer.current = window.setTimeout(() => {
      api.post("/api/learner/progress", { contentId: chapter.contentId, progressPercent: Math.min(100, Math.round(videoTime * 100 / videoDuration)), watchedSeconds: Math.round(videoTime), lastPosition: Math.round(videoTime) })
        .then(({ progress }) => setProgressRows((rows) => [...rows.filter((row) => row.contentId !== chapter.contentId), progress])).catch(() => {});
    }, 1200);
    return () => window.clearTimeout(progressTimer.current);
  }, [videoTime, videoDuration, activeIndex, course.chapters, courseData]);

  const goToChapter = (index) => {
    setActiveIndex(index);
    setReaderOpen(false);
    setPlaying(false);
    setVideoTime(0);
    setVideoDuration(0);
  };

  const chooseMode = (nextMode) => {
    setMode(nextMode); setReaderOpen(false); setSearch("");
    const nextIndex = course.chapters.findIndex((chapter) => nextMode === "video" ? chapter.mediaType === "VIDEO" : chapter.mediaType !== "VIDEO");
    if (nextIndex >= 0) goToChapter(nextIndex);
  };

  const togglePlayback = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) videoRef.current.play().catch(() => setPlaying(false));
    else videoRef.current.pause();
  };

  const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

  if (!courseData) return <StudentLayout><main className="learn-page"><p role={loadError ? "alert" : "status"}>{loadError ? `Could not load this course: ${loadError}` : "Loading your course…"}</p></main></StudentLayout>;
  if (!course.chapters.length) return <StudentLayout><main className="learn-page"><Link to="/student/courses" className="learn-back"><ArrowLeft size={17} /> My courses</Link><h1>{course.title}</h1><p>{loadError || "No lessons have been published for this course yet."}</p></main></StudentLayout>;

  return (
    <StudentLayout>
      <main className="learn-page">
        <div className="learn-topline">
          <Link to="/student/courses" className="learn-back"><ArrowLeft size={17} /> My courses</Link>
          <span><Check size={15} /> {courseData.enrollment ? "Your learning progress syncs to your account" : "Free preview · progress is not saved"}</span>
        </div>

        <section className="learn-course-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(12, 25, 54, .96), rgba(12, 25, 54, .64)), url(${course.image})` }}>
          <div>
            <span className="learn-eyebrow">{course.category} <i /> {course.chapters.length} lessons</span>
            <h1>{course.title}</h1>
            <p>Pick up where you left off, or choose a chapter to keep moving forward.</p>
          </div>
          <div className="learn-hero-progress">
            <div><span>Course progress</span><strong>{courseProgress}%</strong></div>
            <div className="learn-progress-track"><i style={{ width: `${courseProgress}%` }} /></div>
            <small>{completedCount} of {course.chapters.length} lessons completed</small>
          </div>
        </section>

        <div className="learn-mode-bar">
          <div className="learn-mode-tabs" role="tablist" aria-label="Learning format">
            <button type="button" role="tab" aria-selected={mode === "ebook"} className={mode === "ebook" ? "is-active" : ""} onClick={() => chooseMode("ebook")}><BookOpen size={17} /> Reading materials</button>
            <button type="button" role="tab" aria-selected={mode === "video"} className={mode === "video" ? "is-active" : ""} onClick={() => chooseMode("video")}><Play size={16} /> Video lectures</button>
          </div>
          <button className="learn-chapter-select" type="button" onClick={() => setShowChapterMenu((value) => !value)} disabled={!modeChapters.length}><ListVideo size={16} /> Lesson {activeIndex + 1} <ChevronDown size={15} /></button>
        </div>

        {showChapterMenu && <div className="learn-chapter-menu">{modeChapters.map((chapter) => { const index = course.chapters.indexOf(chapter); return <button key={chapter.contentId || chapter.title} type="button" onClick={() => { goToChapter(index); setShowChapterMenu(false); }}><span>{String(index + 1).padStart(2, "0")}</span>{chapter.title}<ChevronRight size={15} /></button>; })}</div>}

        <div className="learn-layout">
          <section className="learn-main">
            {!modeChapters.length ? <div className="learn-player-empty"><strong>No {mode === "video" ? "published videos" : "reading materials"} yet</strong><span>Your trainer has not added any {mode === "video" ? "video lessons" : "reading materials"} to this course.</span></div> : mode === "video" ? (
              <>
                <div className="learn-player-wrap">
                  {activeChapter.videoUrl && activeChapter.videoProvider === "CLOUDFLARE_STREAM" ? <div className="learn-stream-shell" ref={playerRef}><iframe src={activeChapter.videoUrl} title={activeChapter.video} allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;" allowFullScreen /></div> : activeChapter.videoUrl ? (
                    <div className="learn-video-shell" ref={playerRef}>
                      <video
                        key={activeChapter.videoUrl}
                        ref={videoRef}
                        src={activeChapter.videoUrl}
                        poster={course.image}
                        playsInline
                        preload="metadata"
                        onTimeUpdate={(event) => setVideoTime(event.currentTarget.currentTime)}
                        onLoadedMetadata={(event) => { const duration = event.currentTarget.duration || 0; setVideoDuration(duration); const saved = progressRows.find((row) => String(row.contentId) === String(activeChapter.contentId))?.lastPosition || 0; if (saved > 0 && saved < duration) event.currentTarget.currentTime = saved; }}
                        onPlay={() => setPlaying(true)}
                        onPause={() => setPlaying(false)}
                        onEnded={() => { setPlaying(false); setCompleted((state) => ({ ...state, [activeIndex]: true })); }}
                        onClick={togglePlayback}
                      >Your browser does not support HTML video.</video>
                      <div className="learn-video-controls">
                        <input className="learn-video-seek" aria-label="Video position" type="range" min="0" max={videoDuration || 100} step="0.1" value={videoDuration ? videoTime : 0} style={{ "--video-progress": `${videoDuration ? (videoTime / videoDuration) * 100 : 0}%` }} onChange={(event) => { const time = Number(event.target.value); setVideoTime(time); if (videoRef.current) videoRef.current.currentTime = time; }} />
                        <div className="learn-video-control-row">
                          <div className="learn-video-control-group">
                            <button type="button" aria-label={playing ? "Pause video" : "Play video"} onClick={togglePlayback}>{playing ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}</button>
                            <button type="button" aria-label={muted ? "Unmute video" : "Mute video"} onClick={() => { const nextMuted = !muted; setMuted(nextMuted); if (videoRef.current) videoRef.current.muted = nextMuted; }}>{muted ? <VolumeX size={19} /> : <Volume2 size={19} />}</button>
                            <span className="learn-video-time">{formatTime(videoTime)} <i>/</i> {formatTime(videoDuration)}</span>
                          </div>
                          <button type="button" aria-label="Fullscreen" onClick={() => playerRef.current?.requestFullscreen?.()}><Maximize size={18} /></button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="learn-player-empty" style={{ backgroundImage: `linear-gradient(135deg, rgba(12,24,48,.91), rgba(29,39,78,.82)), url(${course.image})` }}>
                      <span className="learn-player-empty-icon"><Play size={24} fill="currentColor" /></span>
                      <strong>{activeChapter.video}</strong>
                      <span>This published item does not have a playable video file.</span>
                    </div>
                  )}
                </div>
                <div className="learn-lesson-heading">
                  <div><span className="learn-content-kicker"><Play size={13} /> VIDEO LECTURE</span><h2>{activeChapter.video}</h2><p><Clock3 size={15} /> {activeChapter.duration} <i /> Chapter {activeIndex + 1}: {activeChapter.title}</p></div>
                  <div className="learn-lesson-actions"><button type="button" className="learn-secondary-action" onClick={toggleBookmark} aria-pressed={Boolean(isBookmarked)}><Bookmark size={15} fill={isBookmarked ? "currentColor" : "none"} />{isBookmarked ? "Saved" : "Save bookmark"}</button>{activeChapter.downloadable && activeChapter.videoUrl && <a className="learn-download-link" href={activeChapter.videoUrl} download><Download size={15} /> Download</a>}<button type="button" className={completed[activeIndex] ? "learn-complete is-done" : "learn-complete"} disabled={Boolean(completed[activeIndex])} onClick={() => setCompleted((state) => ({ ...state, [activeIndex]: true }))}>{completed[activeIndex] ? <Check size={17} /> : null}{completed[activeIndex] ? "Completed" : "Mark complete"}</button></div>
                </div>
              </>
            ) : readerOpen ? (
              <article className="learn-reader">
                <div className="learn-reader-toolbar"><button type="button" onClick={() => setReaderOpen(false)}><ArrowLeft size={16} /> All materials</button><span>PDF READER · LESSON {activeIndex + 1}</span><button type="button" aria-label="Close reader" onClick={() => setReaderOpen(false)}><X size={18} /></button></div>
                <div className="learn-reader-heading"><span className="learn-reader-label">{course.title} · Lesson {activeIndex + 1}</span><h2>{activeChapter.title}</h2><p>{activeChapter.text}</p></div>
                {readerError ? <div className="learn-pdf-unavailable"><FileText size={28} /><strong>PDF delivery is unavailable.</strong><span>{readerError}</span><button type="button" onClick={openPdfReader}>Retry</button></div> : readerLoading ? <div className="learn-pdf-unavailable"><FileText size={28} /><strong>Loading PDF…</strong></div> : readerPdfUrl ? <iframe className="learn-pdf-frame" src={`${readerPdfUrl}#toolbar=1&navpanes=0&view=FitH`} title={`${activeChapter.title} PDF reader`} /> : <div className="learn-pdf-unavailable"><FileText size={28} /><strong>This PDF has no readable file URL.</strong><span>Ask your trainer to upload the PDF again.</span></div>}
                <div className="learn-reader-footer"><span><FileText size={16} /> PDF document</span><div>{activeChapter.downloadable && readerPdfUrl && <a href={readerPdfUrl} download><Download size={15} /> Download PDF</a>}<button type="button" disabled={Boolean(completed[activeIndex])} onClick={() => setCompleted((state) => ({ ...state, [activeIndex]: true }))}><Check size={16} /> {completed[activeIndex] ? "Marked as read" : "Mark as read"}</button></div></div>
              </article>
            ) : (
              <div className="learn-ebook-detail">
                <div className="learn-ebook-cover"><div className="learn-book-icon"><BookOpen size={38} /></div><small>{course.category.toUpperCase()}</small><h2>{activeChapter.ebook}</h2><span>{course.title}</span><div className="learn-book-decoration" /></div>
                <div className="learn-ebook-info"><span className="learn-content-kicker"><BookOpen size={14} /> {activeChapter.mediaType === "PDF" ? "PDF READING MATERIAL" : "COURSE MATERIAL"}</span><h2>{activeChapter.ebook}</h2><p>{activeChapter.text}</p><div className="learn-ebook-meta"><span><FileText size={15} /> {activeChapter.mediaType || "Course material"}</span><span><Clock3 size={15} /> {activeChapter.duration || "Self paced"}</span></div><div className="learn-ebook-actions">{activeChapter.mediaType === "PDF" && activeChapter.readerUrl ? <button type="button" className="learn-primary-action" disabled={readerLoading} onClick={openPdfReader}><BookOpen size={17} /> {readerLoading ? "Loading PDF…" : "Read PDF"}</button> : activeChapter.downloadable && activeChapter.ebookUrl ? <a className="learn-primary-action" href={activeChapter.ebookUrl} download><Download size={17} /> Download course file</a> : <span className="learn-material-unavailable">{activeChapter.mediaType === "PDF" ? "PDF file unavailable" : "This file can’t be previewed here."}</span>}{activeChapter.downloadable && activeChapter.mediaType === "PDF" && activeChapter.ebookUrl && <button type="button" className="learn-secondary-action" disabled={readerLoading} onClick={openPdfReader}><Download size={16} /> Open PDF to download</button>}<button type="button" className="learn-secondary-action" onClick={toggleBookmark} aria-pressed={Boolean(isBookmarked)}><Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} /> {isBookmarked ? "Saved" : "Save bookmark"}</button><button type="button" className="learn-secondary-action" disabled={Boolean(completed[activeIndex])} onClick={() => setCompleted((state) => ({ ...state, [activeIndex]: true }))}><Check size={16} /> {completed[activeIndex] ? "Read" : "Mark read"}</button></div></div>
              </div>
            )}

            {!readerOpen && <section className="learn-about"><div><span className="learn-content-kicker">LESSON OVERVIEW</span><h3>{activeChapter.title}</h3></div><p>{activeChapter.text}</p>{activeChapter.addToNotes && <aside className="learn-notes-included"><FileText size={16} /><span><strong>Included in your study notes</strong><small>{activeChapter.text}</small></span></aside>}<div className="learn-chapter-pagination"><button type="button" disabled={activeIndex === 0} onClick={() => goToChapter(activeIndex - 1)}><ChevronLeft size={16} /> Previous lesson</button><button type="button" disabled={activeIndex === course.chapters.length - 1} onClick={() => goToChapter(activeIndex + 1)}>Next lesson <ChevronRight size={16} /></button></div></section>}
          </section>

          <aside className="learn-sidebar">
            <div className="learn-sidebar-heading"><div><span className="learn-content-kicker">YOUR CURRICULUM</span><h2>{mode === "ebook" ? "Reading materials" : "Video lectures"}</h2></div><span className="learn-count">{modeChapters.length}</span></div>
            <label className="learn-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a chapter" /><kbd>/</kbd></label>
            <div className="learn-chapter-list">{visibleChapters.map((chapter) => { const index = course.chapters.indexOf(chapter); return <button type="button" key={chapter.contentId || chapter.title} className={index === activeIndex ? "learn-chapter is-active" : "learn-chapter"} onClick={() => goToChapter(index)}>{mode === "video" ? <span className="learn-video-thumb" style={{ backgroundImage: `linear-gradient(135deg, rgba(20,31,66,.35), rgba(29,38,74,.7)), url(${course.image})` }}><Play size={14} fill="currentColor" /><i>{chapter.duration}</i></span> : <span className={completed[index] ? "learn-chapter-number is-complete" : "learn-chapter-number"}>{completed[index] ? <Check size={14} /> : String(index + 1).padStart(2, "0")}</span>}<span className="learn-chapter-copy"><strong>{chapter.title}</strong><small>{mode === "ebook" ? chapter.ebook : chapter.video}</small>{mode === "ebook" && <em><Clock3 size={12} /> {chapter.duration || "Self paced"}</em>}</span>{completed[index] && mode === "video" ? <Check size={15} className="learn-recommendation-done" /> : <ChevronRight size={15} className="learn-chapter-arrow" />}</button>; })}{visibleChapters.length === 0 && <div className="learn-no-results">{search ? `No lessons match “${search}”.` : `No ${mode === "video" ? "videos" : "reading materials"} available.`}</div>}</div>
            <div className="learn-sidebar-footer"><span>Next up</span><strong>{course.chapters[Math.min(activeIndex + 1, course.chapters.length - 1)].title}</strong><button type="button" onClick={() => goToChapter(Math.min(activeIndex + 1, course.chapters.length - 1))}>Go to next <ArrowRight size={14} /></button></div>
          </aside>
        </div>
      </main>
    </StudentLayout>
  );
}
