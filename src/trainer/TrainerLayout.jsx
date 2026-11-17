import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  BookOpen,
  ChartNoAxesColumnIncreasing,
  CircleHelp,
  ClipboardList,
  ClipboardCheck,
  CloudUpload,
  Clock3,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  UserRound,
  ChevronDown,
  GraduationCap,
  X,
  RefreshCw,
} from "lucide-react";
import api from "../services/api";
import "./TrainerLayout.css";
import "./TrainerLayoutPolish.css";
import "./TrainerNotifications.css";
import logo from "../public/assets/student/logo.jpeg";
import trainerAvatar from "../assets/student/avatar.png";
import useAuth from "../context/useAuth";
import useBranding from "../context/BrandingContext";

const navigation = [
  ["Dashboard", "/trainer", LayoutDashboard, true],
  ["Recent Activity", "/trainer/activity", Clock3],
  ["Attendance", "/trainer/attendance", ClipboardCheck],
  ["My Courses", "/trainer/courses", BookOpen],
  ["Upload Content", "/trainer/upload", CloudUpload],
  ["Assessments", "/trainer/assessments", ClipboardList],
  ["Messages", "/trainer/messages", MessageSquare],
  ["Results", "/trainer/results", ChartNoAxesColumnIncreasing],
  ["Profile", "/trainer/profile", UserRound],
];

const searchItems = [
  { title: "Dashboard", hint: "Trainer overview", to: "/trainer" },
  { title: "Recent Activity", hint: "Your recent course actions", to: "/trainer/activity" },
  { title: "Attendance", hint: "Mark attendance for your enrolled learners", to: "/trainer/attendance" },
  { title: "My Courses", hint: "Assigned courses and display order", to: "/trainer/courses" },
  { title: "Upload Content", hint: "Add video, PDF, or course material", to: "/trainer/upload" },
  { title: "Assessments", hint: "Create and publish a test", to: "/trainer/assessments" },
  { title: "Messages", hint: "Conversations with enrolled learners", to: "/trainer/messages" },
  { title: "Results", hint: "Learner scores and performance", to: "/trainer/results" },
  { title: "Profile", hint: "Personal details and preferences", to: "/trainer/profile" },
  { title: "Support", hint: "Help and frequently asked questions", to: "/trainer/support" },
];

function notificationDestination(item) { return item.metadata?.path || (String(item.type).toUpperCase().includes("MESSAGE") ? "/trainer/messages" : "/trainer"); }
function notificationIcon(type) { return String(type || "").toUpperCase().includes("MESSAGE") ? MessageSquare : Bell; }

function notificationTime(value) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "Recent";
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}d ago` : new Date(timestamp).toLocaleDateString();
}

export default function TrainerLayout({ children }) {
  const { content: branding } = useBranding();
  const { logout, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const navigate = useNavigate();
  const results = useMemo(() => search.trim()
    ? searchItems.filter((item) => `${item.title} ${item.hint}`.toLowerCase().includes(search.trim().toLowerCase()))
    : [], [search]);

  const go = (path) => {
    navigate(path);
    setSearch("");
  };

  const unreadCount = notifications.filter((item) => !item.read).length;
  const loadNotifications = async () => { setNotificationsLoading(true); try { const result = await api.get("/api/learner/notifications", { params: { limit: 20 } }); setNotifications(result?.items || []); } catch { setNotifications([]); } finally { setNotificationsLoading(false); } };
  useEffect(() => { loadNotifications(); const timer = window.setInterval(loadNotifications, 60000); return () => window.clearInterval(timer); }, []);
  const markAllRead = async () => { try { await api.patch("/api/learner/notifications/read-all", {}); setNotifications((items) => items.map((item) => ({ ...item, read: true }))); } catch { loadNotifications(); } };
  const openNotification = async (item) => { if (!item.read) { try { await api.patch(`/api/learner/notifications/${item._id}/read`, {}); setNotifications((items) => items.map((notification) => notification._id === item._id ? { ...notification, read: true } : notification)); } catch { /* Keep it available if the read update fails. */ } } setShowNotifications(false); navigate(notificationDestination(item)); };

  return (
    <div className="trainer-layout">
      {open && <button className="trainer-layout__backdrop" onClick={() => setOpen(false)} aria-label="Close navigation" />}
      <aside className={`trainer-layout__sidebar ${open ? "is-open" : ""}`}>
        <Link className="trainer-layout__brand" to="/trainer" aria-label="Prime Easy Learn trainer dashboard">
          <img src={branding.logo?.url || logo} alt={branding.organization || "Prime Easy Learn Training Institute"} />
          <span>TRAINER PORTAL</span>
        </Link>
        <div className="trainer-layout__section-label">WORKSPACE</div>
        <nav aria-label="Trainer navigation">
          {navigation.map(([label, path, Icon, end]) => (
            <NavLink end={end} onClick={() => setOpen(false)} key={path} to={path} className={({ isActive }) => `trainer-layout__nav ${isActive ? "is-active" : ""}`}>
              <Icon size={19} /><span>{label}</span>{label === "Upload Content" && <i className="trainer-layout__nav-plus">+</i>}
            </NavLink>
          ))}
        </nav>
        <div className="trainer-layout__nav-bottom">
          <NavLink to="/trainer/support" onClick={() => setOpen(false)} className={({ isActive }) => `trainer-layout__nav ${isActive ? "is-active" : ""}`}><CircleHelp size={19} /><span>Help &amp; Support</span></NavLink>
          <Link to="/" onClick={() => void logout()} className="trainer-layout__nav"><LogOut size={19} /><span>Sign out</span></Link>
        </div>
        <div className="trainer-layout__promo"><span>Teach with purpose.<br />Help learners thrive.</span><i /><GraduationCap /><b>Better Skills<br />Brighter Futures</b></div>
      </aside>

      <div className="trainer-layout__main">
        <header className="trainer-layout__header">
          <button type="button" className="trainer-layout__menu" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
          <div className="trainer-layout__search-wrap">
            <label className="trainer-layout__search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && results[0]) go(results[0].to); if (event.key === "Escape") setSearch(""); }} placeholder="Search courses, learners, assessments..." aria-label="Search trainer workspace" />{search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search"><X size={15} /></button>}<kbd>⌘ K</kbd></label>
            {search.trim() && <div className="trainer-layout__search-results">{results.length ? results.slice(0, 5).map((item) => <button type="button" key={item.to} onClick={() => go(item.to)}><span><strong>{item.title}</strong><small>{item.hint}</small></span><Search size={14} /></button>) : <p>No workspace pages match “{search}”.</p>}</div>}
          </div>
          <div className="trainer-layout__account">
            <div className="trainer-layout__notification-wrap">
              <button type="button" className="trainer-layout__notification" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`} aria-expanded={showNotifications} onClick={() => setShowNotifications((value) => { const next = !value; if (next) loadNotifications(); return next; })}><Bell size={20} />{unreadCount > 0 && <i>{unreadCount > 9 ? "9+" : unreadCount}</i>}</button>
              {showNotifications && <section className="trainer-layout__notification-menu" aria-label="Notifications">
                <header><span><b>Notifications</b><small>{unreadCount ? `${unreadCount} unread` : "You're all caught up"}</small></span><div className="trainer-layout__notification-actions"><button type="button" className="trainer-layout__notification-read-all" aria-label="Refresh notifications" disabled={notificationsLoading} onClick={loadNotifications}><RefreshCw size={14} /></button>{unreadCount > 0 && <button type="button" className="trainer-layout__notification-read-all" onClick={markAllRead}>Mark all read</button>}</div></header>
                <div className="trainer-layout__notification-list">{notificationsLoading && !notifications.length ? <p className="trainer-layout__notification-empty">Loading notifications…</p> : notifications.map((item) => { const Icon = notificationIcon(item.type); return <button type="button" className={`trainer-layout__notification-item${item.read ? " is-read" : " is-unread"}`} key={item._id} onClick={() => openNotification(item)}><span className="trainer-layout__notification-icon"><Icon size={15} /></span><span className="trainer-layout__notification-copy"><strong>{item.title}</strong><small>{item.message}</small><time>{notificationTime(item.createdAt)}</time></span>{!item.read && <i className="trainer-layout__notification-unread" aria-label="Unread" />}</button>; })}</div>
                {!notificationsLoading && notifications.length === 0 && <p className="trainer-layout__notification-empty">No notifications yet.</p>}
              </section>}
            </div>
            <span className="trainer-layout__divider" />
            <Link to="/trainer/profile" className="trainer-layout__profile"><img src={user?.profileImage?.url || trainerAvatar} alt={`${user?.name || "Trainer"} profile`} /><span><b>{user?.name || "Trainer"}</b><small>{user?.specialization || "Trainer"}</small></span><ChevronDown size={16} /></Link>
          </div>
        </header>
        <main className="trainer-layout__content">{children}</main>
      </div>
    </div>
  );
}
