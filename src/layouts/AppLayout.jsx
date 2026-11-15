import { Bell, ChevronDown, CircleHelp, FileBadge, FileText, LayoutDashboard, Menu, MessageSquare, Search, Settings, UserRound, Users, BookOpen } from "lucide-react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import Avatar from "../components/ui/Avatar";
import "./PortalLayout.css";

const studentNav = [
  ["", "Dashboard", LayoutDashboard], ["courses", "My Courses", BookOpen],
  ["assessments", "Assessments", FileText], ["certificates", "Certificates", FileBadge],
  ["progress", "My Progress", LayoutDashboard], ["bookmarks", "Bookmarks", BookOpen],
  ["messages", "Messages", MessageSquare], ["support", "Help & Support", CircleHelp],
];
const trainerNav = [
  ["", "Dashboard", LayoutDashboard], ["courses", "My Courses", BookOpen],
  ["content", "Course Content", FileText], ["upload", "Upload Content", BookOpen],
  ["assessments", "Assessments", FileText], ["results", "Results", FileBadge],
  ["profile", "Profile", UserRound],
];

export default function AppLayout({ variant }) {
  const { role: routeRole } = useParams();
  const role = variant || routeRole || "student";
  const nav = role === "trainer" ? trainerNav : studentNav;
  const name = role === "trainer" ? "Neha Sharma" : "Aayush Kumar";

  return (
    <div className={`portal-shell portal-shell--${role}`}>
      <aside className="portal-sidebar">
        <NavLink className="portal-logo" to={`/${role}`}>
          <span className="portal-logo__mark">P</span>
          <span><b>Prime</b><strong>Easy Learn</strong><small>Training Institute</small></span>
        </NavLink>
        <nav>{nav.map(([path,label,Icon]) => <NavLink key={label} end={!path} to={path ? `/${role}/${path}` : `/${role}`} className={({isActive}) => `portal-nav ${isActive ? "active":""}`}><Icon size={19}/><span>{label}</span></NavLink>)}</nav>
        <div className="portal-sidebar__bottom">
          <NavLink to={`/${role}/support`} className="portal-nav"><CircleHelp size={19}/> <span>Help & Support</span></NavLink>
          <NavLink to="/" className="portal-nav"><span>↪</span><span>Logout</span></NavLink>
        </div>
      </aside>
      <main className="portal-main">
        <header className="portal-topbar">
          <button className="portal-menu"><Menu/></button>
          <label className="portal-search"><Search size={18}/><input placeholder="Search for your courses, lessons, or anything..."/></label>
          <div className="portal-user"><button><Bell size={21}/><i/></button><Avatar name={name}/><span><b>{name}</b><small>{role === "trainer" ? "Trainer" : "Student"}</small></span><ChevronDown size={17}/></div>
        </header>
        <Outlet/>
      </main>
    </div>
  );
}
