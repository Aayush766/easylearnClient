import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { uploadToCloudinary } from "../services/cloudinary";
import { Link } from "react-router-dom";
import {
  BarChart3,
  ArrowDown,
  ArrowUp,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Circle,
  CloudUpload,
  Download,
  Eye,
  ImagePlus,
  FileText,
  Lock,
  Mail,
  MapPin,
  Pencil,
  Play,
  Plus,
  Save,
  Search,
  Trash2,
  Trophy,
  Upload,
  Users,
  X,
} from "lucide-react";
import TrainerLayout from "./TrainerLayout";
import useAuth from "../context/useAuth";
import AssessmentQuestionEditor from "./AssessmentQuestionEditor";
import "./TrainerPages.css";
import "./TrainerCourseManagement.css";
import "./TrainerInteractions.css";
import fullstackThumbnail from "../assets/fullstack.png";
import uiuxThumbnail from "../assets/uiux.png";
import marketingThumbnail from "../assets/marketing.png";
import dataThumbnail from "../assets/dataanalytics.png";
import trainerAvatar from "../assets/student/avatar.png";

const INITIAL_COURSES = [
  { id: "full-stack", name: "Full Stack Web Development", batch: "Batch 2025", learners: 120, lessons: 28, assessments: 6, completion: 92, image: fullstackThumbnail, status: "Published" },
  { id: "ui-ux", name: "UI/UX Design Masterclass", batch: "Batch 2025", learners: 85, lessons: 12, assessments: 3, completion: 85, image: uiuxThumbnail, status: "Published" },
  { id: "digital-marketing", name: "Digital Marketing Essentials", batch: "Batch 2025", learners: 60, lessons: 18, assessments: 4, completion: 78, image: marketingThumbnail, status: "Published" },
  { id: "data-analytics", name: "Data Analytics with Python", batch: "Batch 2025", learners: 48, lessons: 16, assessments: 4, completion: 81, image: dataThumbnail, status: "Published" },
];
const Field = ({ label, children }) => (
  <label className="tp-field">
    <b>{label}</b>
    {children || <input />}
  </label>
);
const Select = ({ label, children, ...props }) => (
  <Field label={label}>
    <select defaultValue="" {...props}>
      <option value="" disabled>
        Select an option
      </option>
      {children}
    </select>
  </Field>
);
const Top = ({ title, copy, actions }) => (
  <header className="tp-top">
    <div>
      <Link to="/trainer">← Back to Dashboard</Link>
      <h1>{title}</h1>
      <p>{copy}</p>
    </div>
    {actions}
  </header>
);
const formatVideoDuration = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "";
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainder = total % 60;
  return [hours, minutes, remainder].map((part) => String(part).padStart(2, "0")).join(":");
};
export function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseError, setCourseError] = useState("");
  const [notice, setNotice] = useState("");
  const [savingOrder, setSavingOrder] = useState(false);
  const [uploadingCourseId, setUploadingCourseId] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [previewModules, setPreviewModules] = useState([]);
  const [previewContent, setPreviewContent] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [contentDraft, setContentDraft] = useState({ title: "", description: "", accessLevel: "ENROLLED", downloadable: false });
  const [savingContent, setSavingContent] = useState(false);

  useEffect(() => {
    let active = true;
    api.get("/api/admin/trainer/dashboard")
      .then((data) => { if (active) setCourses(data.courses || []); })
      .catch((error) => { if (active) setCourseError(error.message || "Could not load your assigned courses."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const imageFor = (course) => {
    if (course.thumbnail?.url) return course.thumbnail.url;
    const search = `${course.slug || ""} ${course.title || ""}`.toLowerCase();
    if (search.includes("design") || search.includes("ui-ux")) return uiuxThumbnail;
    if (search.includes("marketing")) return marketingThumbnail;
    if (search.includes("data")) return dataThumbnail;
    return fullstackThumbnail;
  };
  const moveCourse = async (index, direction) => {
    const nextIndex = index + direction;
    if (savingOrder || nextIndex < 0 || nextIndex >= courses.length) return;
    const previous = courses;
    const next = [...courses];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setCourses(next); setSavingOrder(true); setCourseError(""); setNotice("");
    try {
      await api.patch("/api/courses/display-order", { courseIds: next.map((course) => course._id) });
      setNotice("Course display order saved.");
    } catch (error) { setCourses(previous); setCourseError(error.message || "Could not save course order."); }
    finally { setSavingOrder(false); }
  };
  const attachThumbnail = async (course, file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setCourseError("Choose an image file for the course thumbnail."); return; }
    if (file.size > 8 * 1024 * 1024) { setCourseError("Thumbnail images must be 8 MB or smaller."); return; }
    setUploadingCourseId(course._id); setCourseError(""); setNotice("");
    try {
      const thumbnail = await uploadToCloudinary(file, "prime-easy-learn/course-thumbnails");
      const result = await api.patch(`/api/courses/${course._id}/trainer-details`, { thumbnail: { publicId: thumbnail.publicId, url: thumbnail.url } });
      setCourses((current) => current.map((item) => item._id === course._id ? { ...item, ...result.course } : item));
      setNotice(`${course.title} thumbnail updated.`);
    } catch (error) { setCourseError(error.message || "Could not update the course thumbnail."); }
    finally { setUploadingCourseId(""); }
  };
  const openPreview = async (course) => {
    setSelectedCourse(course); setPreviewModules([]); setPreviewContent([]); setPreviewLoading(true);
    try {
      const [result, firstContentPage] = await Promise.all([
        api.get(`/api/courses/${course._id}`),
        api.get("/api/content", { params: { courseId: course._id, page: 1, limit: 100 } }),
      ]);
      const content = [...(firstContentPage?.items || [])];
      for (let page = 2; page <= Number(firstContentPage?.totalPages || 1); page += 1) {
        const nextPage = await api.get("/api/content", { params: { courseId: course._id, page, limit: 100 } });
        content.push(...(nextPage?.items || []));
      }
      setSelectedCourse(result.course || course);
      setPreviewModules(result.modules || []);
      setPreviewContent(content);
    } catch (error) { setCourseError(error.message || "Could not load course preview."); }
    finally { setPreviewLoading(false); }
  };
  const openContentEditor = (item) => {
    setEditingContent(item);
    setContentDraft({ title: item.title || "", description: item.description || "", accessLevel: item.accessLevel || "ENROLLED", downloadable: Boolean(item.downloadable) });
  };
  const saveContent = async (event) => {
    event.preventDefault();
    if (!editingContent || !contentDraft.title.trim()) return;
    setSavingContent(true); setCourseError("");
    try {
      const result = await api.patch(`/api/content/${editingContent._id}`, { ...contentDraft, title: contentDraft.title.trim(), description: contentDraft.description.trim() });
      setPreviewContent(current => current.map(item => item._id === editingContent._id ? result.content : item));
      setEditingContent(null);
      setNotice("Lesson details saved.");
    } catch (error) { setCourseError(error.message || "Could not update this lesson."); }
    finally { setSavingContent(false); }
  };
  const removeContent = async (item) => {
    if (!window.confirm(`Delete “${item.title}” from this course? Learner progress history will be kept.`)) return;
    setCourseError(""); setNotice("");
    try {
      await api.delete(`/api/content/${item._id}`);
      setPreviewContent(current => current.filter(content => content._id !== item._id));
      setNotice("Lesson removed from the course.");
    } catch (error) { setCourseError(error.message || "Could not delete this lesson."); }
  };

  return (
    <TrainerLayout>
      <div className="trainer-pages">
        <Top title="My Courses" copy="Manage learning content and assessment activities for your assigned courses." actions={<Link className="tp-btn primary" to="/trainer/upload"><Plus /> Upload Content</Link>} />
        <div className="tp-course-order-toolbar"><div><strong>Course display order</strong><span>Use the arrows to choose how courses appear to learners.</span></div><span className="tp-course-total"><BookOpen size={15} /> {courses.length} courses</span></div>
        {courseError && <div className="tp-action-notice tp-error-notice" role="alert">{courseError}<button type="button" aria-label="Dismiss error" onClick={() => setCourseError("")}><X size={15} /></button></div>}
        {notice && <div className="tp-course-notice" role="status"><CheckCircle2 size={16} />{notice}<button type="button" aria-label="Dismiss notice" onClick={() => setNotice("")}><X size={15} /></button></div>}
        {loading ? <div className="tp-card tp-courses-empty">Loading assigned courses…</div> : !courses.length ? <div className="tp-card tp-courses-empty">No courses are assigned to your trainer account yet.</div> : <div className="tp-course-grid">
          {courses.map((course, index) => <article className="tp-course-card tp-course-card--managed" key={course._id}>
            <div className="tp-course-card__cover"><img src={imageFor(course)} alt={`${course.title} thumbnail`} /><span className="tp-course-order-badge">{String(index + 1).padStart(2, "0")}</span><label className="tp-course-thumbnail-action"><ImagePlus size={15} />{uploadingCourseId === course._id ? "Uploading…" : course.thumbnail?.url ? "Change thumbnail" : "Attach thumbnail"}<input type="file" accept="image/*" disabled={Boolean(uploadingCourseId)} aria-label={`Attach thumbnail for ${course.title}`} onChange={(event) => { attachThumbnail(course, event.target.files?.[0]); event.target.value = ""; }} /></label></div>
            <div><span className="tp-status">{course.status === "PUBLISHED" ? "Published" : course.status === "DRAFT" ? "Draft" : course.status}</span><h2>{course.title}</h2><p><CalendarDays /> {course.categoryId?.name || "Assigned course"} <Users /> {course.stats?.learners ?? 0} learners</p>
              <div className="tp-course-summary"><span><b>{course.stats?.lessons ?? 0}</b> Lessons</span><span><b>{course.stats?.assessments ?? 0}</b> Assessments</span><span><b>{course.stats?.completion ?? 0}%</b> Completion</span></div>
              <div className="tp-card-actions"><button type="button" className="tp-course-preview-button" onClick={() => openPreview(course)}><Eye size={14} /> Preview course</button><div className="tp-course-reorder"><button type="button" title="Move course up" aria-label={`Move ${course.title} earlier`} disabled={savingOrder || index === 0} onClick={() => moveCourse(index, -1)}><ArrowUp size={15} /></button><button type="button" title="Move course down" aria-label={`Move ${course.title} later`} disabled={savingOrder || index === courses.length - 1} onClick={() => moveCourse(index, 1)}><ArrowDown size={15} /></button></div></div>
            </div>
          </article>)}
        </div>}
      </div>
      {selectedCourse && <div className="tp-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedCourse(null); }}><section className="tp-result-modal tp-course-preview-modal" role="dialog" aria-modal="true" aria-labelledby="tp-course-preview-title"><button type="button" aria-label="Close course preview" onClick={() => setSelectedCourse(null)}><X size={17} /></button><img className="tp-course-preview-image" src={imageFor(selectedCourse)} alt="" /><span className="tp-status">{selectedCourse.status === "PUBLISHED" ? "Published" : selectedCourse.status}</span><h2 id="tp-course-preview-title">{selectedCourse.title}</h2><p>{selectedCourse.description || "No course description has been added yet."}</p>{previewLoading ? <p>Loading modules and lesson files…</p> : <><h3>Course modules and lesson files</h3>{previewModules.length ? <div className="tp-preview-modules">{previewModules.map((module) => { const items = previewContent.filter((item) => String(item.moduleId?._id || item.moduleId) === String(module._id)); return <section className="tp-preview-module" key={module._id}><header><strong>{module.title}</strong><span>{items.length} {items.length === 1 ? "item" : "items"}</span></header>{items.length ? <ul>{items.map((item) => { const type = item.type || "OTHER"; const Icon = type === "VIDEO" ? Play : FileText; const url = item.file?.url; return <li key={item._id}><Icon size={15} /><span><b>{item.title}</b><small>{type.replaceAll("_", " ")} {item.durationSeconds ? `· ${formatVideoDuration(Number(item.durationSeconds))}` : ""} · {item.status}</small></span><button type="button" className="tp-btn" onClick={() => openContentEditor(item)}>Edit</button><button type="button" className="tp-btn" onClick={() => void removeContent(item)}>Delete</button>{url ? <a href={url} target="_blank" rel="noreferrer">{type === "VIDEO" ? "Open video" : type === "PDF" ? "Open PDF" : "Open file"}</a> : <small>File unavailable</small>}</li>; })}</ul> : <p>No uploaded lessons in this module yet.</p>}</section>; })}</div> : <p>No modules have been added to this course yet.</p>}</>}</section></div>}
      {editingContent && <div className="tp-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget && !savingContent) setEditingContent(null); }}>
        <form className="tp-result-modal" role="dialog" aria-modal="true" aria-labelledby="tp-edit-content-title" onSubmit={saveContent}>
          <button type="button" aria-label="Close lesson editor" disabled={savingContent} onClick={() => setEditingContent(null)}><X size={17} /></button>
          <h2 id="tp-edit-content-title">Edit lesson</h2>
          <Field label="Lesson title"><input required maxLength={180} value={contentDraft.title} onChange={event => setContentDraft(current => ({ ...current, title: event.target.value }))} /></Field>
          <Field label="Description"><textarea maxLength={5000} value={contentDraft.description} onChange={event => setContentDraft(current => ({ ...current, description: event.target.value }))} /></Field>
          <Field label="Access"><select value={contentDraft.accessLevel} onChange={event => setContentDraft(current => ({ ...current, accessLevel: event.target.value }))}><option value="ENROLLED">Enrolled learners</option><option value="FREE">Free preview</option></select></Field>
          <label><input type="checkbox" checked={contentDraft.downloadable} onChange={event => setContentDraft(current => ({ ...current, downloadable: event.target.checked }))} /> Allow downloads</label>
          <div className="tp-card-actions"><button type="button" className="tp-btn" disabled={savingContent} onClick={() => setEditingContent(null)}>Cancel</button><button type="submit" className="tp-btn primary" disabled={savingContent}>{savingContent ? "Saving…" : "Save lesson"}</button></div>
        </form>
      </div>}
    </TrainerLayout>
  );
}export function UploadPage() {
  const ADD_MODULE_OPTION = "__add_module__";
  const [type, setType] = useState("Video");
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoDurationSeconds, setVideoDurationSeconds] = useState(null);
  const [durationLoading, setDurationLoading] = useState(false);
  const [accessLevel, setAccessLevel] = useState("FREE");
  const [downloadable, setDownloadable] = useState(true);
  const [addToNotes, setAddToNotes] = useState(true);
  const [scheduleLater, setScheduleLater] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const [contentTitle, setContentTitle] = useState("");
  const [contentDescription, setContentDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [moduleId, setModuleId] = useState("");
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [addingModule, setAddingModule] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadNotice, setUploadNotice] = useState("");
  const [dragging, setDragging] = useState(false);
  const [filePreview, setFilePreview] = useState("");

  useEffect(() => { api.get("/api/courses").then((result) => {
    const records = result?.items || [];
    setCourses(records);
    if (records.length) setCourseId(records[0]._id);
  }).catch((error) => setUploadNotice(error.message)); }, []);

  useEffect(() => {
    if (!courseId) { setModules([]); setModuleId(""); return; }
    setModules([]);
    setModuleId("");
    setShowAddModule(false);
    api.get(`/api/courses/${courseId}/modules`).then((result) => {
      const records = (result?.modules || []).filter((module) => module.status !== "ARCHIVED");
      setModules(records);
      setModuleId(records[0]?._id || "");
    }).catch((error) => setUploadNotice(error.message));
  }, [courseId]);

  const addModule = async () => {
    const title = newModuleTitle.trim();
    if (!courseId || !title) {
      setUploadNotice("Choose a course and enter a module name.");
      return;
    }
    setAddingModule(true);
    try {
      const order = Math.max(-1, ...modules.map((module) => Number(module.order) || 0)) + 1;
      const result = await api.post(`/api/courses/${courseId}/modules`, { title, order, status: "ACTIVE" });
      const createdModule = result?.module;
      if (!createdModule?._id) throw new Error("The module was saved but could not be added to the list. Refresh and try again.");
      setModules((current) => [...current, createdModule].sort((a, b) => a.order - b.order));
      setModuleId(createdModule._id);
      setNewModuleTitle("");
      setShowAddModule(false);
      setUploadNotice(`Module “${createdModule.title}” added to this course.`);
    } catch (error) {
      setUploadNotice(error.message || "Unable to add this module.");
    } finally {
      setAddingModule(false);
    }
  };

  useEffect(() => {
    if (!selectedFile || type !== "Video") { setFilePreview(""); return undefined; }
    const previewUrl = URL.createObjectURL(selectedFile);
    setFilePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedFile, type]);

  useEffect(() => {
    if (!selectedFile || type !== "Video") {
      setVideoDurationSeconds(null);
      setDurationLoading(false);
      return undefined;
    }

    let active = true;
    const objectUrl = URL.createObjectURL(selectedFile);
    const video = document.createElement("video");
    setVideoDurationSeconds(null);
    setDurationLoading(true);
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      if (!active) return;
      const seconds = video.duration;
      setVideoDurationSeconds(Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds) : null);
      setDurationLoading(false);
    };
    video.onerror = () => {
      if (!active) return;
      setVideoDurationSeconds(null);
      setDurationLoading(false);
    };
    video.src = objectUrl;

    return () => {
      active = false;
      video.onloadedmetadata = null;
      video.onerror = null;
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile, type]);

  const acceptFile = (file) => {
    if (!file) return;
    const allowed = {
      Video: ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"],
      PDF: ["application/pdf"],
      PPT: ["application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"],
      "Other File": [],
    }[type];
    const extension = file.name.split(".").pop().toLowerCase();
    const allowedExtensions = { Video: ["mp4", "mov", "avi", "webm"], PDF: ["pdf"], PPT: ["ppt", "pptx"], "Other File": [] }[type];
    if ((allowed.length || allowedExtensions.length) && !allowed.includes(file.type) && !allowedExtensions.includes(extension)) {
      setUploadNotice(`Choose a supported ${type.toLowerCase()} file.`);
      return;
    }
    if (file.size > 2 * 1024 * 1024 * 1024) {
      setUploadNotice("Files must be 2 GB or smaller.");
      return;
    }
    setSelectedFile(file);
    setUploadNotice("");
  };

  const saveContent = async (publish) => {
    if (publish && !selectedFile) {
      setUploadNotice("Choose a file before publishing this lesson.");
      return;
    }
    if (!moduleId) { setUploadNotice("Select a course module before saving content."); return; }
    if (!contentTitle.trim()) { setUploadNotice("Add a title for this lesson."); return; }
    if (selectedFile && type === "Video" && videoDurationSeconds === null) {
      setUploadNotice(durationLoading ? "Wait while the video duration is detected." : "Could not read this video's duration. Choose a supported video file and try again.");
      return;
    }
    const publishAt = publish && scheduleLater ? new Date(scheduledFor) : null;
    if (publishAt && (!scheduledFor || Number.isNaN(publishAt.getTime()) || publishAt <= new Date())) {
      setUploadNotice("Choose a future date and time to schedule publication.");
      return;
    }
    setSaving(true);
    try {
      let file = undefined;
      if (selectedFile) {
        file = { provider: "CLOUDINARY", ...(await uploadToCloudinary(selectedFile, "prime-easy-learn/course-content")) };
      }
      const records = await api.get("/api/content", { params: { moduleId, limit: 100 } });
      const order = Math.max(0, ...(records.items || []).map((entry) => Number(entry.order) || 0)) + 1;
      const item = await api.post("/api/content", { courseId, moduleId, title: contentTitle.trim(), description: contentDescription.trim(), type: ({ Video: "VIDEO", PDF: "PDF", PPT: "PPT", "Other File": "OTHER" })[type], file, durationSeconds: type === "Video" ? videoDurationSeconds : undefined, accessLevel, addToNotes, downloadable, order, tags: [], status: "DRAFT" });
      if (publish) await api.post(`/api/content/${item.content._id}/publish`, publishAt ? { scheduledFor: publishAt.toISOString() } : {});
      setUploadNotice(publishAt ? `${item.content.title} scheduled for ${publishAt.toLocaleString()}.` : `${item.content.title} saved ${publish ? "and published" : "as a draft"}.`);
      setSelectedFile(null);
    } catch (error) { setUploadNotice(error.message || "Unable to save this lesson."); }
    finally { setSaving(false); }
  };

  return (
    <TrainerLayout>
      <div className="trainer-pages">
        <Top
          title="Upload Content"
          copy="Share your knowledge. Empower more learners."
        />
        {uploadNotice && <div className="tp-action-notice" role="status"><CheckCircle2 size={16} />{uploadNotice}<button type="button" onClick={() => setUploadNotice("")} aria-label="Dismiss message"><X size={15} /></button></div>}
        <div className="tp-split">
          <section className="tp-card tp-upload-main">
            <h2>1. Select Course</h2>
            <div className="tp-three">
              <Field label="Course"><select value={courseId} onChange={(event) => setCourseId(event.target.value)} required><option value="" disabled>Select a course</option>{courses.map((course) => <option value={course._id} key={course._id}>{course.title}</option>)}</select></Field>
              <Field label="Select Module"><select value={showAddModule ? ADD_MODULE_OPTION : moduleId} onChange={(event) => { if (event.target.value === ADD_MODULE_OPTION) { setShowAddModule(true); setNewModuleTitle(""); } else { setShowAddModule(false); setModuleId(event.target.value); } }} disabled={!courseId} required><option value="" disabled>{courseId ? "Select a module" : "Choose a course first"}</option>{modules.map((module) => <option value={module._id} key={module._id}>{module.title}</option>)}<option value={ADD_MODULE_OPTION}>＋ Add a module to this course…</option></select></Field>
              <Field label="Lesson / Topic"><input value={contentTitle} onChange={(event) => setContentTitle(event.target.value)} placeholder="Enter lesson title" /></Field>
            </div>
            {showAddModule && <div className="tp-add-module" role="group" aria-label="Add a module to this course">
              <label htmlFor="new-course-module">New module name</label>
              <input id="new-course-module" value={newModuleTitle} onChange={(event) => setNewModuleTitle(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addModule(); } }} maxLength={180} autoFocus placeholder="e.g. Getting Started" />
              <button type="button" className="tp-btn primary" onClick={addModule} disabled={addingModule || !newModuleTitle.trim()}>{addingModule ? "Adding…" : "Add module"}</button>
              <button type="button" className="tp-btn" onClick={() => { setShowAddModule(false); setNewModuleTitle(""); }}>Cancel</button>
            </div>}
            <h2>2. Content Type</h2>
            <div className="tp-type-tabs">
              {["Video", "PDF", "PPT", "Other File"].map((x) => (
                <button
                  type="button"
                  onClick={() => { setType(x); setSelectedFile(null); }}
                  className={type === x ? "active" : ""}
                  key={x}
                >
                  <FileText /> {x}
                </button>
              ))}
            </div>
            <h2>3. Upload {type}</h2>
            <label className={`tp-drop ${dragging ? "is-dragging" : ""} ${selectedFile ? "has-file" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); acceptFile(event.dataTransfer.files?.[0]); }}>
              <CloudUpload />
              <b>{selectedFile ? selectedFile.name : `Drag and drop your ${type.toLowerCase()} here`}</b>
              {selectedFile ? <span>{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB · Ready to upload</span> : <span>or</span>}
              <em>
                {selectedFile ? "Choose another" : "Choose File"}
                <input type="file" accept={{ Video: "video/mp4,video/quicktime,video/x-msvideo,video/webm", PDF: ".pdf", PPT: ".ppt,.pptx", "Other File": "*/*" }[type]} onChange={(event) => { acceptFile(event.target.files?.[0]); event.target.value = ""; }} />
              </em>
              <small>
                Supported formats: MP4, MOV, AVI, PDF, PPTX | Max file size: 2
                GB
              </small>
            </label>
            {filePreview && <video className="tp-upload-video-preview" src={filePreview} controls preload="metadata" aria-label="Uploaded video preview" />}
            <h2>4. Content Details</h2>
            <div className="tp-details">
              <Field label="Title *">
                <input value={contentTitle} onChange={(event) => setContentTitle(event.target.value)} placeholder="e.g. Introduction to React" />
              </Field>
              <Field label="Tags (comma separated)">
                <input defaultValue="react, javascript, frontend" />
              </Field>
              <Field label="Description *">
                <textarea value={contentDescription} onChange={(event) => setContentDescription(event.target.value)} placeholder="Describe what learners will learn in this lesson." />
              </Field>
              <Select label="Language">
                <option>English</option>
              </Select>
            </div>
          </section>
          <aside className="tp-side">
            <section className="tp-card">
              <h2>Additional Settings</h2>
              <Field label="Video Duration">
                <input value={type === "Video" ? formatVideoDuration(videoDurationSeconds) : ""} placeholder={durationLoading ? "Reading video metadata…" : "Detected from selected video"} readOnly aria-live="polite" />
              </Field>
              <fieldset className="tp-setting-group">
                <legend>Who can access this content?</legend>
                <label><input type="radio" name="content-access" value="FREE" checked={accessLevel === "FREE"} onChange={() => setAccessLevel("FREE")} /> Free for all learners</label>
                <label><input type="radio" name="content-access" value="ENROLLED" checked={accessLevel === "ENROLLED"} onChange={() => setAccessLevel("ENROLLED")} /> Only for enrolled learners</label>
              </fieldset>
              <label className="tp-toggle">Make this content downloadable<input checked={downloadable} onChange={(event) => setDownloadable(event.target.checked)} type="checkbox" /><i /></label>
              <label className="tp-toggle">Add to student notes<input checked={addToNotes} onChange={(event) => setAddToNotes(event.target.checked)} type="checkbox" /><i /></label>
              <label className="tp-toggle">Schedule for later<input checked={scheduleLater} onChange={(event) => setScheduleLater(event.target.checked)} type="checkbox" /><i /></label>
              {scheduleLater && <Field label="Publish date and time"><input type="datetime-local" value={scheduledFor} min={new Date(Date.now() + 60_000 - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16)} onChange={(event) => setScheduledFor(event.target.value)} /></Field>}
            </section>
            <section className="tp-card">
              <h2>Publish</h2>
              <div className="tp-button-row">
                <button type="button" className="tp-btn" disabled={saving} onClick={() => saveContent(false)}>Save as Draft</button>
                <button type="button" className="tp-btn primary" disabled={saving} onClick={() => saveContent(true)}>
                  <CloudUpload /> {saving ? "Saving…" : scheduleLater ? "Schedule Content" : "Publish Content"}
                </button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </TrainerLayout>
  );
}
function QuestionEditor({ questions, onQuestionsChange, questionType, onQuestionTypeChange }) {
  const updateQuestion = (id, text) => onQuestionsChange(questions.map((question) => question.id === id ? { ...question, text } : question));
  const addQuestion = () => onQuestionsChange([...questions, { id: Date.now(), text: "New assessment question", type: questionType, marks: 1 }]);
  return (
    <section className="tp-question-editor">
      <h2>
        Questions{" "}
        <button type="button" className="tp-btn primary" onClick={addQuestion}>
          <Plus /> Add Question
        </button>
      </h2>
      <div className="tp-question-types">
        {["Multiple Choice", "Multiple Select", "True / False", "Descriptive"].map((type) => <button type="button" className={questionType === type ? "active" : ""} key={type} onClick={() => onQuestionTypeChange(type)}>{type}</button>)}
      </div>
      {questions.map((question, i) => (
        <article key={question.id}>
          <i>{i + 1}</i>
          <span>
            <input aria-label={`Question ${i + 1}`} value={question.text} onChange={(event) => updateQuestion(question.id, event.target.value)} />
            <small>{question.type} · {question.marks} mark{question.marks === 1 ? "" : "s"}</small>
          </span>
          <button type="button" className="tp-question-delete" aria-label={`Delete question ${i + 1}`} onClick={() => onQuestionsChange(questions.filter((item) => item.id !== question.id))}><Trash2 size={16} /></button>
        </article>
      ))}
    </section>
  );
}
export function Assessments() {
  const [tab, setTab] = useState("Basic Details");
  const [assessmentType, setAssessmentType] = useState("Post-Assessment");
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [assessmentDescription, setAssessmentDescription] = useState("");
  const [assessmentCourse, setAssessmentCourse] = useState("");
  const [assessmentModule, setAssessmentModule] = useState("");
  const [assessmentCourses, setAssessmentCourses] = useState([]);
  const [assessmentModules, setAssessmentModules] = useState([]);
  const [questionType, setQuestionType] = useState("Multiple Choice");
  const [assessmentSettings, setAssessmentSettings] = useState({ totalMarks: "1", passingMarks: "1", timeLimit: "30", attemptLimit: "1", showResults: true, shuffleQuestions: true, shuffleOptions: true });
  const [savedAssessmentId, setSavedAssessmentId] = useState("");
  const [savingAssessment, setSavingAssessment] = useState(false);
  const updateAssessmentSetting = (key, value) => setAssessmentSettings((current) => ({ ...current, [key]: value }));
  const [questions, setQuestions] = useState([]);
  const [assessmentNotice, setAssessmentNotice] = useState("");
  useEffect(() => { let active = true; api.get("/api/courses").then((result) => { const records = result?.items || []; if (active) { setAssessmentCourses(records); if (records.length) setAssessmentCourse(records[0]._id); } }).catch((error) => { if (active) setAssessmentNotice(error.message); }); return () => { active = false; }; }, []);
  useEffect(() => { let active = true; if (!assessmentCourse) { setAssessmentModules([]); setAssessmentModule(""); return () => { active = false; }; } setAssessmentModules([]); setAssessmentModule(""); api.get(`/api/courses/${assessmentCourse}/modules`).then((result) => { const records = (result?.modules || []).filter((module) => module.status !== "ARCHIVED"); if (active) { setAssessmentModules(records); if (records.length) setAssessmentModule(records[0]._id); } }).catch((error) => { if (active) setAssessmentNotice(error.message); }); return () => { active = false; }; }, [assessmentCourse]);
  const saveAssessment = async (status) => {
    if (!assessmentTitle.trim()) { setAssessmentNotice("Add an assessment title before saving."); setTab("Basic Details"); return; }
    if (!assessmentCourse || !assessmentModule) { setAssessmentNotice("Choose a course and module before saving."); setTab("Basic Details"); return; }
    const totalMarks = Number(assessmentSettings.totalMarks);
    const passingMarks = Number(assessmentSettings.passingMarks);
    if (!Number.isFinite(totalMarks) || totalMarks < 1 || !Number.isFinite(passingMarks) || passingMarks < 0 || passingMarks > totalMarks) { setAssessmentNotice("Enter valid total and passing marks. Passing marks cannot exceed total marks."); setTab("Settings"); return; }
    if (!Number.isInteger(Number(assessmentSettings.attemptLimit)) || Number(assessmentSettings.attemptLimit) < 1 || (assessmentSettings.timeLimit && (!Number.isInteger(Number(assessmentSettings.timeLimit)) || Number(assessmentSettings.timeLimit) < 1))) { setAssessmentNotice("Enter a valid attempt limit and time limit."); setTab("Settings"); return; }
    if (status === "Published" && !questions.length) { setAssessmentNotice("Add at least one question before publishing."); setTab("Questions"); return; }
    if (status === "Published") {
      const incomplete = questions.findIndex((question) => {
        if (!question.text.trim() || !Number.isFinite(Number(question.marks)) || Number(question.marks) < 1) return true;
        if (question.type === "Descriptive") return false;
        const options = question.type === "True / False" ? ["True", "False"] : question.options || [];
        const answers = question.correctAnswers || [];
        return options.filter((option) => option.trim()).length < 2 || !answers.length || answers.some((answer) => !options[answer.charCodeAt(0) - 65]?.trim()) || (question.type !== "Multiple Select" && answers.length !== 1);
      });
      if (incomplete >= 0) { setAssessmentNotice(`Complete question ${incomplete + 1}: add the text, answer choices, correct answer and marks.`); setTab("Questions"); return; }
      if (questions.reduce((sum, question) => sum + Number(question.marks), 0) !== totalMarks) { setAssessmentNotice("Question marks must add up to the Total Marks setting before publishing."); setTab("Settings"); return; }
    }
    setSavingAssessment(true);
    try {
      const payload = { title: assessmentTitle.trim(), description: assessmentDescription.trim(), courseId: assessmentCourse, moduleId: assessmentModule, type: assessmentType === "Pre-Assessment" ? "PRE" : "POST", totalMarks, passingMarks, durationMinutes: assessmentSettings.timeLimit ? Number(assessmentSettings.timeLimit) : undefined, attemptLimit: Number(assessmentSettings.attemptLimit), showResults: assessmentSettings.showResults, shuffleQuestions: assessmentSettings.shuffleQuestions, shuffleOptions: assessmentSettings.shuffleOptions, draftQuestions: status === "Draft" ? questions : [] };
      const saved = savedAssessmentId ? await api.patch(`/api/assessments/${savedAssessmentId}`, payload) : await api.post("/api/assessments", payload);
      const record = saved.assessment;
      setSavedAssessmentId(record._id);
      const questionPayload = questions.map((question, index) => ({ question: question.text.trim(), type: ({ "Multiple Choice": "MCQ", "Multiple Select": "MULTI_SELECT", "True / False": "TRUE_FALSE", Descriptive: "DESCRIPTIVE" })[question.type], options: (question.type === "True / False" ? ["True", "False"] : question.options || []).filter((option) => option.trim()).map((text, optionIndex) => ({ key: String.fromCharCode(65 + optionIndex), text: text.trim() })), correctOptionKeys: question.correctAnswers || [], marks: Number(question.marks), explanation: question.explanation || "", order: index }));
      if (status === "Published") {
        await api.put(`/api/assessments/${record._id}/questions`, { questions: questionPayload });
        await api.post(`/api/assessments/${record._id}/publish`);
      }
      setAssessmentNotice(status === "Published" ? "Assessment published successfully." : "Assessment saved as a draft.");
    } catch (error) { setAssessmentNotice(error.message || "Unable to save the assessment."); }
    finally { setSavingAssessment(false); }
  };
  return (
    <TrainerLayout>
      <div className="trainer-pages">
        <Top
          title="Create Assessment"
          copy="Build quizzes, tests or assignments to evaluate learner understanding."
          actions={
            <div className="tp-button-row">
              <button type="button" className="tp-btn" disabled={savingAssessment} onClick={() => saveAssessment("Draft")}>
                <Save /> Save as Draft
              </button>
              <button type="button" className="tp-btn primary" disabled={savingAssessment} onClick={() => saveAssessment("Published")}>{savingAssessment ? "Saving…" : "Publish Assessment"}</button>
            </div>
          }
        />
        {assessmentNotice && <div className="tp-action-notice" role="status"><CheckCircle2 size={16} />{assessmentNotice}<button type="button" onClick={() => setAssessmentNotice("")} aria-label="Dismiss message"><X size={15} /></button></div>}
        <div className="tp-assessment-course">
          <img
            src={assessmentCourses.find((course) => course._id === assessmentCourse)?.thumbnail?.url
              || INITIAL_COURSES.find((course) => {
                const title = assessmentCourses.find((item) => item._id === assessmentCourse)?.title || "";
                return course.name.toLowerCase().includes(title.toLowerCase())
                  || title.toLowerCase().includes(course.name.toLowerCase());
              })?.image
              || (assessmentCourses.find((course) => course._id === assessmentCourse)?.title?.toLowerCase().includes("python") ? dataThumbnail : fullstackThumbnail)}
            onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = fullstackThumbnail; }}
            alt=""
          />
          <span>
            <b>{assessmentCourses.find((course) => course._id === assessmentCourse)?.title || (assessmentCourses.length ? "Select a course" : "Loading assigned courses…")}</b>
            <small>
              <CalendarDays /> {assessmentModules.find((module) => module._id === assessmentModule)?.title || "Select a module"}
            </small>
          </span>
        </div>
        <div className="tp-assessment-layout">
          <section className="tp-card">
            <nav className="tp-tabs">
              {["Basic Details", "Questions", "Settings", "Preview"].map(
                (x) => (
                  <button
                    onClick={() => setTab(x)}
                    className={tab === x ? "active" : ""}
                    key={x}
                  >
                    {x}
                  </button>
                ),
              )}
            </nav>
            {tab === "Basic Details" ? (
              <>
                <h2>Assessment Details</h2>
                <Field label="Assessment Title *">
                  <input value={assessmentTitle} onChange={(event) => setAssessmentTitle(event.target.value)} />
                </Field>
                <div className="tp-two">
                  <Field label="Course *"><select value={assessmentCourse} onChange={(event) => setAssessmentCourse(event.target.value)} required><option value="" disabled>Select a course</option>{assessmentCourses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}</select></Field>
                  <Field label="Module / Topic *"><select value={assessmentModule} onChange={(event) => setAssessmentModule(event.target.value)} disabled={!assessmentCourse || !assessmentModules.length} required><option value="" disabled>{assessmentModules.length ? "Select a module" : "No modules for this course"}</option>{assessmentModules.map((module) => <option value={module._id} key={module._id}>{module.title}</option>)}</select></Field>
                </div>
                <b className="tp-label">Assessment Type *</b>
                <div className="tp-two tp-radio-boxes">
                  {["Pre-Assessment", "Post-Assessment"].map((type) => (
                    <button type="button" className={assessmentType === type ? "selected" : ""} aria-pressed={assessmentType === type} onClick={() => setAssessmentType(type)} key={type}>
                      {assessmentType === type ? <CheckCircle2 /> : <Circle />}
                      <b>{type}</b>
                      <small>{type === "Pre-Assessment" ? "Evaluate learners before the module" : "Evaluate learners after the module"}</small>
                    </button>
                  ))}
                </div>
                <Field label="Description (Optional)">
                  <textarea value={assessmentDescription} onChange={(event) => setAssessmentDescription(event.target.value)} />
                </Field>
              </>
            ) : tab === "Questions" ? <AssessmentQuestionEditor questions={questions} onQuestionsChange={setQuestions} defaultType={questionType} />
              : tab === "Settings" ? <div className="tp-assessment-settings"><h2>Assessment Settings</h2><p>Set timing, attempts, and result visibility for this assessment.</p><div className="tp-two"><Field label="Total Marks *"><input type="number" min="1" value={assessmentSettings.totalMarks} onChange={(event) => updateAssessmentSetting("totalMarks", event.target.value)} /></Field><Field label="Passing Marks *"><input type="number" min="0" value={assessmentSettings.passingMarks} onChange={(event) => updateAssessmentSetting("passingMarks", event.target.value)} /></Field><Field label="Time Limit (minutes)"><input type="number" min="1" value={assessmentSettings.timeLimit} onChange={(event) => updateAssessmentSetting("timeLimit", event.target.value)} /></Field><Field label="Attempt Limit"><input type="number" min="1" value={assessmentSettings.attemptLimit} onChange={(event) => updateAssessmentSetting("attemptLimit", event.target.value)} /></Field></div></div>
                : <div className="tp-assessment-preview"><span className="tp-status">PREVIEW</span><h2>{assessmentTitle || "Untitled Assessment"}</h2><p>{assessmentDescription || "No description added yet."}</p><div><b>{assessmentCourses.find((course) => course._id === assessmentCourse)?.title || "No course selected"}</b><span>{questions.length} questions · {assessmentSettings.totalMarks} marks · {assessmentSettings.timeLimit || "No time limit"} minutes</span></div><ol>{questions.map((question) => <li key={question.id}>{question.text || "Untitled question"}<small>{question.type} · {question.marks} mark{Number(question.marks) === 1 ? "" : "s"}</small></li>)}</ol></div>}
          </section>
          <aside className="tp-side">
            <section className="tp-card">
              <h2>Assessment Settings</h2>
              <div className="tp-two">
                <Field label="Total Marks *">
                  <input type="number" min="1" value={assessmentSettings.totalMarks} onChange={(event) => updateAssessmentSetting("totalMarks", event.target.value)} />
                </Field>
                <Field label="Passing Marks *">
                  <input type="number" min="0" value={assessmentSettings.passingMarks} onChange={(event) => updateAssessmentSetting("passingMarks", event.target.value)} />
                </Field>
                <Field label="Time Limit">
                  <input type="number" min="1" value={assessmentSettings.timeLimit} onChange={(event) => updateAssessmentSetting("timeLimit", event.target.value)} />
                </Field>
                <Field label="Attempt Limit">
                  <input type="number" min="1" value={assessmentSettings.attemptLimit} onChange={(event) => updateAssessmentSetting("attemptLimit", event.target.value)} />
                </Field>
              </div>
              {[["Show Results to Learners", "showResults"], ["Shuffle Questions", "shuffleQuestions"], ["Shuffle Options", "shuffleOptions"]].map(([label, key]) => (
                <label className="tp-toggle" key={key}>
                  {label}
                  <input checked={assessmentSettings[key]} onChange={(event) => updateAssessmentSetting(key, event.target.checked)} type="checkbox" />
                  <i />
                </label>
              ))}
            </section>
            <section className="tp-card">
              <h2>Question Types</h2>
              <div className="tp-question-types">
                {["Multiple Choice", "Multiple Select", "True / False", "Descriptive"].map((type) => <button type="button" className={questionType === type ? "active" : ""} aria-pressed={questionType === type} key={type} onClick={() => { setQuestionType(type); setTab("Questions"); }}>{type}</button>)}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </TrainerLayout>
  );
}
export function Results() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [reviewQuestions, setReviewQuestions] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resultsError, setResultsError] = useState("");
  const resultsActivityLogged = useRef(false);

  useEffect(() => {
    let active = true;
    Promise.all([api.get("/api/courses"), api.get("/api/modules", { params: { limit: 100 } })])
      .then(([courseResult, moduleResult]) => {
        if (!active) return;
        setCourses(courseResult?.items || []);
        setModules(moduleResult?.items || []);
      })
      .catch((error) => { if (active) setResultsError(error.message || "Could not load course filters."); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setResultsError("");
    const loadAttempts = async () => {
      const rows = [];
      let page = 1;
      let totalPages = 1;
      do {
        const response = await api.get("/api/attempts", { params: { page, limit: 100, courseId: selectedCourse || undefined, moduleId: selectedModule || undefined } });
        rows.push(...(response?.items || []));
        totalPages = Math.max(1, Number(response?.totalPages) || 1);
        page += 1;
      } while (page <= totalPages);
      if (active) {
        setAttempts(rows);
        if (!resultsActivityLogged.current) {
          resultsActivityLogged.current = true;
          api.post("/api/admin/trainer/activity/results-viewed", { courseId: selectedCourse || undefined }).catch(() => {});
        }
      }
    };
    loadAttempts().catch((error) => { if (active) { setAttempts([]); setResultsError(error.message || "Could not load assessment results."); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selectedCourse, selectedModule]);

  const availableModules = modules.filter((module) => !selectedCourse || String(module.courseId?._id || module.courseId) === selectedCourse);
  const visibleRows = attempts.map((attempt) => {
    const assessment = attempt.assessmentId || {};
    const learner = attempt.learnerId || {};
    const totalMarks = Number(attempt.totalMarks || assessment.totalMarks || 0);
    const percentage = Number.isFinite(Number(attempt.percentage)) ? Number(attempt.percentage) : totalMarks ? Math.round(Number(attempt.score || 0) * 100 / totalMarks) : 0;
    const result = attempt.pendingReviewCount > 0 ? "Pending review" : attempt.result === "PASS" ? "Pass" : "Fail";
    return { ...attempt, learnerName: learner.name || "Learner", courseName: assessment.courseId?.title || "Course", moduleName: assessment.moduleId?.title || "Module", assessmentTitle: assessment.title || "Assessment", date: new Date(attempt.submittedAt || attempt.startedAt || attempt.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }), totalMarks, percentage, result };
  }).filter((row) => `${row.learnerName} ${row.courseName} ${row.moduleName} ${row.assessmentTitle} ${row.result}`.toLowerCase().includes(searchQuery.trim().toLowerCase()));

  const totalAttempts = attempts.length;
  const passed = attempts.filter((attempt) => attempt.result === "PASS").length;
  const failed = attempts.filter((attempt) => attempt.result === "FAIL").length;
  const scored = attempts.filter((attempt) => Number.isFinite(Number(attempt.percentage)));
  const average = scored.length ? Math.round(scored.reduce((sum, attempt) => sum + Number(attempt.percentage), 0) / scored.length) : 0;
  const distribution = [0, 0, 0, 0, 0];
  for (const attempt of scored) {
    const score = Number(attempt.percentage);
    const index = score <= 20 ? 0 : score <= 40 ? 1 : score <= 60 ? 2 : score <= 80 ? 3 : 4;
    distribution[index] += 1;
  }
  const rangeLabels = ["0-20%", "21-40%", "41-60%", "61-80%", "81-100%"];
  const rangeColors = ["#ef4652", "#ffb409", "#7f8fae", "#086df1", "#00a96d"];
  let gradientCursor = 0;
  const donutGradient = totalAttempts ? distribution.map((count, index) => { const end = gradientCursor + count * 100 / totalAttempts; const segment = `${rangeColors[index]} ${gradientCursor}% ${end}%`; gradientCursor = end; return segment; }).join(", ") : "#e6edf7 0 100%";
  const exportResults = () => {
    const rows = [["Learner", "Course", "Module", "Assessment", "Attempt Date", "Score", "Percentage", "Result"], ...visibleRows.map((row) => [row.learnerName, row.courseName, row.moduleName, row.assessmentTitle, row.date, `${row.score || 0}/${row.totalMarks}`, `${row.percentage}%`, row.result])];
    const csv = rows.map((values) => values.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "assessment-results.csv"; link.click(); URL.revokeObjectURL(url);
  };
  const viewAttempt = async (attempt) => {
    setSelectedAttempt(attempt);
    setReviewQuestions([]);
    setReviewLoading(true);
    try {
      const response = await api.get(`/api/assessments/${attempt.assessmentId?._id || attempt.assessmentId}`);
      const answers = new Map((attempt.answers || []).map((answer) => [String(answer.questionId?._id || answer.questionId), answer]));
      const review = (response?.questions || []).map((question, index) => {
        const answer = answers.get(String(question._id));
        const keys = answer?.selectedOptionKeys?.length ? answer.selectedOptionKeys : [answer?.selectedOptionKey].filter(Boolean);
        const correctKeys = question.correctOptionKeys?.length ? question.correctOptionKeys : [question.correctOptionKey].filter(Boolean);
        const textFor = (values) => values.map((key) => question.options?.find((option) => option.key === key)?.text || key).join(", ");
        const manual = question.type === "DESCRIPTIVE";
        const isCorrect = !manual && keys.length === correctKeys.length && keys.every((key) => correctKeys.includes(key));
        return { id: question._id, number: index + 1, question: question.question, type: question.type, yourAnswer: manual ? answer?.textResponse || "No response" : textFor(keys) || "Not answered", correctAnswer: manual ? "Manual review required" : textFor(correctKeys), status: manual ? answer?.textResponse ? "Pending review" : "No response" : isCorrect ? "Correct" : "Incorrect", isCorrect, manual };
      });
      setReviewQuestions(review);
    } catch (error) {
      setReviewQuestions([{ id: "error", question: error.message || "Could not load answer review.", status: "Unavailable", manual: true, yourAnswer: "", correctAnswer: "" }]);
    } finally { setReviewLoading(false); }
  };

  return (
    <TrainerLayout>
      <div className="trainer-pages">
        <Top title="Assessment Results" copy="View and analyze learner performance for your assessments." />
        <div className="tp-filter">
          <Field label="Course"><select value={selectedCourse} onChange={(event) => { setSelectedCourse(event.target.value); setSelectedModule(""); }}><option value="">All courses</option>{courses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}</select></Field>
          <Field label="Module / Topic"><select value={selectedModule} onChange={(event) => setSelectedModule(event.target.value)}><option value="">All modules</option>{availableModules.map((module) => <option key={module._id} value={module._id}>{module.title}</option>)}</select></Field>
        </div>
        {resultsError && <div className="tp-action-notice" role="alert">{resultsError}</div>}
        <div className="tp-result-stats">
          {[[Users, totalAttempts, "Total Attempts"], [CheckCircle2, passed, "Passed"], [Trash2, failed, "Failed"], [Trophy, `${average}%`, "Average Score"]].map(([Icon, value, label]) => <article key={label}><Icon /><span><b>{value}</b><small>{label}</small></span></article>)}
        </div>
        <div className="tp-results-grid">
          <section className="tp-card tp-table-card">
            <header><h2>Learner Results <small>({visibleRows.length})</small></h2><button type="button" className="tp-btn" onClick={exportResults} disabled={!visibleRows.length}><Download /> Export Results</button></header>
            <label className="tp-table-search"><Search /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search learner, course, module or assessment" /></label>
            <table><thead><tr><th>#</th><th>Learner Name</th><th>Attempt Date</th><th>Score</th><th>Percentage</th><th>Result</th><th /></tr></thead>
              <tbody>{visibleRows.map((row, index) => <tr key={row._id}><td>{index + 1}</td><td>{row.learnerName}<small className="tp-result-course-name">{row.courseName} · {row.assessmentTitle}</small></td><td>{row.date}</td><td>{row.score ?? 0}/{row.totalMarks}</td><td>{row.percentage}%</td><td><span className={`tp-pill ${row.result === "Pass" ? "pass" : row.result === "Fail" ? "fail" : "pending"}`}>{row.result}</span></td><td><button type="button" className="tp-result-view" aria-label={`Review ${row.learnerName} attempt`} onClick={() => viewAttempt(row)}><Eye size={17} /></button></td></tr>)}
                {!visibleRows.length && <tr><td className="tp-results-empty" colSpan="7">{loading ? "Loading assessment results…" : "No learner attempts match these filters."}</td></tr>}
              </tbody>
            </table>
          </section>
          <aside className="tp-result-side">
            <section className="tp-card"><h2>Performance Overview</h2><div className="tp-chart">{distribution.map((count, index) => <i key={rangeLabels[index]} style={{ height: `${totalAttempts ? Math.max(4, count * 100 / Math.max(...distribution, 1)) : 4}%`, background: rangeColors[index] }}><small>{rangeLabels[index]}</small></i>)}</div></section>
            <section className="tp-card"><h2>Score Distribution</h2><div className="tp-donut" style={{ background: `conic-gradient(${donutGradient})` }}><b>{totalAttempts}<small>Attempts</small></b></div><div className="tp-legend tp-distribution-legend">{distribution.map((count, index) => <span key={rangeLabels[index]}><i style={{ background: rangeColors[index] }} />{rangeLabels[index]} {totalAttempts ? Math.round(count * 100 / totalAttempts) : 0}%</span>)}</div></section>
          </aside>
        </div>
      </div>
      {selectedAttempt && <div className="tp-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedAttempt(null); }}><section className="tp-result-modal tp-result-review" role="dialog" aria-modal="true" aria-labelledby="tp-result-review-title"><button type="button" aria-label="Close result details" onClick={() => setSelectedAttempt(null)}><X size={17} /></button><span className={`tp-pill ${selectedAttempt.result === "PASS" ? "pass" : selectedAttempt.result === "FAIL" ? "fail" : "pending"}`}>{selectedAttempt.pendingReviewCount ? "Pending review" : selectedAttempt.result || selectedAttempt.status}</span><h2 id="tp-result-review-title">{selectedAttempt.learnerId?.name || "Learner"}</h2><p>{selectedAttempt.assessmentId?.title} · {selectedAttempt.assessmentId?.courseId?.title}</p><div className="tp-review-summary"><strong>{selectedAttempt.percentage ?? 0}%</strong><span>{selectedAttempt.score ?? 0} out of {selectedAttempt.totalMarks ?? selectedAttempt.assessmentId?.totalMarks} marks · Attempted {new Date(selectedAttempt.submittedAt || selectedAttempt.createdAt).toLocaleString()}</span></div><h3>Answer review</h3>{reviewLoading ? <p>Loading answers…</p> : <ol className="tp-review-questions">{reviewQuestions.map((item) => <li className={item.manual ? "is-pending" : item.isCorrect ? "is-correct" : "is-incorrect"} key={item.id}><b>{item.number}. {item.question}</b><span><small>Student answer</small>{item.yourAnswer}</span><span><small>{item.manual ? "Grading" : "Correct answer"}</small>{item.correctAnswer}</span><em>{item.status}</em></li>)}</ol>}</section></div>}
    </TrainerLayout>
  );
}export function Profile() {
  const { user, setUser } = useAuth();
  const initializedUserId = useRef(null);
  const [profileTab, setProfileTab] = useState("Personal Information");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showPublicPreview, setShowPublicPreview] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(user?.profileImage?.url || trainerAvatar);
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  const [passwordValues, setPasswordValues] = useState(["", "", ""]);
  const [profile, setProfile] = useState(() => ({
    name: user?.name || "", gender: user?.gender || "", email: user?.email || "", phone: user?.phone || "",
    location: user?.profile?.location || "", address: user?.profile?.address || "",
    dateOfBirth: user?.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth).toISOString().slice(0, 10) : "",
    bio: user?.profile?.bio || "", specialization: user?.specialization || "",
    emailNotifications: user?.notificationPreferences?.email ?? true,
    platformNotifications: user?.notificationPreferences?.inApp ?? true,
  }));

  useEffect(() => {
    if (!user) return;
    if (initializedUserId.current === user._id) return;
    initializedUserId.current = user._id;
    setProfile({
      name: user.name || "", gender: user.gender || "", email: user.email || "", phone: user.phone || "",
      location: user.profile?.location || "", address: user.profile?.address || "",
      dateOfBirth: user.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth).toISOString().slice(0, 10) : "",
      bio: user.profile?.bio || "", specialization: user.specialization || "",
      emailNotifications: user.notificationPreferences?.email ?? true,
      platformNotifications: user.notificationPreferences?.inApp ?? true,
    });
    setProfilePhoto(user.profileImage?.url || trainerAvatar);
    setProfileImage(user.profileImage || null);
  }, [user]);

  useEffect(() => {
    let active = true;
    api.get("/api/admin/trainer/dashboard").then((data) => { if (active) setDashboard(data.summary); })
      .catch((error) => { if (active) setProfileError(error.message || "Could not load trainer statistics."); });
    return () => { active = false; };
  }, []);

  const updateField = (key, value) => setProfile((current) => ({ ...current, [key]: value }));
  const saveProfile = async () => {
    if (!profile.name.trim()) { setProfileError("Full name is required."); return; }
    setSaving(true); setProfileError(""); setProfileMessage("");
    try {
      const result = await api.patch(`/api/users/${user._id}`, {
        name: profile.name.trim(), gender: profile.gender.trim(), phone: profile.phone.trim(), specialization: profile.specialization.trim(),
        profile: { location: profile.location.trim(), address: profile.address.trim(), dateOfBirth: profile.dateOfBirth || null, bio: profile.bio.trim() },
        profileImage, notificationPreferences: { email: profile.emailNotifications, inApp: profile.platformNotifications },
      });
      setUser(result.user);
      setProfileMessage("Your profile changes were saved.");
    } catch (error) { setProfileError(error.message || "Could not save profile changes."); }
    finally { setSaving(false); }
  };
  const cancelProfile = () => {
    setProfile({
      name: user?.name || "", gender: user?.gender || "", email: user?.email || "", phone: user?.phone || "",
      location: user?.profile?.location || "", address: user?.profile?.address || "",
      dateOfBirth: user?.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth).toISOString().slice(0, 10) : "",
      bio: user?.profile?.bio || "", specialization: user?.specialization || "",
      emailNotifications: user?.notificationPreferences?.email ?? true,
      platformNotifications: user?.notificationPreferences?.inApp ?? true,
    });
    setProfilePhoto(user?.profileImage?.url || trainerAvatar); setProfileImage(user?.profileImage || null);
    setProfileError(""); setProfileMessage("Unsaved changes were discarded.");
  };
  const updatePhoto = async (file) => {
    if (!file) return;
    if (!(["image/jpeg", "image/png"].includes(file.type)) || file.size > 2 * 1024 * 1024) { setProfileError("Choose a JPG or PNG image under 2 MB."); return; }
    setUploadingPhoto(true); setProfileError(""); setProfileMessage("");
    try {
      const image = await uploadToCloudinary(file, "prime-easy-learn/profiles");
      setProfilePhoto(image.url);
      setProfileImage({ publicId: image.publicId, url: image.url });
      const result = await api.patch(`/api/users/${user._id}`, { profileImage: { publicId: image.publicId, url: image.url } });
      setUser(result.user);
      setProfileImage(result.user.profileImage || { publicId: image.publicId, url: image.url });
      setProfilePhoto(result.user.profileImage?.url || image.url);
      setProfileMessage("Your profile photo was saved.");
    } catch (error) { setProfileError(error.message || "Could not upload the profile photo."); }
    finally { setUploadingPhoto(false); }
  };
  const updatePassword = async () => {
    if (passwordValues.some((value) => !value)) { setProfileError("Fill in all password fields to update your password."); return; }
    if (passwordValues[1].length < 8) { setProfileError("New password must be at least 8 characters."); return; }
    if (passwordValues[1] !== passwordValues[2]) { setProfileError("New password and confirmation do not match."); return; }
    setSaving(true); setProfileError(""); setProfileMessage("");
    try {
      await api.post("/api/auth/change-password", { currentPassword: passwordValues[0], newPassword: passwordValues[1] });
      setPasswordValues(["", "", ""]); setProfileMessage("Password updated successfully.");
    } catch (error) { setProfileError(error.message || "Could not update password."); }
    finally { setSaving(false); }
  };

  const fullName = profile.name || "Trainer";
  const assignedCourses = dashboard?.assignedCourses ?? 0;
  const totalLearners = dashboard?.learners ?? 0;
  const averageScore = dashboard?.averageScore;
  return (
    <TrainerLayout>
      <div className="trainer-pages">
        <Top title="My Profile" copy="Manage your personal information, preferences, and account settings." actions={<button type="button" className="tp-btn" onClick={() => setShowPublicPreview(true)}><Eye /> View Public Profile</button>} />
        {profileError && <div className="tp-action-notice tp-error-notice" role="alert">{profileError}<button type="button" onClick={() => setProfileError("")} aria-label="Dismiss error"><X size={15} /></button></div>}
        {profileMessage && <div className="tp-action-notice" role="status"><CheckCircle2 size={16} />{profileMessage}<button type="button" onClick={() => setProfileMessage("")} aria-label="Dismiss message"><X size={15} /></button></div>}
        <section className="tp-profile-hero">
          <img src={profilePhoto} alt={`${fullName} profile`} />
          <div><h2>{fullName} <span>{user?.status || "Active"}</span></h2><p>{user?.role === "TRAINER" ? "Trainer" : user?.role || "Trainer"}{profile.specialization ? ` | ${profile.specialization}` : ""}</p><small><Mail /> {profile.email} {profile.location && <><MapPin /> {profile.location}</>}</small></div>
          <div className="tp-profile-numbers"><span><BookOpen /><b>{dashboard ? assignedCourses : "—"}</b>Assigned Courses</span><span><Users /><b>{dashboard ? totalLearners : "—"}</b>Total Learners</span><span><Trophy /><b>{dashboard ? `${averageScore ?? 0}%` : "—"}</b>Average Score</span></div>
        </section>
        <div className="tp-profile-grid">
          <section className="tp-card">
            <nav className="tp-tabs">{["Personal Information", "Professional Details", "Preferences"].map((tab) => <button type="button" className={profileTab === tab ? "active" : ""} key={tab} onClick={() => setProfileTab(tab)}>{tab}</button>)}</nav>
            {profileTab === "Personal Information" && <><h2>{profileTab}</h2><p>Keep your personal details up to date.</p><div className="tp-two">
              <Field label="Full Name *"><input value={profile.name} autoComplete="name" onChange={(event) => updateField("name", event.target.value)} required /></Field>
              <Select label="Gender" value={profile.gender} onChange={(event) => updateField("gender", event.target.value)}><option value="">Select an option</option>{["Female", "Male", "Non-binary", "Prefer not to say", "Other"].map((value) => <option key={value}>{value}</option>)}</Select>
              <Field label="Email Address *"><input type="email" value={profile.email} readOnly /></Field>
              <Field label="Location"><input value={profile.location} autoComplete="address-level2" onChange={(event) => updateField("location", event.target.value)} /></Field>
              <Field label="Phone Number"><input type="tel" value={profile.phone} autoComplete="tel" onChange={(event) => updateField("phone", event.target.value)} /></Field>
              <Field label="Date of Birth"><input type="date" value={profile.dateOfBirth} onChange={(event) => updateField("dateOfBirth", event.target.value)} /></Field>
              <Field label="Address"><textarea value={profile.address} onChange={(event) => updateField("address", event.target.value)} /></Field>
              <Field label="Bio"><textarea value={profile.bio} onChange={(event) => updateField("bio", event.target.value)} /></Field>
            </div></>}
            {profileTab === "Professional Details" && <><h2>{profileTab}</h2><p>Update the professional information learners see about you.</p><div className="tp-two"><Field label="Professional Title"><input value={profile.specialization} placeholder="Subject matter expert" onChange={(event) => updateField("specialization", event.target.value)} /></Field><Field label="Account Role"><input value={user?.role || "Trainer"} readOnly /></Field><Field label="Assigned Courses"><input value={dashboard ? assignedCourses : "Loading…"} readOnly /></Field><Field label="Learners Across Courses"><input value={dashboard ? totalLearners : "Loading…"} readOnly /></Field><Field label="Average Assessment Score"><input value={dashboard ? `${dashboard.averageScore ?? 0}%` : "Loading…"} readOnly /></Field></div></>}
            {profileTab === "Preferences" && <><h2>{profileTab}</h2><p>Choose which account notifications you receive.</p><label className="tp-toggle">Email Notifications<input type="checkbox" checked={profile.emailNotifications} onChange={(event) => updateField("emailNotifications", event.target.checked)} /><i /></label><label className="tp-toggle">Platform Notifications<input type="checkbox" checked={profile.platformNotifications} onChange={(event) => updateField("platformNotifications", event.target.checked)} /><i /></label></>}
            <div className="tp-button-row end"><button type="button" className="tp-btn" onClick={cancelProfile} disabled={saving}>Cancel</button><button type="button" className="tp-btn primary" onClick={saveProfile} disabled={saving || uploadingPhoto}><Save /> {saving ? "Saving…" : "Save Changes"}</button></div>
          </section>
          <aside className="tp-side">
            <section className="tp-card tp-photo"><h2>Profile Photo</h2><img src={profilePhoto} alt={`${fullName} profile preview`} /><p>Upload a new profile photo<br /><small>JPG, PNG (Max 2 MB)</small></p><label className="tp-btn tp-photo-upload"><Upload /> {uploadingPhoto ? "Uploading…" : "Change Photo"}<input type="file" accept="image/png,image/jpeg" disabled={uploadingPhoto} onChange={(event) => { updatePhoto(event.target.files?.[0]); event.target.value = ""; }} /></label></section>
            <section className="tp-card"><h2><Lock /> Change Password</h2>{["Current Password", "New Password", "Confirm New Password"].map((label, index) => <Field key={label} label={label}><input value={passwordValues[index]} onChange={(event) => setPasswordValues((values) => values.map((value, position) => position === index ? event.target.value : value))} placeholder={`Enter ${label.toLowerCase()}`} type="password" autoComplete={index === 0 ? "current-password" : "new-password"} /></Field>)}<button type="button" className="tp-btn primary full" onClick={updatePassword} disabled={saving}>Update Password</button></section>
          </aside>
        </div>
      </div>
      {showPublicPreview && <div className="tp-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowPublicPreview(false); }}><section className="tp-result-modal tp-public-profile-preview" role="dialog" aria-modal="true" aria-labelledby="tp-public-profile-title"><button type="button" aria-label="Close public profile preview" onClick={() => setShowPublicPreview(false)}><X size={17} /></button><img src={profilePhoto} alt="" /><h2 id="tp-public-profile-title">{fullName}</h2><p>{profile.specialization || "Trainer"}</p>{profile.bio && <p>{profile.bio}</p>}<small>{profile.location} {dashboard ? `· ${assignedCourses} courses · ${totalLearners} learners` : ""}</small></section></div>}
    </TrainerLayout>
  );
}export function Support() {
  return (
    <TrainerLayout>
      <div className="trainer-pages">
        <Top
          title="Help & Support"
          copy="Find answers or contact the Prime Easy Learn support team."
        />
        <div className="tp-help-grid">
          {[
            [
              "Course & Content Help",
              "Guidance for uploading and organizing your course material.",
              BookOpen,
            ],
            [
              "Assessment Help",
              "Create, publish, and review learner assessments.",
              FileText,
            ],
            [
              "Reports & Results",
              "Understand performance analytics and exported reports.",
              BarChart3,
            ],
            [
              "Contact Support",
              "Our team is ready to help with your account.",
              Mail,
            ],
          ].map(([a, b, Icon]) => (
            <article className="tp-card" key={a}>
              <Icon />
              <h2>{a}</h2>
              <p>{b}</p>
              {a === "Contact Support" ? <a className="tp-btn" href="mailto:support@primeeasylearn.com?subject=Trainer%20support">Contact support</a> : <Link className="tp-btn" to={a.includes("Assessment") ? "/trainer/assessments" : a.includes("Reports") ? "/trainer/results" : "/trainer/upload"}>Open {a.includes("Assessment") ? "assessments" : a.includes("Reports") ? "results" : "content"}</Link>}
            </article>
          ))}
        </div>
      </div>
    </TrainerLayout>
  );
}
