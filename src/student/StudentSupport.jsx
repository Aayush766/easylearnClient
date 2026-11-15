import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Clock3,
  CreditCard,
  FileBadge2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Settings,
  ShieldCheck,
  Star,
  UserRound,
  X,
} from "lucide-react";

import StudentLayout from "./StudentLayout";
import api from "../services/api";
import "./StudentSupport.css";
import "./StudentSupportActions.css";

// Optional fallback image handling
const HERO_IMAGE_PATH = "/assets/student/hero-student.png";

const SUPPORT_OPTIONS = [
  {
    title: "Send an Email",
    description: "Raise a ticket via email.",
    button: "Email Us",
    icon: Mail,
    className: "support-option--green",
  },
  {
    title: "Raise a Ticket",
    description: "Submit a support request.",
    button: "Create Ticket",
    icon: ClipboardList,
    className: "support-option--purple",
  },
];

const HELP_CATEGORIES = [
  { id: "popular", label: "Popular Topics", icon: Star },
  { id: "account", label: "Account & Login", icon: UserRound },
  { id: "courses", label: "Courses & Learning", icon: BookOpen },
  { id: "assessments", label: "Assessments & Exams", icon: ClipboardList },
  { id: "certificates", label: "Certificates", icon: FileBadge2 },
  { id: "payments", label: "Payments & Enrolment", icon: CreditCard },
  { id: "technical", label: "Technical Support", icon: Settings },
  { id: "general", label: "General Queries", icon: MessageCircle },
];

const FAQS = [
  {
    id: 1,
    category: "popular",
    question: "How do I access my enrolled course?",
    answer: "Open 'My Courses' from the student sidebar and select the course you want to continue learning.",
  },
  {
    id: 2,
    category: "popular",
    question: "How long do I have access to a course?",
    answer: "Your course access remains available according to the validity period assigned to your enrolment.",
  },
  {
    id: 3,
    category: "popular",
    question: "Can I get an extension if my course expires?",
    answer: "Please contact the support team with your course details. Our team can review your request and guide you through the available options.",
  },
  {
    id: 4,
    category: "assessments",
    question: "How do I attempt assessments?",
    answer: "Open Assessments from the student portal and select the available assessment for your enrolled course.",
  },
  {
    id: 5,
    category: "certificates",
    question: "Where can I view my results and certificates?",
    answer: "Your assessment results are available under Assessments and your earned certificates under Certificates.",
  },
  {
    id: 6,
    category: "technical",
    question: "What should I do if a video is not playing?",
    answer: "Check your internet connection, refresh the page, and ensure your browser is updated. If the issue continues, reach out to technical support.",
  },
  {
    id: 7,
    category: "courses",
    question: "Can I re-enroll in a course after it expires?",
    answer: "Please contact our support team with your course information to check the available re-enrolment options.",
  },
  {
    id: 8,
    category: "account",
    question: "How do I update my profile information?",
    answer: "Contact the support team if you need assistance updating your registered details.",
  },
];

function SupportBanner() {
  return (
    <div className="support-banner">
      <div className="support-banner-copy">
        <span>Questions today.</span>
        <span>Better tomorrow.</span>
      </div>

      <div className="support-banner-person">
        <img
          src={HERO_IMAGE_PATH}
          alt="Support Hero"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      </div>

      <div className="support-banner-right">
        <span>“Don’t hesitate to ask,</span>
        <span>we’re always here for you!”</span>
      </div>
    </div>
  );
}

function SupportActionCard({ item, onCreateTicket }) {
  const Icon = item.icon;

  const handleAction = () => {
    if (item.title === "Send an Email") {
      window.location.href = "mailto:support@primeeasylearn.com";
      return;
    }
    onCreateTicket();
  };

  return (
    <article className={`support-action-card ${item.className}`}>
      <div className="support-action-icon">
        <Icon size={22} strokeWidth={2} />
      </div>

      <h2>{item.title}</h2>
      <p>{item.description}</p>

      <button type="button" onClick={handleAction}>
        <span>{item.button}</span>
        <ArrowRight size={15} />
      </button>
    </article>
  );
}

function SupportHours() {
  return (
    <aside className="support-hours-card">
      <div className="support-hours-heading">
        <div>
          <Clock3 size={20} strokeWidth={2} />
        </div>
        <h2>Support Hours</h2>
      </div>

      <div className="support-hours-content">
        <strong>Monday - Saturday</strong>
        <span>9:00 AM - 8:00 PM (IST)</span>

        <strong>Sunday</strong>
        <span>10:00 AM - 4:00 PM (IST)</span>
      </div>

      <div className="support-response">
        <span />
        <p>Responds within 2 hrs</p>
      </div>
    </aside>
  );
}

function HelpSearch({ value, onChange }) {
  return (
    <div className="help-search">
      <Search size={20} strokeWidth={2} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search help articles (e.g., 'how to access course')"
      />
    </div>
  );
}

function HelpCategories({ activeCategory, onCategoryChange }) {
  return (
    <section className="help-categories">
      <h2>Categories</h2>
      <div className="help-category-list">
        {HELP_CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <button
              type="button"
              key={category.id}
              className={
                activeCategory === category.id
                  ? "help-category help-category--active"
                  : "help-category"
              }
              onClick={() => onCategoryChange(category.id)}
            >
              <Icon size={18} strokeWidth={2} />
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function FAQSection({ faqs, searchTerm, onViewAll }) {
  const [openFaq, setOpenFaq] = useState(null);

  const visibleFaqs = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return faqs;

    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(normalizedSearch) ||
        faq.answer.toLowerCase().includes(normalizedSearch)
    );
  }, [faqs, searchTerm]);

  return (
    <section className="faq-section">
      <div className="faq-heading">
        <h2>Frequently Asked Questions</h2>
        <button type="button" onClick={onViewAll}>
          View All <ArrowRight size={14} />
        </button>
      </div>

      <div className="faq-list">
        {visibleFaqs.length === 0 ? (
          <div className="faq-empty">
            <CircleHelp size={32} />
            <span>No matching help articles found.</span>
          </div>
        ) : (
          visibleFaqs.map((faq) => {
            const isOpen = openFaq === faq.id;

            return (
              <div
                className={isOpen ? "faq-item faq-item--open" : "faq-item"}
                key={faq.id}
              >
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                >
                  <span>{faq.question}</span>
                  <ChevronRight size={18} strokeWidth={2} />
                </button>

                <div className="faq-answer-wrapper">
                  <div className="faq-answer-content">
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

function ContactInformation() {
  return (
    <aside className="contact-information">
      <h2>Contact Us</h2>

      <div className="contact-item">
        <Mail size={18} />
        <span>support@primeeasylearn.com</span>
      </div>

      <div className="contact-item">
        <Phone size={18} />
        <span>+91 98765 43210</span>
      </div>

      <div className="contact-item">
        <MapPin size={18} />
        <span>
          Prime Easy Learn Training Institute
          <br />
          Gaya, Bihar, India
        </span>
      </div>

      <div className="support-socials">
        <a href="#linkedin" aria-label="LinkedIn">in</a>
        <a href="#instagram" aria-label="Instagram">◎</a>
        <a href="#youtube" aria-label="YouTube">▶</a>
        <a href="#facebook" aria-label="Facebook">f</a>
        <a href="#x" aria-label="X">𝕏</a>
      </div>
    </aside>
  );
}

function StillNeedHelp() {
  return (
    <section className="still-help-card">
      <div className="still-help-card-header">
        <div className="still-help-icon">
          <MessageCircle size={20} />
        </div>
        <h2>Still Need Help?</h2>
      </div>

      <p>Can’t find what you are looking for? Our team is just a message away.</p>

      <Link to="/student/messages">
        <span>Contact Support</span>
        <ArrowRight size={15} />
      </Link>
    </section>
  );
}

function LearningPriority() {
  return (
    <section className="learning-priority">
      <div className="learning-priority-icon">
        <ShieldCheck size={22} />
      </div>
      <div>
        <h2>Your Success, Our Priority</h2>
        <p>Committed to providing high-quality assistance for your learning journey.</p>
      </div>
    </section>
  );
}

function SupportSidebar() {
  return (
    <div className="support-right-column">
      <ContactInformation />
      <StillNeedHelp />
      <LearningPriority />
    </div>
  );
}

export default function StudentSupport() {
  const [activeCategory, setActiveCategory] = useState("popular");
  const [searchTerm, setSearchTerm] = useState("");
  const [ticketOpen, setTicketOpen] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [ticketForm, setTicketForm] = useState({ category: "GENERAL", subject: "", description: "" });
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketError, setTicketError] = useState("");
  const [ticketNotice, setTicketNotice] = useState("");

  const loadTickets = async () => { try { const result = await api.get("/api/learner/support", { params: { limit: 50 } }); setTickets(result.items || []); } catch (error) { setTicketError(error.message || "Could not load support requests."); } };
  useEffect(() => { loadTickets(); }, []);
  const submitTicket = async (event) => {
    event.preventDefault(); setTicketError(""); setTicketNotice(""); setTicketLoading(true);
    try { await api.post("/api/learner/support", { ...ticketForm, subject: ticketForm.subject.trim(), description: ticketForm.description.trim() }); setTicketForm({ category: "GENERAL", subject: "", description: "" }); setTicketOpen(false); setTicketNotice("Your support request was submitted."); await loadTickets(); }
    catch (error) { setTicketError(error.message || "Could not submit your support request."); }
    finally { setTicketLoading(false); }
  };

  const filteredFaqs = useMemo(() => {
    if (activeCategory === "popular") return FAQS;
    return FAQS.filter((faq) => faq.category === activeCategory);
  }, [activeCategory]);

  return (
    <StudentLayout>
      <div className="student-support-page">
        <main className="support-main">
          {/* HEADER */}
          <header className="support-page-header">
            <div className="support-page-title">
              <h1>Help &amp; Support</h1>
              <p>Find answers, submit queries, and get in touch with our team.</p>
            </div>
            <SupportBanner />
          </header>

          {/* ACTION CARDS */}
          <section className="support-actions-grid">
            {SUPPORT_OPTIONS.map((item) => (
              <SupportActionCard item={item} key={item.title} onCreateTicket={() => setTicketOpen(true)} />
            ))}
            <SupportHours />
          </section>

          {/* SEARCH */}
          <HelpSearch value={searchTerm} onChange={setSearchTerm} />

          {/* CONTENT GRID */}
          <section className="support-content-grid">
            <div className="support-left-content">
              <HelpCategories
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
              <FAQSection faqs={filteredFaqs} searchTerm={searchTerm} onViewAll={() => { setActiveCategory("popular"); setSearchTerm(""); }} />
            </div>
            <SupportSidebar />
          </section>
          {ticketNotice && <p className="support-ticket-notice" role="status">{ticketNotice}</p>}
          {ticketError && !ticketOpen && <p className="support-ticket-error" role="alert">{ticketError}</p>}
          <section className="support-ticket-list"><div><h2>Your support requests</h2><p>Track the status of questions you’ve sent to our team.</p></div>{tickets.length ? tickets.map((ticket) => <article key={ticket._id}><span><b>{ticket.subject}</b><small>{ticket.category} · {new Date(ticket.createdAt).toLocaleDateString()}</small></span><strong className={`support-ticket-status support-ticket-status--${ticket.status?.toLowerCase()}`}>{ticket.status?.replaceAll("_", " ")}</strong></article>) : <p>No support requests yet.</p>}</section>
        </main>
      </div>
      {ticketOpen && <div className="support-ticket-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setTicketOpen(false); }}><form className="support-ticket-dialog" onSubmit={submitTicket}><header><div><span>SUPPORT</span><h2>Create a support request</h2></div><button type="button" aria-label="Close" onClick={() => setTicketOpen(false)}><X size={19} /></button></header><label>Category<select value={ticketForm.category} onChange={(event) => setTicketForm((value) => ({ ...value, category: event.target.value }))}><option value="GENERAL">General</option><option value="COURSE">Courses & learning</option><option value="ASSESSMENT">Assessments</option><option value="ACCOUNT">Account & login</option><option value="TECHNICAL">Technical support</option><option value="PAYMENT">Payments & enrolment</option></select></label><label>Subject<input value={ticketForm.subject} onChange={(event) => setTicketForm((value) => ({ ...value, subject: event.target.value }))} required maxLength={200} placeholder="Briefly describe the issue" /></label><label>Details<textarea value={ticketForm.description} onChange={(event) => setTicketForm((value) => ({ ...value, description: event.target.value }))} required maxLength={5000} rows={5} placeholder="Tell us what happened and what you need help with." /></label>{ticketError && <p role="alert">{ticketError}</p>}<button type="submit" disabled={ticketLoading}>{ticketLoading ? "Submitting…" : "Submit request"}</button></form></div>}
    </StudentLayout>
  );
}
