import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Laptop,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Play,
  Rocket,
  Search,
  Star,
  Users,
  Youtube,
  Instagram,
  Facebook,
  Award,
  FolderKanban,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";
import "./LandingPage.css";

/* =========================================================
   LANDING PAGE IMAGES
   All images are inside:
   src/public/assets/landing/
   ========================================================= */

import heroVisual from "../../public/assets/landing/hero-visual.png";
import trainerVisual from "../../public/assets/landing/trainer-visual.png";
import logoReference from "../../public/assets/landing/logo-reference.png";

import courseWeb from "../../public/assets/landing/course-web.png";
import courseMarketing from "../../public/assets/landing/course-marketing.png";
import courseDesign from "../../public/assets/landing/course-design.png";
import courseData from "../../public/assets/landing/course-data.png";

import videoWeb from "../../public/assets/landing/video-web.png";
import videoMarketing from "../../public/assets/landing/video-marketing.png";
import videoDesign from "../../public/assets/landing/video-design.png";
import videoData from "../../public/assets/landing/video-data.png";

import avatarPriya from "../../public/assets/landing/avatar-priya.png";
import avatarRahul from "../../public/assets/landing/avatar-rahul.png";
import avatarSneha from "../../public/assets/landing/avatar-sneha.png";

/* =========================================================
   COURSES
   ========================================================= */

const courses = [
  {
    category: "Development",
    title: "Full Stack Web Development",
    description:
      "Learn modern web technologies like React, Node.js, MongoDB and build real-world projects.",
    meta: "6 Months",
    rating: "4.8 (320)",
    price: "₹9,999",
    image: courseWeb,
  },
  {
    category: "Marketing",
    title: "Advanced Digital Marketing",
    description:
      "Master SEO, Google Ads, Social Media, Content Marketing and more with live campaigns.",
    meta: "3 Months",
    rating: "4.7 (280)",
    price: "₹7,999",
    image: courseMarketing,
  },
  {
    category: "Design",
    title: "UI/UX Design Masterclass",
    description:
      "Learn UI/UX design with real projects, Figma, user research and portfolio building.",
    meta: "4 Months",
    rating: "4.8 (190)",
    price: "₹8,999",
    image: courseDesign,
  },
  {
    category: "Data Science",
    title: "Data Analytics with Python",
    description:
      "Learn data analysis, visualization, SQL and Python with hands-on projects and case studies.",
    meta: "4 Months",
    rating: "4.6 (240)",
    price: "₹8,999",
    image: courseData,
  },
];

/* =========================================================
   VIDEOS
   ========================================================= */

const videos = [
  [
    "Getting Started with Web Development",
    "12:34",
    videoWeb,
  ],
  [
    "What is Digital Marketing?",
    "08:20",
    videoMarketing,
  ],
  [
    "UI/UX Design Process",
    "10:12",
    videoDesign,
  ],
  [
    "Data Analysis with Python",
    "09:15",
    videoData,
  ],
];

/* =========================================================
   TESTIMONIALS
   ========================================================= */

const testimonials = [
  {
    name: "Priya Sharma",
    course: "Full Stack Web Development",
    avatar: avatarPriya,
    text:
      "The trainers are amazing and the course is very practical. I got placed within 3 months!",
  },
  {
    name: "Rahul Verma",
    course: "Digital Marketing",
    avatar: avatarRahul,
    text:
      "Best learning experience! The live projects helped me gain real-world skills.",
  },
  {
    name: "Sneha Patel",
    course: "UI/UX Design",
    avatar: avatarSneha,
    text:
      "Very well structured course and great support from the team. Highly recommended!",
  },
];

/* =========================================================
   STAT COMPONENT
   ========================================================= */

function Stat({ icon: Icon, value, label, sub }) {
  return (
    <div className="pel-stat">
      <span className="pel-stat__icon">
        <Icon size={25} strokeWidth={2.3} />
      </span>

      <div>
        <strong>{value}</strong>
        <b>{label}</b>
        <small>{sub}</small>
      </div>
    </div>
  );
}

/* =========================================================
   LANDING PAGE
   ========================================================= */

function LandingPage() {
  const [cms, setCms] = useState({});
  useEffect(() => { api.get("/api/landing").then((result) => setCms(result?.content || {})).catch(() => {}); }, []);
  const visibleCourses = cms.courses?.length ? cms.courses : courses;
  const visibleVideos = cms.videos?.length ? cms.videos.map((item) => [item.title, item.duration, item.image]) : videos;
  const visibleTestimonials = cms.testimonials?.length ? cms.testimonials : testimonials;
  if (Array.isArray(cms.sections)) return <EditableLanding cms={cms} />;
  return (
    <div className="pel-page">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="pel-header">
        <div className="pel-container pel-header__inner">

          <Link className="pel-brand" to="/">
            <span className="pel-brand__mark">
              <span className="pel-brand__dot" />
              <span className="pel-brand__arc" />
            </span>

            <span className="pel-brand__copy">
              <strong>{cms.brandFirst || "Prime"}</strong>
              <b>{cms.brandSecond || "Easy Learn"}</b>
              <small>{cms.organization || "Training Institute"}</small>
            </span>
          </Link>

          <nav className="pel-nav">
            <a className="active" href="#">
              Home
            </a>

            <a href="#courses">
              Courses
            </a>

            <a href="#about">
              About Us
            </a>

            <a href="#stories">
              Success Stories
            </a>

            <a href="#resources">
              Resources
            </a>

            <a href="#contact">
              Contact
            </a>
          </nav>

          <div className="pel-header-actions">

            <button
              className="pel-search"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            <Link
              className="pel-login pel-login--student"
              to="/login/student"
            >
              Login as Student
            </Link>

            <Link
              className="pel-login pel-login--trainer"
              to="/login/trainer"
            >
              Login as Trainer
            </Link>

            <Link
              className="pel-enroll"
              to="/login/student"
            >
              Enroll Now
            </Link>

          </div>

          <button
            className="pel-mobile-menu"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

        </div>
      </header>

      <main>

        {/* =====================================================
            HERO
            ===================================================== */}

       <section className="pel-hero">
  <div className="pel-hero-bg-shape pel-hero-bg-shape--left" />
  <div className="pel-hero-bg-shape pel-hero-bg-shape--main" />
  <div className="pel-hero-bg-shape pel-hero-bg-shape--right" />

  <div className="pel-hero-decoration pel-hero-decoration--top">
    Learn
    <br />
    Practice
    <br />
    Grow
    
  </div>

  <div className="pel-hero-decoration pel-hero-decoration--bottom">
    <span>Keep Learning</span>
    <br />
    <span>Keep Growing!</span>
    <i />
  </div>

  <div className="pel-hero-decoration pel-hero-star">✦</div>

  <div className="pel-container pel-hero__grid">

    {/* =========================
        LEFT CONTENT
       ========================= */}
    <div className="pel-hero__copy">

      <span className="pel-pill">
        SKILLS TODAY <i>•</i> BETTER TOMORROW
      </span>

      <h1>
        {cms.heroTitle || "Learn Skills."}
        <br />
        <span>
          {cms.heroAccent || "Build Your Future."}
        </span>
      </h1>

      <p>
        Practical training, industry-focused learning and
        <br className="pel-desktop-break" />
        real opportunities — all in one place.
      </p>

      <div className="pel-benefits">

        <span>
          <CheckCircle2 />
          Job Ready Skills
        </span>

        <span>
          <CheckCircle2 />
          Learn from Experts
        </span>

        <span>
          <CheckCircle2 />
          Flexible Learning
        </span>

        <span>
          <CheckCircle2 />
          Lifetime Support
        </span>

      </div>

      <div className="pel-hero-actions">

        <Link
          className="pel-btn pel-btn--orange"
          to="/login/student"
        >
          Explore Courses
          <ArrowRight size={17} />
        </Link>

        <a
          className="pel-btn pel-btn--outline"
          href="#resources"
        >
          <span className="pel-play">
            <Play
              size={12}
              fill="currentColor"
            />
          </span>

          Watch Introduction
        </a>

      </div>

    </div>


    {/* =========================
        RIGHT HERO VISUAL
       ========================= */}
    <div className="pel-hero__visual">

      {/* Main orange shape */}
      <div className="pel-hero-orange-card" />

      {/* Main information card */}
      <div className="pel-hero-main-card">

        <h3>
          Real Skills
          <br />
          Real Opportunities
        </h3>

        <p>
          - Learn from industry experts
          <br />
          and build a career you love.
        </p>

      </div>


      {/* Main person */}
      <img
        className="pel-hero-person"
        src={heroVisual}
        alt="Prime Easy Learn training"
      />


      {/* Main play button */}
      <button
        className="pel-hero-play"
        aria-label="Watch introduction"
      >
        <Play
          size={27}
          fill="currentColor"
        />
      </button>


      {/* Trusted learners card */}
      <div className="pel-trusted-card">

        <span className="pel-trusted-star">✦</span>

        <strong>
          Trusted by
          <br />
          <b>5,000+</b>
          <br />
          Learners
        </strong>

        <div className="pel-trusted-avatars">

          <img src={avatarPriya} alt="" />
          <img src={avatarRahul} alt="" />
          <img src={avatarSneha} alt="" />
          <img src={avatarPriya} alt="" />

        </div>

      </div>


      {/* Benefits floating card */}
      <div className="pel-hero-feature-card">

        <div className="pel-hero-feature">
          <span>
            <Users size={15} />
          </span>
          <b>Practical Training</b>
        </div>

        <div className="pel-hero-feature">
          <span>
            <Laptop size={15} />
          </span>
          <b>Live Projects</b>
        </div>

        <div className="pel-hero-feature">
          <span>
            <BriefcaseBusiness size={15} />
          </span>
          <b>Career Support</b>
        </div>

      </div>

    </div>

  </div>
</section>

        {/* =====================================================
            STATS
            ===================================================== */}

        <section className="pel-stats-wrap">
          <div className="pel-container pel-stats">

            <Stat
              icon={GraduationCap}
              value="5,000+"
              label="Students Trained"
              sub="Growing every day"
            />

            <Stat
              icon={BookOpen}
              value="40+"
              label="Courses"
              sub="Across in-demand domains"
            />

            <Stat
              icon={Users}
              value="25+"
              label="Expert Trainers"
              sub="Industry professionals"
            />

            <Stat
              icon={BarChart3}
              value="95%"
              label="Completion Rate"
              sub="Our learners succeed"
            />

          </div>
        </section>

        {/* =====================================================
            COURSES
            ===================================================== */}

        <section
          className="pel-section pel-courses"
          id="courses"
        >
          <div className="pel-container">

            <div className="pel-section-head">

              <h2>
                <span>Newly Launched</span> Courses
              </h2>

              <a href="#courses">
                View All Courses
                <ArrowRight size={15} />
              </a>

            </div>

            <div className="pel-course-grid">

              {visibleCourses.map((course) => (
                <article
                  className="pel-course-card"
                  key={course.title}
                >

                  <div className="pel-course-image">

                    <img
                      src={course.image || course.thumbnail?.url || courseWeb}
                      alt={course.title}
                    />

                    <span>
                      {course.category}
                    </span>

                  </div>

                  <div className="pel-course-body">

                    <h3>
                      {course.title}
                    </h3>

                    <p>
                      {course.description}
                    </p>

                    <div className="pel-course-meta">

                      <span>
                        <Clock3 size={14} />
                        {course.meta}
                      </span>

                      <span className="rating">
                        <Star
                          size={14}
                          fill="currentColor"
                        />
                        {course.rating}
                      </span>

                      <strong>
                        {course.price}
                      </strong>

                    </div>

                    <Link
                      className="pel-course-btn"
                      to="/login/student"
                    >
                      View Course
                      <ArrowRight size={14} />
                    </Link>

                  </div>

                </article>
              ))}

            </div>
          </div>
        </section>

        {/* =====================================================
            TRAINER
            ===================================================== */}

        <section
          className="pel-trainer"
          id="about"
        >
          <div className="pel-container pel-trainer__grid">

            <div className="pel-trainer__image">

              <img
                src={trainerVisual}
                alt="Prime Easy Learn trainer"
              />

            </div>

            <div className="pel-trainer__copy">

              <span className="pel-mini-label">
                MEET YOUR TRAINER
              </span>

              <h2>
                Learn From{" "}
                <span>
                  Experience
                </span>
              </h2>

              <p>
                With years of industry experience and a passion
                for teaching, our trainer has helped thousands
                of learners build successful careers in tech
                and digital skills.
              </p>

              <div className="pel-trainer-stats">

                <span>
                  <Clock3 />

                  <b>
                    8+
                    <small>
                      Years of Experience
                    </small>
                  </b>
                </span>

                <span>
                  <Users />

                  <b>
                    5,000+
                    <small>
                      Students Trained
                    </small>
                  </b>
                </span>

                <span>
                  <BriefcaseBusiness />

                  <b>
                    Industry
                    <small>
                      Professional
                    </small>
                  </b>
                </span>

              </div>

              <Link
                className="pel-btn pel-btn--orange"
                to="/login/student"
              >
                Know More
                <ArrowRight size={17} />
              </Link>

            </div>

            <div className="pel-quote">

              <span>“</span>

              <p>
                "My goal is to make quality education accessible
                to everyone and help you achieve your career dreams."
              </p>

              <i>
                — Trainer
              </i>

            </div>

          </div>
        </section>

        {/* =====================================================
            VIDEOS
            ===================================================== */}

        <section
          className="pel-section pel-videos"
          id="resources"
        >
          <div className="pel-container">

            <div className="pel-section-head pel-section-head--video">

              <h2>
                <span>Watch</span> &amp; Learn

                <small>
                  Explore our videos, tutorials and success stories.
                </small>
              </h2>

              <a href="#resources">
                View More Videos
                <ArrowRight size={15} />
              </a>

            </div>

            <div className="pel-video-grid">

              {visibleVideos.map(
                ([title, duration, image], i) => (
                  <article
                    className={
                      i === 0
                        ? "pel-video pel-video--large"
                        : "pel-video"
                    }
                    key={title}
                  >

                    <img
                      src={image}
                      alt={title}
                    />

                    <div className="pel-video-overlay">

                      {i === 0 && (
                        <strong>
                          {title}
                        </strong>
                      )}

                      <span className="pel-video-play">
                        <Play
                          size={17}
                          fill="currentColor"
                        />
                      </span>

                      <small>
                        {duration}
                      </small>

                    </div>

                    {i !== 0 && (
                      <b>
                        {title}
                      </b>
                    )}

                  </article>
                )
              )}

            </div>
          </div>
        </section>

        {/* =====================================================
            STUDENT STORIES
            ===================================================== */}

        <section
          className="pel-section pel-stories"
          id="stories"
        >
          <div className="pel-container">

            <div className="pel-section-head pel-section-head--stack">

              <div>

                <h2>
                  <span>What Our Students</span> Say
                </h2>

                <p>
                  Real stories. Real growth. Real careers.
                </p>

              </div>

            </div>

            <div className="pel-testimonials">

              {visibleTestimonials.map((item) => (
                <article
                  className="pel-testimonial"
                  key={item.name}
                >

                  <img
                    src={item.avatar || avatarPriya}
                    alt={item.name}
                  />

                  <div>

                    <h3>
                      {item.name}
                    </h3>

                    <span>
                      {item.course}
                    </span>

                    <div className="pel-stars">
                      ★★★★★
                    </div>

                    <p>
                      “{item.text}”
                    </p>

                  </div>

                  <b className="pel-quote-mark">
                    “
                  </b>

                </article>
              ))}

            </div>

          </div>
        </section>

        {/* =====================================================
            WHY CHOOSE
            ===================================================== */}

        <section
          className="pel-section pel-why"
          id="why"
        >
          <div className="pel-container">

            <div className="pel-section-head">

              <h2>
                <span>Why Choose</span>{" "}
                Prime Easy Learn?
              </h2>

              <a href="#contact">
                More Than Learning. A Brighter Future.
                <ArrowRight size={15} />
              </a>

            </div>

            <div className="pel-why-grid">

              {[
                [
                  Laptop,
                  "Live Practical Training",
                  "Learn by doing real projects",
                ],
                [
                  FolderKanban,
                  "Industry Projects",
                  "Build a strong portfolio",
                ],
                [
                  Users,
                  "Expert Trainers",
                  "Learn from industry experts",
                ],
                [
                  Award,
                  "Certificates",
                  "Get certified & stand out",
                ],
                [
                  BriefcaseBusiness,
                  "Placement Guidance",
                  "Career support & opportunities",
                ],
                [
                  Clock3,
                  "Flexible Learning",
                  "Learn at your own pace",
                ],
              ].map(
                ([Icon, title, text]) => (
                  <article key={title}>

                    <span>
                      <Icon size={23} />
                    </span>

                    <div>

                      <b>
                        {title}
                      </b>

                      <small>
                        {text}
                      </small>

                    </div>

                  </article>
                )
              )}

            </div>
          </div>
        </section>

        {/* =====================================================
            FINAL CTA
            ===================================================== */}

        <section
          className="pel-final-cta"
          id="contact"
        >
          <div className="pel-container">

            <div className="pel-final-rocket">
              <Rocket size={43} />
            </div>

            <div>

              <h2>
                Ready to start learning?
              </h2>

              <p>
                Join thousands of learners and take the
                next step towards your dream career.
              </p>

            </div>

            <div className="pel-final-actions">

              <Link
                className="pel-btn pel-btn--orange"
                to="/login/student"
              >
                Browse All Courses
                <ArrowRight size={16} />
              </Link>

              <Link
                className="pel-btn pel-btn--outline"
                to="/login/student"
              >
                Login as Student
              </Link>

            </div>

            <div className="pel-final-note">
              Your
              <br />
              Future
              <br />
              <span>
                Starts Here!
              </span>
            </div>

          </div>
        </section>

      </main>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="pel-footer">

        <div className="pel-container pel-footer__grid">

          <div className="pel-footer-brand">

            <img
              src={cms.logo?.url || logoReference}
              alt="Prime Easy Learn"
            />

            <p>
              Empowering learners with practical skills,
              <br />
              expert training and real opportunities.
            </p>

          </div>

          <div>

            <h4>
              Quick Links
            </h4>

            <a href="#">
              Home
            </a>

            <a href="#about">
              About Us
            </a>

            <a href="#stories">
              Success Stories
            </a>

            <a href="#resources">
              Resources
            </a>

            <a href="#contact">
              Contact
            </a>

          </div>

          <div>

            <h4>
              Popular Courses
            </h4>

            <a href="#courses">
              Web Development
            </a>

            <a href="#courses">
              Digital Marketing
            </a>

            <a href="#courses">
              UI/UX Design
            </a>

            <a href="#courses">
              Data Analytics
            </a>

            <a href="#courses">
              All Courses
            </a>

          </div>

          <div>

            <h4>
              Support
            </h4>

            <a href="mailto:help@primeeasylearn.com">
              <Mail size={13} />
              {cms.supportEmail || "help@primeeasylearn.com"}
            </a>

            <a href="tel:+919876543210">
              <MessageCircle size={13} />
              {cms.phone || "+91 98765 43210"}
            </a>

            <span>
              <MapPin size={13} />
              {cms.address || "Gaya, Bihar, India"}
            </span>

          </div>

          <div>

            <h4>
              Follow Us
            </h4>

            <div className="pel-socials">

              <a
                href="#"
                aria-label="Facebook"
              >
                <Facebook size={17} />
              </a>

              <a
                href="#"
                aria-label="Instagram"
              >
                <Instagram size={17} />
              </a>

              <a
                href="#"
                aria-label="YouTube"
              >
                <Youtube size={17} />
              </a>

              <a
                href="#"
                aria-label="LinkedIn"
              >
                <Linkedin size={17} />
              </a>

            </div>

          </div>

        </div>

        <div className="pel-container pel-footer-bottom">

          <span>
            © 2026 Prime Easy Learn Training Institute.
            All rights reserved.
          </span>

          <div>

            <a href="#">
              Privacy Policy
            </a>

            <i>|</i>

            <a href="#">
              Terms &amp; Conditions
            </a>

            <i>|</i>

            <a href="#">
              Sitemap
            </a>

          </div>

        </div>

      </footer>

    </div>
  );
}

function EditableLanding({ cms }) {
  const sections = Array.isArray(cms.sections) ? cms.sections : [];
  return <div className="editable-landing" style={{ "--editable-brand": cms.primaryColor || "#1769ff" }}>
    <header className="editable-landing__header"><a href="#top"><img src={cms.logo?.url || logoReference} alt={cms.organization || "Brand"} /><b>{cms.organization || "Prime Easy Learn"}</b></a><nav>{sections.map((section, index) => <a key={`${section.title || section.type}-${index}`} href={`#editable-section-${index}`}>{section.navLabel || section.title || section.type}</a>)}</nav><Link to="/login/student">Learner login</Link></header>
    <main id="top">{sections.map((section, index) => <section className={`editable-landing__section editable-landing__section--${section.type || "content"}`} id={`editable-section-${index}`} key={`${section.type}-${index}`}>
      <div className="editable-landing__inner">
        {section.image && <img className="editable-landing__image" src={section.image} alt={section.imageAlt || ""} />}
        <div className="editable-landing__copy">{section.eyebrow && <span>{section.eyebrow}</span>}{section.title && <h1>{section.title}</h1>}{section.description && <p>{section.description}</p>}{section.ctaText && <a className="editable-landing__cta" href={section.ctaHref || "/login/student"}>{section.ctaText}</a>}</div>
        {section.video && <video className="editable-landing__video" src={section.video} poster={section.videoPoster || section.image} controls preload="metadata" />}
        {Array.isArray(section.items) && <div className="editable-landing__items">{section.items.map((item, itemIndex) => <article key={`${item.title || item.name}-${itemIndex}`}>{item.image && <img src={item.image} alt={item.title || ""} />}{item.video && <video src={item.video} poster={item.image} controls preload="metadata" />}{item.title && <h2>{item.title}</h2>}{item.name && !item.title && <h2>{item.name}</h2>}{item.description && <p>{item.description}</p>}{item.text && <p>{item.text}</p>}{item.meta && <small>{item.meta}</small>}{item.price && <strong>{item.price}</strong>}{item.ctaText && <a className="editable-landing__cta" href={item.ctaHref || "/login/student"}>{item.ctaText}</a>}</article>)}</div>}
      </div>
    </section>)}</main>
    <footer className="editable-landing__footer">{cms.footerDescription || cms.organization || "Prime Easy Learn"}{cms.supportEmail && <a href={`mailto:${cms.supportEmail}`}>{cms.supportEmail}</a>}{cms.phone && <a href={`tel:${cms.phone}`}>{cms.phone}</a>}</footer>
  </div>;
}

export default LandingPage;
