import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Camera, CheckCircle2, KeyRound, Save, ShieldCheck, UserRound } from "lucide-react";
import StudentLayout from "./StudentLayout";
import studentAvatar from "../assets/student/avatar.png";
import "./StudentProfile.css";
import useAuth from "../context/useAuth";
import api from "../services/api";
import { uploadToCloudinary } from "../services/cloudinary";

const PROFILE_KEY = "student-profile-details";
const PHOTO_KEY = "student-profile-picture";
const FIRST_LOGIN_KEY = "student-first-login-complete";
const INITIAL_PROFILE = { name: "Aayush Kumar", email: "aayush@example.com", phone: "", location: "", about: "" };

function getProfile() {
  try { return { ...INITIAL_PROFILE, ...(JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}")) }; }
  catch { return INITIAL_PROFILE; }
}

export default function StudentProfile() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const initializedUserId = useRef(null);
  const firstLogin = searchParams.get("firstLogin") === "1" && localStorage.getItem(FIRST_LOGIN_KEY) !== "true";
  const [profile, setProfile] = useState(getProfile);
  const [savedProfile, setSavedProfile] = useState(getProfile);
  const [photo, setPhoto] = useState(() => localStorage.getItem(PHOTO_KEY) || studentAvatar);
  const [profileImage, setProfileImage] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (initializedUserId.current === user._id) return;
    initializedUserId.current = user._id;
    const current = { name: user.name || "", email: user.email || "", phone: user.phone || "", location: user.profile?.location || "", about: user.profile?.bio || "" };
    setProfile(current); setSavedProfile(current); setPhoto(user.profileImage?.url || studentAvatar); setProfileImage(user.profileImage || null);
  }, [user]);

  useEffect(() => {
    if (firstLogin) setNotice("Welcome! Finish setting up your account by creating a new password and confirming your profile.");
  }, [firstLogin]);

  const choosePhoto = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Choose a JPG, PNG, or other image file."); return; }
    if (file.size > 2 * 1024 * 1024) { setError("Profile pictures must be 2 MB or smaller."); return; }
    setSaving(true); setError(""); setNotice("");
    uploadToCloudinary(file, "prime-easy-learn/profiles").then(async (image) => {
      setPhoto(image.url); setProfileImage(image);
      const result = await api.patch(`/api/users/${user._id}`, { profileImage: { publicId: image.publicId, url: image.url } });
      setUser(result.user);
      setPhoto(result.user.profileImage?.url || image.url);
      setProfileImage(result.user.profileImage || image);
      localStorage.setItem(PHOTO_KEY, result.user.profileImage?.url || image.url);
      setNotice("Your profile photo was saved.");
    }).catch((uploadError) => setError(uploadError.message || "Could not save the profile photo.")).finally(() => setSaving(false));
  };

  const save = async (event) => {
    event.preventDefault(); setError(""); setNotice("");
    if (!profile.name.trim() || !profile.email.trim()) { setError("Your name and email address are required."); return; }
    if (firstLogin || newPassword || confirmPassword) {
      if (newPassword.length < 8) { setError("Your new password must be at least 8 characters."); return; }
      if (newPassword !== confirmPassword) { setError("The new password and confirmation do not match."); return; }
    }
    setSaving(true);
    try {
      const payload = { name: profile.name.trim(), phone: profile.phone.trim(), profile: { ...user?.profile, location: profile.location.trim(), bio: profile.about.trim() }, profileImage: profileImage || user?.profileImage || null };
      if (newPassword) payload.password = newPassword;
      const result = await api.patch(`/api/users/${user._id}`, payload);
      setUser(result.user);
      setPhoto(result.user.profileImage?.url || studentAvatar);
      setProfileImage(result.user.profileImage || null);
      if (result.user.profileImage?.url) localStorage.setItem(PHOTO_KEY, result.user.profileImage.url);
      else localStorage.removeItem(PHOTO_KEY);
      const cleanProfile = { ...profile, name: profile.name.trim(), email: user.email };
      setSavedProfile(cleanProfile);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(cleanProfile));
      if (firstLogin) localStorage.setItem(FIRST_LOGIN_KEY, "true");
      setNewPassword(""); setConfirmPassword("");
      window.dispatchEvent(new Event("student-profile-updated"));
      setNotice("Your profile was saved.");
      if (firstLogin) navigate("/student", { replace: true });
    } catch (saveError) {
      setError(saveError.message || "Could not save your profile.");
    } finally { setSaving(false); }
  };

  const cancel = () => {
    setProfile(savedProfile); setPhoto(user?.profileImage?.url || studentAvatar); setProfileImage(user?.profileImage || null); setNewPassword(""); setConfirmPassword(""); setError(""); setNotice("");
  };

  return <StudentLayout><div className="student-profile-page">
    <header className="student-profile-heading"><span>YOUR ACCOUNT</span><h1>{firstLogin ? "Set up your account" : "Profile & settings"}</h1><p>Keep your learner details and account security up to date.</p></header>
    {notice && <div className="student-profile-notice"><CheckCircle2 size={17} />{notice}</div>}
    {error && <div className="student-profile-error" role="alert">{error}</div>}
    <form onSubmit={save} className="student-profile-grid">
      <section className="student-profile-card student-profile-card--identity"><div className="student-profile-avatar"><img src={photo} alt={`${profile.name || "Student"} profile`} /><label title="Upload profile picture"><Camera size={16} /><input type="file" accept="image/*" onChange={choosePhoto} aria-label="Upload profile picture" /></label></div><h2>{profile.name || "Student name"}</h2><p>{profile.email}</p><small><ShieldCheck size={14} /> Student account</small><div className="student-profile-hint">JPG or PNG up to 2 MB. Save your profile to apply a new picture.</div></section>
      <section className="student-profile-card"><div className="student-profile-card-title"><UserRound size={18} /><span><h2>Personal information</h2><p>Details used for your learning profile.</p></span></div><div className="student-profile-fields"><label>Full name<input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} autoComplete="name" required /></label><label>Email address<input type="email" value={user?.email || profile.email} autoComplete="email" readOnly /></label><label>Phone number<input type="tel" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} autoComplete="tel" placeholder="Add a phone number" /></label><label>Location<input value={profile.location} onChange={(event) => setProfile({ ...profile, location: event.target.value })} autoComplete="address-level2" placeholder="City, country" /></label><label className="student-profile-fields__wide">About you<textarea value={profile.about} onChange={(event) => setProfile({ ...profile, about: event.target.value })} placeholder="Add a short introduction" /></label></div></section>
      <section className="student-profile-card student-profile-security"><div className="student-profile-card-title"><KeyRound size={18} /><span><h2>{firstLogin ? "Create your password" : "Change password"}</h2><p>{firstLogin ? "Choose a new password to finish first-time setup." : "Choose a new password for your account."}</p></span></div><div className="student-profile-fields"><label>New password<input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" minLength={8} required={firstLogin} placeholder="At least 8 characters" /></label><label>Confirm new password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={8} required={firstLogin} placeholder="Enter it again" /></label></div><p className="student-profile-security-note">Password updates are validated by the server and stored securely with your account when you save.</p></section>
      <div className="student-profile-actions">{!firstLogin && <button type="button" className="student-profile-cancel" onClick={cancel}>Discard changes</button>}<button type="submit" className="student-profile-save" disabled={saving}><Save size={16} />{saving ? "Saving…" : firstLogin ? "Finish setup" : "Save profile"}</button></div>
    </form>
  </div></StudentLayout>;
}
