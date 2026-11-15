import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  BookOpen,
  Bookmark,
  CircleHelp,
  FileBadge2,
  FileText,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Search,
  ChevronDown,
  GraduationCap,
  LogOut,
  Sparkles,
  UserRound,
  RefreshCw,
} from "lucide-react";
import api from "../services/api";
import "./StudentLayout.css";
import logo from "../public/assets/student/logo.jpeg";
import studentAvatar from "../assets/student/avatar.png";
import useAuth from "../context/useAuth";
import "./StudentSearch.css";
import "./StudentNotifications.css";

const SEARCH_DESTINATIONS = [
  { label: "Dashboard", detail: "Your learning overview", keywords: "home progress", to: "/student" },
  { label: "My Courses", detail: "Continue a course or browse chapters", keywords: "course learning class", to: "/student/courses" },
  { label: "Full Stack Web Development", detail: "Course · Web Development", keywords: "react javascript html web", to: "/student/courses/full-stack" },
  { label: "UI/UX Design Masterclass", detail: "Course · Design", keywords: "figma ux ui design", to: "/student/courses/ui-ux" },
  { label: "Digital Marketing Essentials", detail: "Course · Marketing", keywords: "seo google ads social marketing", to: "/student/courses/digital-marketing" },
  { label: "Data Analytics with Python", detail: "Course · Data Science", keywords: "python pandas analytics data", to: "/student/courses/data-analytics" },
  { label: "Assessments", detail: "Tests and quizzes", keywords: "quiz exam test assessment", to: "/student/assessments" },
  { label: "Certificates", detail: "Credentials and awards", keywords: "certificate badge award", to: "/student/certificates" },
  { label: "My Progress", detail: "Learning analytics and badges", keywords: "progress analytics graph score", to: "/student/progress" },
  { label: "Messages", detail: "Your course conversations", keywords: "message chat instructor", to: "/student/messages" },
  { label: "Help & Support", detail: "FAQs and learner support", keywords: "help support faq", to: "/student/support" },
];

const STUDENT_NAVIGATION = [
  { label: "Dashboard", path: "/student", icon: LayoutDashboard, end: true },
  { label: "My Courses", path: "/student/courses", icon: BookOpen },
  { label: "Assessments", path: "/student/assessments", icon: FileText },
  { label: "Certificates", path: "/student/certificates", icon: FileBadge2 },
  { label: "My Progress", path: "/student/progress", icon: LayoutDashboard },
  { label: "Bookmarks", path: "/student/bookmarks", icon: Bookmark },
  { label: "Messages", path: "/student/messages", icon: MessageSquare },
  { label: "Help & Support", path: "/student/support", icon: CircleHelp },
  { label: "Profile", path: "/student/profile", icon: UserRound },
];

function notificationDestination(notification) {
  if (notification.metadata?.path) return notification.metadata.path;
  const type = String(notification.type || "").toUpperCase();
  if (type.includes("MESSAGE")) return "/student/messages";
  if (type.includes("ASSESS")) return "/student/assessments";
  if (type.includes("CERT")) return "/student/certificates";
  if (type.includes("SUPPORT")) return "/student/support";
  if (notification.metadata?.courseId) return `/student/courses/${notification.metadata.courseId}`;
  return "/student";
}
function notificationIcon(type) {
  const key = String(type || "").toUpperCase();
  if (key.includes("MESSAGE")) return MessageSquare;
  if (key.includes("ASSESS")) return FileText;
  if (key.includes("CERT")) return FileBadge2;
  if (key.includes("COURSE") || key.includes("LESSON")) return BookOpen;
  return Bell;
}
function notificationTime(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function StudentBrand() {
  return (
    <Link className="student-layout__brand" to="/student">
      <div className="student-layout__logo-wrapper">
        <img src={logo} alt="Prime Easy Learn Training Institute" />
      </div>
    </Link>
  );
}

function StudentSidebar({ open, onClose }) {
  const { logout } = useAuth();
  return (
    <aside className={`student-layout__sidebar${open ? " is-open" : ""}`}>
      <StudentBrand />

      <nav className="student-layout__navigation" aria-label="Student navigation">
        {STUDENT_NAVIGATION.map(({ label, path, icon: Icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `student-layout__nav-link${isActive ? " is-active" : ""}`
            }
          >
            <Icon size={19} strokeWidth={1.85} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <Link className="student-layout__nav-link student-layout__logout" to="/login/student" onClick={() => { onClose(); void logout(); }}>
        <LogOut size={19} strokeWidth={1.85} />
        <span>Log out</span>
      </Link>

      <div className="student-layout__sidebar-promo" aria-hidden="true">
        <div className="student-layout__promo-badge">
          <Sparkles size={13} />
          <span>Learning Hub</span>
        </div>
        <GraduationCap size={44} strokeWidth={1.5} className="student-layout__promo-icon" />
        <strong>
          Keep Learning
          <br />
          Keep Growing
        </strong>
        <i className="student-layout__promo-accent" />
        <span>
          “Better Skills
          <br />
          A Brighter You”
        </span>
      </div>
    </aside>
  );
}

function StudentHeader({ onMenu }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [courseSearchItems, setCourseSearchItems] = useState([]);
  const profileName = user?.name || "Aayush Kumar";
  const profilePhoto = user?.profileImage?.url || localStorage.getItem("student-profile-picture") || studentAvatar;
  const loadNotifications = async () => {
    setNotificationsLoading(true);
    try { const result = await api.get("/api/learner/notifications", { params: { limit: 20 } }); setNotifications(result?.items || []); }
    catch { setNotifications([]); }
    finally { setNotificationsLoading(false); }
  };
  useEffect(() => { loadNotifications(); const timer = window.setInterval(loadNotifications, 60000); return () => window.clearInterval(timer); }, []);
  useEffect(() => { let active = true; api.get("/api/learner/my-courses").then((result) => { if (!active) return; setCourseSearchItems((result?.courses || []).map((entry) => { const course = entry.enrollment?.courseId || entry.courseId || {}; return { label: course.title || "Course", detail: course.categoryId?.name ? `Course · ${course.categoryId.name}` : "Enrolled course", keywords: `${course.description || ""} ${course.categoryId?.name || ""}`, to: `/student/courses/${course._id || course.id}` }; })); }).catch(() => { if (active) setCourseSearchItems([]); }); return () => { active = false; }; }, []);
  const searchMatches = searchQuery.trim()
    ? [...courseSearchItems, ...SEARCH_DESTINATIONS.filter((item) => !item.detail.startsWith("Course"))].filter((item) => `${item.label} ${item.detail} ${item.keywords}`.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : [];
  const runSearch = () => {
    if (searchMatches[0]) {
      navigate(searchMatches[0].to);
      setSearchQuery("");
    }
  };
  const unreadCount = notifications.filter((item) => !item.read).length;
  const markAllRead = async () => { try { await api.patch("/api/learner/notifications/read-all", {}); setNotifications((items) => items.map((item) => ({ ...item, read: true }))); } catch { loadNotifications(); } };
  const openNotification = async (item) => {
    if (!item.read) { try { await api.patch(`/api/learner/notifications/${item._id}/read`, {}); setNotifications((items) => items.map((notification) => notification._id === item._id ? { ...notification, read: true } : notification)); } catch { /* Keep the notification available if marking it read fails. */ } }
    setShowNotifications(false); navigate(notificationDestination(item));
  };
  return (
    <header className="student-layout__header">
      <button
        type="button"
        className="student-layout__mobile-menu"
        onClick={onMenu}
        aria-label="Open student navigation"
      >
        <Menu size={21} />
      </button>

      <label className="student-layout__search">
        <Search size={18} aria-hidden="true" />
        <input
          type="search"
          placeholder="Search for your courses, lessons, or topics..."
          aria-label="Search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") { event.preventDefault(); runSearch(); }
            if (event.key === "Escape") setSearchQuery("");
          }}
        />
        <kbd className="student-layout__search-shortcut">⌘K</kbd>
      </label>

      {searchQuery.trim() && (
        <div className="student-layout__search-results" role="listbox" aria-label="Search suggestions">
          {searchMatches.length ? searchMatches.slice(0, 6).map((result) => (
            <button type="button" role="option" key={result.to} onClick={() => { navigate(result.to); setSearchQuery(""); }}>
              <span><strong>{result.label}</strong><small>{result.detail}</small></span>
              <Search size={14} />
            </button>
          )) : <p>No matching courses or pages. Try “Python”, “quiz”, or “messages”.</p>}
        </div>
      )}

      <div className="student-layout__account">
        <div className="student-notification-wrap">
          <button
            type="button"
            className="student-layout__notification"
            aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
            aria-expanded={showNotifications}
            aria-haspopup="dialog"
            onClick={() => setShowNotifications((value) => { const next = !value; if (next) loadNotifications(); return next; })}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="student-layout__notification-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>}
          </button>

          {showNotifications && <section className="student-notification-menu" role="dialog" aria-label="Student notifications"><header className="student-notification-menu__header"><span><b>Notifications</b><small>{unreadCount ? `${unreadCount} unread` : "You're all caught up"}</small></span><span className="student-notification-actions"><button type="button" aria-label="Refresh notifications" title="Refresh" disabled={notificationsLoading} onClick={loadNotifications}><RefreshCw size={14} /></button>{unreadCount > 0 && <button type="button" onClick={markAllRead}>Mark all read</button>}</span></header>{notificationsLoading && !notifications.length ? <p className="student-notification-empty" role="status">Loading notifications…</p> : notifications.length ? <div className="student-notification-list">{notifications.map((item) => { const Icon = notificationIcon(item.type); return <button type="button" className={`student-notification-item${item.read ? " is-read" : " is-unread"}`} key={item._id} onClick={() => openNotification(item)}><span className="student-notification-icon"><Icon size={16} /></span><span className="student-notification-copy"><b>{item.title}</b><small>{item.message}</small><time>{notificationTime(item.createdAt)}</time></span>{!item.read && <i aria-label="Unread" />}</button>; })}</div> : <p className="student-notification-empty">No notifications yet.</p>}</section>}
        </div>

        <span className="student-layout__divider" aria-hidden="true" />

        <Link to="/student/profile" className="student-layout__profile-trigger">
          <div className="student-layout__avatar-wrapper">
            <img
              src={profilePhoto}
              alt={`${profileName || "Student"} profile`}
              className="student-layout__avatar"
            />
            <span className="student-layout__status-dot" />
          </div>

          <div className="student-layout__identity">
            <strong>{profileName}</strong>
            <small>Pro Student</small>
          </div>

          <ChevronDown size={16} className="student-layout__chevron" />
        </Link>
      </div>
    </header>
  );
}

export default function StudentLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="student-layout">
      {sidebarOpen && (
        <button
          type="button"
          className="student-layout__backdrop"
          onClick={closeSidebar}
          aria-label="Close student navigation"
        />
      )}

      <StudentSidebar open={sidebarOpen} onClose={closeSidebar} />

      <div className="student-layout__content">
        <StudentHeader onMenu={() => setSidebarOpen(true)} />
        <main className="student-layout__page">{children}</main>
      </div>
    </div>
  );
}
