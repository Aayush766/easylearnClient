import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useAuth from "../../context/useAuth";
import useBranding from "../../context/BrandingContext";
import "./LoginPage.css";
import "./PasswordReset.css";

function LoginPage() {
  const { content: branding } = useBranding();
  const { portal = "student" } = useParams();

const isTrainer = portal === "trainer";
  const isAdmin = portal === "admin" || portal === "superadmin";
  const expectedRole = portal === "superadmin" ? "SUPER_ADMIN" : portal === "admin" ? "ADMIN" : isTrainer ? "TRAINER" : "LEARNER";
  const role = isAdmin ? expectedRole.toLowerCase() : isTrainer ? "trainer" : "student";
const label = isAdmin ? (portal === "superadmin" ? "Super Admin" : "Administrator") : isTrainer ? "Trainer" : "Student";
  const navigate = useNavigate();
  const { login: authenticate } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetStep, setResetStep] = useState("email");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetNotice, setResetNotice] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetBusy, setResetBusy] = useState(false);

  const requestJson = async (path, payload) => {
    let response;
    try {
      response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } catch {
      throw new Error("Password reset service is unavailable. Connect the authentication API and email OTP provider to continue.");
    }
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "The password reset request could not be completed.");
    return result;
  };

  const sendOtp = async (event) => {
    event.preventDefault(); setResetError(""); setResetNotice("");
    if (!email.trim()) { setResetError("Enter your account email address."); return; }
    setResetBusy(true);
    try {
      const result = await requestJson("/api/auth/forgot-password", { email: email.trim(), role });
      setResetStep("otp"); setResetNotice(result.message || `If an account exists for ${email.trim()}, a one-time code has been sent to that email.`);
    } catch (error) { setResetError(error.message); }
    finally { setResetBusy(false); }
  };

  const verifyOtp = async (event) => {
    event.preventDefault(); setResetError(""); setResetNotice("");
    if (!otp.trim()) { setResetError("Enter the one-time code from your email."); return; }
    setResetBusy(true);
    try {
      const result = await requestJson("/api/auth/verify-otp", { email: email.trim(), role, otp: otp.trim() });
      if (result.verified !== true && !result.resetToken) throw new Error("The verification code could not be confirmed. Check it and try again.");
      setResetToken(result.resetToken || ""); setResetStep("password"); setResetNotice("Code verified. Create your new password.");
    } catch (error) { setResetError(error.message); }
    finally { setResetBusy(false); }
  };

  const resetPassword = async (event) => {
    event.preventDefault(); setResetError(""); setResetNotice("");
    if (newPassword.length < 8) { setResetError("Use at least 8 characters for your new password."); return; }
    if (newPassword !== confirmPassword) { setResetError("The new password and confirmation do not match."); return; }
    setResetBusy(true);
    try {
      const result = await requestJson("/api/auth/reset-password", { email: email.trim(), role, otp: otp.trim(), resetToken, newPassword, confirmPassword });
      setResetNotice(result.message || "Your password has been reset. You can now sign in with the new password."); setResetStep("complete"); setNewPassword(""); setConfirmPassword("");
    } catch (error) { setResetError(error.message); }
    finally { setResetBusy(false); }
  };

  const [loginBusy, setLoginBusy] = useState(false);
  const login = async (event) => {
    event.preventDefault(); setLoginError("");
    if (!email.trim() || !password) { setLoginError("Enter both your email address and password."); return; }
    setLoginBusy(true);
    try {
      const user = await authenticate(email.trim(), password, expectedRole);
      if (!user || user.role !== expectedRole) throw new Error("This account does not have access to the selected portal.");
      navigate(isAdmin ? "/admin/certificate-templates" : isTrainer ? "/trainer" : "/student", { replace: true });
    } catch (error) { setLoginError(error.message || "Unable to sign in. Check your details and try again."); }
    finally { setLoginBusy(false); }
  };

  return (
    <main className="pel-auth">
      <div className="pel-auth__orb pel-auth__orb--one" />
      <div className="pel-auth__orb pel-auth__orb--two" />

      <section className="pel-auth__intro">
        <div className="pel-auth__intro-inner">
          <Link className="pel-auth-brand" to="/">
            {branding.logo?.url ? <img className="pel-auth-brand__custom-logo" src={branding.logo.url} alt={branding.organization || "Brand"} /> : <span className="pel-auth-brand__mark">
              <span />
            </span>}
            <span className="pel-auth-brand__text">
              <strong>{branding.organization || "Prime Easy Learn"}</strong>
              <small>Training Institute</small>
            </span>
          </Link>

          <div className="pel-auth__hero-copy">
            <span className="pel-auth__eyebrow">
              <Sparkles size={13} /> Learn. Assess. Improve.
            </span>

            <h1>
              Your next
              <br />
              <span>achievement</span>
              <br />
              starts here.
            </h1>

            <p>
              {isTrainer
                ? "Manage your courses, guide learners, and make every training session count."
                : "Access practical courses, track your progress, and celebrate every milestone."}
            </p>

            <div className="pel-auth__benefits">
              <div>
                <CheckCircle2 />
                <span>
                  <b>Practical learning</b>
                  Real-world skills
                </span>
              </div>
              <div>
                <CheckCircle2 />
                <span>
                  <b>Expert support</b>
                  Learn with confidence
                </span>
              </div>
              <div>
                <CheckCircle2 />
                <span>
                  <b>Track progress</b>
                  See your growth
                </span>
              </div>
            </div>
          </div>

          <div className="pel-auth__floating-card">
            <span className="pel-auth__floating-icon">
              {isTrainer ? <Users size={19} /> : <GraduationCap size={19} />}
            </span>
            <div>
              <strong>{isTrainer ? "Train with impact" : "Keep learning"}</strong>
              <small>{isTrainer ? "Empower your learners" : "Build your future"}</small>
            </div>
            <span className="pel-auth__floating-check">✓</span>
          </div>

          <Link className="pel-auth__back" to="/">
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </div>
      </section>

      <section className="pel-auth__form-area">
        <div className="pel-auth__card">
          <div className="pel-auth__card-top">
            <span className={`pel-auth__role-icon ${isTrainer ? "trainer" : ""}`}>
              {isTrainer ? <Users size={22} /> : <GraduationCap size={22} />}
            </span>
            <span className="pel-auth__secure">
              <ShieldCheck size={14} /> Secure Login
            </span>
          </div>

          <div className="pel-auth__heading">
            <span className="pel-auth__small-label">WELCOME BACK</span>
            <h2>Login as {label}</h2>
            <p>
              {isTrainer
                ? "Sign in to access your trainer dashboard."
                : "Enter your details to continue to your learning space."}
            </p>
          </div>

          <form onSubmit={login} className="pel-auth__form">
            <label className="pel-field">
              <span>Email address</span>
              <div className="pel-field__input">
                <Mail size={17} />
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </label>

            <label className="pel-field">
              <span>Password</span>
              <div className="pel-field__input">
                <LockKeyhole size={17} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="pel-password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>

            <div className="pel-auth__form-row">
              <label className="pel-remember">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <button type="button" className="pel-auth__forgot" onClick={() => { setResetStep("email"); setResetError(""); setResetNotice(""); setForgotOpen(true); }}>Forgot password?</button>
            </div>

            {loginError && <p className="pel-auth__error" role="alert">{loginError}</p>}
            <button className="pel-auth__submit" type="submit" disabled={loginBusy}>
              <span>{loginBusy ? "Signing in…" : `Login to ${label} Portal`}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {forgotOpen && <div className="pel-reset-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setForgotOpen(false); }}><section className="pel-reset-dialog" role="dialog" aria-modal="true" aria-labelledby="pel-reset-title"><button type="button" className="pel-reset-close" aria-label="Close password reset" onClick={() => setForgotOpen(false)}>×</button><span className="pel-reset-icon"><ShieldCheck size={20} /></span><h2 id="pel-reset-title">{resetStep === "email" ? "Reset your password" : resetStep === "otp" ? "Check your email" : resetStep === "password" ? "Create a new password" : "Password updated"}</h2><p className="pel-reset-copy">{resetStep === "email" ? "Enter the email address for your account. We’ll send a one-time code if the reset service is available." : resetStep === "otp" ? `Enter the verification code sent to ${email}.` : resetStep === "password" ? "Choose a new password and confirm it below." : "Your new password is ready to use."}</p>{resetNotice && <p className="pel-reset-notice" role="status">{resetNotice}</p>}{resetError && <p className="pel-reset-error" role="alert">{resetError}</p>}{resetStep === "email" && <form onSubmit={sendOtp}><label className="pel-reset-field">Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label><button className="pel-auth__submit" type="submit" disabled={resetBusy}>{resetBusy ? "Sending…" : "Send verification code"}<ArrowRight size={17} /></button></form>}{resetStep === "otp" && <form onSubmit={verifyOtp}><label className="pel-reset-field">One-time code<input inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(event) => setOtp(event.target.value)} required /></label><button className="pel-auth__submit" type="submit" disabled={resetBusy}>{resetBusy ? "Verifying…" : "Verify code"}<ArrowRight size={17} /></button><button type="button" className="pel-reset-link" onClick={() => { setResetStep("email"); setResetNotice(""); }}>Change email or request another code</button></form>}{resetStep === "password" && <form onSubmit={resetPassword}><label className="pel-reset-field">New password<input type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></label><label className="pel-reset-field">Confirm new password<input type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></label><button className="pel-auth__submit" type="submit" disabled={resetBusy}>{resetBusy ? "Updating…" : "Reset password"}<ArrowRight size={17} /></button></form>}{resetStep === "complete" && <button className="pel-auth__submit" type="button" onClick={() => setForgotOpen(false)}>Back to login<CheckCircle2 size={17} /></button>}</section></div>}

          <div className="pel-auth__divider">
            <span>or</span>
          </div>

          <p className="pel-auth__switch">
            Looking for a different portal?{" "}
            {isAdmin ? <Link to="/login/student">Learner login</Link> : <Link to={`/login/${isTrainer ? "student" : "trainer"}`}>Login as {isTrainer ? "Student" : "Trainer"}</Link>}
            {!isAdmin && <> · <Link to="/login/admin">Admin login</Link> · <Link to="/login/superadmin">Super admin</Link></>}
          </p>

          <div className="pel-auth__privacy">
            <ShieldCheck size={13} />
            <span>Your account information is protected and securely handled.</span>
          </div>
        </div>

        <p className="pel-auth__copyright">
          © 2026 {branding.organization || "Prime Easy Learn Training Institute"}
        </p>
      </section>
    </main>
  );
}

export default LoginPage;
