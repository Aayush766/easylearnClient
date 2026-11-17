import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { BarChart3, Bell, BookOpen, Building2, CircleHelp, ClipboardCheck, FileBadge2, FileText, LayoutDashboard, LogOut, Menu, ReceiptText, Search, Settings2, ShieldCheck, UserCog, Users, UserRoundCog, ChevronDown, X } from "lucide-react";
import "./Admin.css";
import useBranding from "../context/BrandingContext";

const coreNavigation = [
  ["Dashboard", "", LayoutDashboard], ["Courses", "courses", BookOpen], ["Learners", "learners", Users], ["Trainers", "trainers", UserRoundCog], ["Enrollments", "enrollments", ClipboardCheck], ["Assessments", "assessments", FileText], ["Results", "results", BarChart3], ["Certificates", "certificates", FileBadge2], ["Reports", "reports", ReceiptText],
];
const superNavigation = [["Admins", "admins", UserCog], ["Billing", "billing", ReceiptText], ["Platform Settings", "settings", Settings2], ["Branding", "branding", Building2], ["Audit Logs", "audit-logs", ShieldCheck]];

export default function AdminLayout({ children, isSuperAdmin = false }) {
  const { content: branding } = useBranding();
  const [open, setOpen] = useState(false); const { pathname } = useLocation();
  const base = isSuperAdmin ? "/super-admin" : "/admin"; const navigation = [...coreNavigation, ...(isSuperAdmin ? superNavigation : [])];
  const page = pathname.replace(base, "").replace(/^\//, "") || "dashboard";
  return <div className="admin-shell">
    {open && <button className="admin-backdrop" aria-label="Close navigation" onClick={() => setOpen(false)} />}
    <aside className={`admin-sidebar${open ? " is-open" : ""}`}>
      <Link to={base} className="admin-brand"><img src={branding.logo?.url || "/assets/student/logo.jpeg"} alt={branding.organization || "Prime Easy Learn"} /><span><b>{branding.organization || "Prime Easy Learn"}</b><small>{isSuperAdmin ? "Super Admin Console" : "Admin Console"}</small></span><button aria-label="Close navigation" onClick={() => setOpen(false)}><X size={18} /></button></Link>
      <div className="admin-role-label"><span>{isSuperAdmin ? "Platform controls" : "Academic operations"}</span></div>
      <nav aria-label="Administration navigation">{navigation.map(([label, path, Icon]) => <NavLink end={!path} onClick={() => setOpen(false)} to={path ? `${base}/${path}` : base} key={label} className={({ isActive }) => `admin-nav${isActive ? " is-active" : ""}`}><Icon size={18} /><span>{label}</span>{page === path && <i />}</NavLink>)}</nav>
      <div className="admin-sidebar-bottom"><NavLink to={`${base}/profile`} className={({ isActive }) => `admin-nav${isActive ? " is-active" : ""}`}><UserCog size={18} /><span>My Profile</span></NavLink><NavLink to={`${base}/support`} className={({ isActive }) => `admin-nav${isActive ? " is-active" : ""}`}><CircleHelp size={18} /><span>Help & Support</span></NavLink><Link to="/" className="admin-nav"><LogOut size={18} /><span>Logout</span></Link></div>
    </aside>
    <section className="admin-main"><header className="admin-topbar"><button className="admin-menu" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={21} /></button><label className="admin-search"><Search size={18} /><input placeholder="Search courses, learners, trainers..." /><kbd>⌘ K</kbd></label><div className="admin-actions"><button className="admin-bell" aria-label="Notifications"><Bell size={20} /><i>4</i></button><span className="admin-divider" /><div className="admin-account"><span className="admin-avatar">{isSuperAdmin ? "SA" : "AK"}</span><div><b>{isSuperAdmin ? "Priya Mehta" : "Aayush Kumar"}</b><small>{isSuperAdmin ? "Super Admin" : "Administrator"}</small></div><ChevronDown size={16} /></div></div></header><main className="admin-content">{children}</main></section>
  </div>;
}
