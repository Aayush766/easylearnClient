import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Code2,
  Database,
  Download,
  GraduationCap,
  Instagram,
  LockKeyhole,
  Linkedin,
  Printer,
  Share2,
  ShieldCheck,
  Sparkles,
  Youtube,
} from "lucide-react";

import StudentLayout from "./StudentLayout";
import api from "../services/api";
import useAuth from "../context/useAuth";
import "./StudentCertificates.css";
import "./StudentExperiencePolish.css";
import "./StudentCertificateLock.css";

function CertificateIcon({ type }) {
  if (type === "marketing") return <BarChart3 size={24} strokeWidth={2} />;
  if (type === "database") return <Database size={24} strokeWidth={2} />;
  return <Code2 size={24} strokeWidth={2} />;
}

/* Premium Dynamic SVG Certificate Template */
function CertificateSVG({ certificate, recipientName }) {
  const template = certificate.templateSnapshot || certificate.certificateTemplateId || {};
  const primary = /^#[0-9a-fA-F]{6}$/.test(template.primaryColor || "") ? template.primaryColor : "#2563EB";
  const accent = /^#[0-9a-fA-F]{6}$/.test(template.accentColor || "") ? template.accentColor : "#F59E0B";
  const style = template.style || "CLASSIC";
  const borderStyle = template.borderStyle || "DOUBLE";
  return (
    <svg
      className="cert-svg"
      viewBox="0 0 800 565"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="800" height="565" fill="#FFFFFF" />
      {template.backgroundImageUrl && <image href={template.backgroundImageUrl} x="0" y="0" width="800" height="565" preserveAspectRatio="xMidYMid slice" opacity="0.14" />}

      {/* Decorative Outer Border */}
      <rect
        x="24"
        y="24"
        width="752"
        height="517"
        rx="4"
        stroke={borderStyle === "NONE" ? "none" : primary}
        strokeWidth="2"
        strokeDasharray={borderStyle === "DASHED" ? "8 6" : undefined}
      />
      {borderStyle === "DOUBLE" && <rect
        x="32"
        y="32"
        width="736"
        height="501"
        rx="2"
        stroke="#CBD5E1"
        strokeWidth="1"
        strokeDasharray="4 4"
      />}

      {/* Top Left Accent Geometry */}
      <path d="M24 24H140L24 140V24Z" fill={primary} opacity="0.08" />
      <path d="M776 541H660L776 425V541Z" fill={primary} opacity="0.08" />

      {/* Header / Institution Brand */}
      <g transform="translate(320, 70)">
        {template.logoUrl ? <image href={template.logoUrl} x="-22" y="-15" width="28" height="28" preserveAspectRatio="xMidYMid meet" /> : <path
          d="M 0 -10 L 20 0 L 0 10 L -20 0 Z M -12 4 V 12 C -12 12 0 16 12 12 V 4"
          stroke={primary}
          strokeWidth="2"
          fill="none"
        />}
        <text x="32" y="0" className="brand-title">
          {template.organizationName || "PRIME EASY LEARN"}
        </text>
        <text x="32" y="14" className="brand-subtitle">
          INSTITUTE OF TECHNOLOGY
        </text>
      </g>

      {/* Certificate Identifier */}
      <text x="740" y="65" textAnchor="end" className="footer-label">
        ID: {certificate.certificateId}
      </text>

      {/* Title Header */}
      <text x="400" y="175" textAnchor="middle" className="cert-header" style={{ fill: primary }}>
        {template.certificateTitle || "CERTIFICATE OF COMPLETION"}
      </text>
      <text x="400" y="198" textAnchor="middle" className="cert-subheader">
        {template.subtitle || "THIS IS PROUDLY PRESENTED TO"}
      </text>

      {/* Recipient Name */}
      <text x="400" y="260" textAnchor="middle" className="recipient-name">
        {recipientName}
      </text>
      <line x1="220" y1="275" x2="580" y2="275" stroke="#CBD5E1" strokeWidth="1" />

      {/* Body Content */}
      <text x="400" y="315" textAnchor="middle" className="body-text">
        {template.bodyText || "for successfully mastering and completing the accredited program in"}
      </text>
      <text x="400" y="350" textAnchor="middle" className="course-title" style={{ fill: primary }}>
        {certificate.course}
      </text>

      {/* Seals and Signatures */}
      <g transform="translate(400, 440)">
        {/* Gold Badge */}
        <circle cx="0" cy="0" r="28" fill={accent} fillOpacity="0.16" stroke={accent} strokeWidth="2" />
        <path
          d="M-10 -4 L0 -14 L10 -4 L5 12 L-5 12 Z"
          fill={accent}
          opacity="0.8"
        />
      </g>

      {/* Date */}
      <g transform="translate(120, 435)">
        <text x="0" y="0" className="footer-value">
          {certificate.issued}
        </text>
        <line x1="0" y1="8" x2="140" y2="8" stroke="#94A3B8" strokeWidth="1" />
        <text x="0" y="24" className="footer-label">
          DATE OF ISSUANCE
        </text>
      </g>

      {/* Signature */}
      <g transform="translate(680, 435)">
        {template.signatureImageUrl ? <image href={template.signatureImageUrl} x="-105" y="-27" width="110" height="32" preserveAspectRatio="xMidYMid meet" /> : <path
          d="M -100 -5 C -80 -25 -60 5 -40 -15 C -20 -5 0 -20 10 -10"
          stroke="#0F172A"
          strokeWidth="2"
          fill="none"
        />}
        <line x1="-120" y1="8" x2="0" y2="8" stroke="#94A3B8" strokeWidth="1" />
        <text x="-60" y="24" textAnchor="middle" className="footer-label">
          {template.signatureText || "AUTHORIZED SIGNATURE"}
        </text>
      </g>
    </svg>
  );
}

export default function StudentCertificates() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedId, setSelectedId] = useState("");
  const [sort, setSort] = useState("recent");
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/api/learner/certificates").then((result) => {
      if (!active) return;
      const rows = (result?.items || []).map((item) => {
        const course = item.courseId || {};
        const title = course.title || "Course completion";
        const normalized = title.toLowerCase();
        return { ...item, id: item._id, title, course: title, subtitle: "Professional Certificate", issued: item.issueDate ? new Date(item.issueDate).toLocaleDateString() : "", certificateId: item.certificateNumber, icon: normalized.includes("data") || normalized.includes("python") ? "database" : normalized.includes("marketing") ? "marketing" : "code", theme: normalized.includes("data") ? "purple" : normalized.includes("marketing") ? "red" : "blue", locked: item.status !== "VALID" };
      });
      setCertificates(rows);
      setSelectedId(rows[0]?.id || "");
    }).catch((loadError) => { if (active) setError(loadError.message || "Could not load your certificates."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const selectedCertificate = certificates.find((cert) => cert.id === selectedId) || certificates[0];

  const sortedCertificates = [...certificates].sort((a, b) => sort === "recent" ? new Date(b.issueDate) - new Date(a.issueDate) : new Date(a.issueDate) - new Date(b.issueDate));

  const handleDownload = () => { if (selectedCertificate?.certificateUrl) window.open(selectedCertificate.certificateUrl, "_blank", "noopener,noreferrer"); else window.print(); };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Certificate",
          text: `Check out my certificate for ${selectedCertificate.course}!`,
          url: `${window.location.origin}/api/certificates/verify/${selectedCertificate.verificationCode}`,
        });
      } catch {
        // Ignored
      }
    } else {
      await navigator.clipboard.writeText(`${window.location.origin}/api/certificates/verify/${selectedCertificate.verificationCode}`);
      setNotice("Verification link copied.");
    }
  };

  const handleVerify = async () => { if (!selectedCertificate) return; setNotice(""); try { const result = await api.get(`/api/certificates/verify/${selectedCertificate.verificationCode}`); setNotice(result?.certificate?.status === "VALID" ? "This certificate is valid." : "This certificate is not valid."); } catch (verifyError) { setNotice(verifyError.message || "Could not verify this certificate."); } };

  return (
    <StudentLayout>
      <div className="student-certificates">
        <main className="certificates-main">
          {/* Header */}
          <section className="certificates-page-header">
            <div className="certificates-heading">
              <h1>Certificates &amp; Credentials</h1>
              <p>
                Manage, share, and verify your official course certifications.
              </p>
            </div>

            <div className="certificates-hero">
              <div className="certificates-hero__content">
                <div className="certificates-hero__icon">
                  <Award size={28} />
                </div>
                <div className="certificates-hero__copy">
                  <strong>Verified Qualifications</strong>
                  <p>Share your credentials directly to LinkedIn or employers.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Toolbar */}
          <div className="certificates-toolbar">
            <div className="certificate-tabs">
              <button
                className={`certificate-tab ${activeTab === "all" ? "certificate-tab--active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                All Certificates ({certificates.length})
              </button>
              <button
                className={`certificate-tab ${activeTab === "course" ? "certificate-tab--active" : ""}`}
                onClick={() => setActiveTab("course")}
              >
                Courses ({certificates.length})
              </button>
            </div>

            <button
              className="certificate-sort-button"
              onClick={() =>
                setSort((curr) => (curr === "recent" ? "oldest" : "recent"))
              }
            >
              <span>{sort === "recent" ? "Most Recent" : "Oldest First"}</span>
              <ChevronDown size={14} />
            </button>
          </div>

          {/* Workspace */}
          <div className="certificates-workspace">
            {/* List */}
            <div className="certificate-list">
              {sortedCertificates.map((cert) => (
                <button
                  key={cert.id}
                  className={`certificate-list-card ${selectedId === cert.id ? "certificate-list-card--active" : ""}`}
                  onClick={() => setSelectedId(cert.id)}
                >
                  <div
                    className={`certificate-list-icon certificate-list-icon--${cert.theme}`}
                  >
                    <CertificateIcon type={cert.icon} />
                  </div>

                  <div className="certificate-list-content">
                    <h3>{cert.title}</h3>
                    <p>{cert.subtitle}</p>

                    <div className="certificate-meta-row">
                      <div className="certificate-issued">
                        <Calendar size={12} />
                        <span>{cert.issued}</span>
                      </div>
                  <span className={cert.locked ? "certificate-valid certificate-valid--locked" : "certificate-valid"}>
                        {cert.locked ? <LockKeyhole size={10} /> : <CheckCircle2 size={10} />} {cert.locked ? "Revoked" : "Valid"}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Preview Canvas */}
            <div className="certificate-preview-container">
              <div className="certificate-preview-wrapper">
                <div className="certificate-preview-frame">
                  {loading ? <div className="certificate-demo-locked"><p>Loading your certificates…</p></div> : error ? <div className="certificate-demo-locked"><p role="alert">{error}</p></div> : !selectedCertificate ? <div className="certificate-demo-locked"><h2>No certificates yet</h2><p>Certificates appear here after you complete an eligible course.</p><Link to="/student/courses">View my courses</Link></div> : selectedCertificate.locked ? (
                    <div className="certificate-demo-locked">
                      <div className="certificate-demo-locked__icon"><LockKeyhole size={27} /></div>
                      <span>COURSE COMPLETED</span>
                      <h2>Certificate unavailable</h2>
                      <p>This certificate has been revoked. Contact support if you believe this is an error.</p>
                      <div><LockKeyhole size={15} /> Certificate status: revoked</div>
                    </div>
                  ) : <CertificateSVG certificate={selectedCertificate} recipientName={user?.name || "Learner"} />}
                </div>
              </div>

              {/* Actions */}
              <div className="certificate-actions">
                <button
                  className="certificate-action certificate-action--primary"
                  onClick={handleDownload}
                  disabled={!selectedCertificate || selectedCertificate.locked}
                >
                  <Download size={16} />
                  <span>Download PDF</span>
                </button>

                <button className="certificate-action" onClick={handleShare} disabled={!selectedCertificate || selectedCertificate.locked}>
                  <Share2 size={16} />
                  <span>Share</span>
                </button>

                <button className="certificate-action" onClick={handleDownload} disabled={!selectedCertificate || selectedCertificate.locked}>
                  <Printer size={16} />
                  <span>Print</span>
                </button>

                <button className="certificate-action" onClick={handleVerify} disabled={!selectedCertificate}>
                  <ShieldCheck size={16} />
                  <span>Verify</span>
                </button>
              </div>
              {notice && <p className="certificate-verification-notice" role="status">{notice}</p>}
            </div>
          </div>

          {/* Bottom Banner */}
          <section className="certificates-bottom-cta">
            <div className="certificates-bottom-cta__content">
              <h2>Ready to build your portfolio further?</h2>
              <p>Explore specialized tracks and earn industry-recognized badges.</p>
            </div>
            <Link to="/student/courses" className="certificates-bottom-cta__button">
              <span>Browse Catalog</span>
              <ArrowRight size={14} />
            </Link>
          </section>
        </main>

        {/* Footer */}
        <footer className="certificates-footer">
          <span>© 2026 Prime Easy Learn Training Institute.</span>

          <div className="certificates-footer-links">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#help">Support</a>
          </div>

          <div className="certificates-social">
            <a href="#linkedin" className="certificates-social-icon">
              <Linkedin size={14} />
            </a>
            <a href="#instagram" className="certificates-social-icon">
              <Instagram size={14} />
            </a>
            <a href="#youtube" className="certificates-social-icon">
              <Youtube size={14} />
            </a>
          </div>
        </footer>
      </div>
    </StudentLayout>
  );
}
