import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, BookOpen, CheckCheck, ChevronRight, Headphones, MessageSquare, Plus, Search, Send, UserRound, X } from "lucide-react";
import api from "../services/api";
import StudentLayout from "./StudentLayout";
import useAuth from "../context/useAuth";
import herostudent from "../public/assets/student/hero-student.png";
import studentAvatar from "../assets/student/avatar.png";
import "./StudentMessages.css";
import "./StudentMessagesCompose.css";

const userIdOf = (value) => String(value?._id || value?.id || value || "");
const messageTime = (value) => value ? new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(value)) : "";
const messageDay = (value) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value)) : "";

function MessagesHeader() {
  return <section className="messages-page-header"><div className="messages-page-heading"><h1>Messages</h1><p>Ask questions and connect with trainers assigned to your courses.</p></div><div className="messages-banner"><div className="messages-banner-copy">Questions<br />today<br />Better learning<br />tomorrow.</div><div className="messages-banner-person"><img src={herostudent} alt="" /></div><div className="messages-banner-right">Your trainers<br />are here<br />to help!</div><span className="messages-banner-line messages-banner-line--left" /><span className="messages-banner-line messages-banner-line--right" /></div></section>;
}

function TrainerAvatar({ trainer }) {
  const initials = (trainer.name || "Trainer").split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  return <div className="messages-conversation-avatar">{trainer.profileImage?.url ? <img src={trainer.profileImage.url} alt="" /> : <span className="messages-avatar-initials">{initials}</span>}</div>;
}

function ConversationList({ conversations, selectedId, onSelect, onNewMessage, loading }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => conversations.filter((item) => (!search || `${item.name} ${item.course} ${item.preview}`.toLowerCase().includes(search.toLowerCase())) && (filter !== "unread" || item.unread > 0)), [conversations, filter, search]);
  return <aside className="messages-conversations"><button type="button" className="messages-new-button" onClick={onNewMessage} disabled={!conversations.length}><Plus size={20} /><span>New Message</span></button><div className="messages-tabs"><button type="button" className={filter === "all" ? "messages-tab messages-tab--active" : "messages-tab"} onClick={() => setFilter("all")}>All</button><button type="button" className={filter === "unread" ? "messages-tab messages-tab--active" : "messages-tab"} onClick={() => setFilter("unread")}>Unread</button></div><label className="messages-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search trainers or courses..." />{search && <button type="button" aria-label="Clear search" onClick={() => setSearch("")}><X size={14} /></button>}</label><div className="messages-conversation-list">{loading ? <div className="messages-empty">Loading conversations…</div> : filtered.length ? filtered.map((item) => <button type="button" key={item.id} className={selectedId === item.id ? "conversation-item conversation-item--active" : "conversation-item"} onClick={() => onSelect(item.id)}><TrainerAvatar trainer={item} /><div className="conversation-content"><div className="conversation-top"><strong>{item.name}</strong><span>{item.time}</span></div><small>{item.course || "Assigned trainer"}</small><div className="conversation-bottom"><p>{item.preview}</p>{item.unread > 0 && <span className="conversation-unread">{item.unread}</span>}</div></div></button>) : <div className="messages-empty"><UserRound size={24} /><p>{search ? "No matching trainer found." : "No trainer is assigned to your active courses yet."}</p></div>}</div></aside>;
}

function ChatHeader({ conversation }) {
  const initials = (conversation.name || "Trainer").split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  return <header className="messages-chat-header"><div className="chat-person"><div className="chat-person-avatar"><span className="messages-avatar-initials">{initials}</span><span /></div><div><h2><i />{conversation.name}</h2><p><span />{conversation.courses?.map((course) => course.title).join(" · ") || "Your assigned trainer"}</p></div></div><div className="chat-header-actions"><Link to="/student/courses" aria-label="View my courses" title="View my courses"><BookOpen size={18} /></Link></div></header>;
}

function ChatMessage({ message, isMine }) {
  return <div className={isMine ? "message-row message-row--student" : "message-row message-row--trainer"}>{!isMine && <div className="message-avatar-small"><span className="messages-avatar-initials">{(message.senderId?.name || "T").split(/\s+/).map((word) => word[0]).slice(0, 2).join("")}</span></div>}{isMine && <div className="message-avatar-small message-avatar-small--student"><img src={studentAvatar} alt="You" /></div>}<div className="message-body"><div className={isMine ? "message-bubble message-bubble--student" : "message-bubble message-bubble--trainer"}>{message.body}</div><div className="message-meta"><span>{messageTime(message.createdAt)}</span>{isMine && <CheckCheck size={15} className="message-read" aria-label={message.readAt ? "Read" : "Sent"} />}</div></div></div>;
}

function ChatPanel({ conversation, messages, onSend, sending, currentUserId, error }) {
  const [text, setText] = useState("");
  const listRef = useRef(null);
  useEffect(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, [messages, conversation.id]);
  const submit = async (event) => { event?.preventDefault(); const value = text.trim(); if (!value || sending) return; const sent = await onSend(value); if (sent) setText(""); };
  return <section className="messages-chat"><ChatHeader conversation={conversation} /><div className="messages-chat-body" ref={listRef}>{messages.length ? <><div className="chat-date">{messageDay(messages[0]?.createdAt)}</div><div className="messages-list">{messages.map((item) => <ChatMessage key={item._id} message={item} isMine={userIdOf(item.senderId) === currentUserId} />)}</div></> : <div className="messages-empty messages-empty--chat"><MessageSquare size={25} /><p>Start a conversation with {conversation.name} about your course.</p></div>}</div>{error && <p className="messages-error" role="alert">{error}</p>}<form className="message-composer" onSubmit={submit}><input value={text} onChange={(event) => setText(event.target.value)} placeholder={`Message ${conversation.name}...`} aria-label="Message" maxLength={5000} /><button className="composer-send" type="submit" aria-label="Send message" disabled={!text.trim() || sending}>{sending ? "…" : <Send size={19} />}</button></form></section>;
}

function TrainerProfile({ conversation }) {
  return <aside className="messages-profile"><div className="profile-person"><div className="profile-avatar"><span className="messages-avatar-initials">{(conversation.name || "T").split(/\s+/).map((word) => word[0]).slice(0, 2).join("")}</span></div><div><h2>{conversation.name}</h2><p>Assigned course trainer</p></div></div><div className="profile-section"><h3>Courses together</h3>{conversation.courses?.length ? conversation.courses.map((course) => <p key={course.id}>{course.title}</p>) : <p>This trainer is assigned to your enrolled course.</p>}</div><div className="profile-divider" /><div className="profile-section"><h3>Quick Actions</h3><div className="quick-actions"><Link to="/student/courses"><BookOpen size={19} /><span>View my courses</span></Link><Link to="/student/support"><Headphones size={19} /><span>Contact support</span></Link></div></div></aside>;
}

export default function StudentMessages() {
  const { user } = useAuth();
  const currentUserId = userIdOf(user);
  const [conversations, setConversations] = useState([]);
  const [threads, setThreads] = useState({});
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeRecipient, setComposeRecipient] = useState("");
  const [composeText, setComposeText] = useState("");

  const loadConversations = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const { trainers = [] } = await api.get("/api/learner/trainers");
      const results = await Promise.all(trainers.map(async (trainer) => {
        const data = await api.get("/api/learner/messages", { params: { withUserId: trainer._id, limit: 100 } });
        return { trainer, messages: data.items || [] };
      }));
      const rows = results.map(({ trainer, messages }) => {
        const unread = messages.filter((message) => userIdOf(message.recipientId) === currentUserId && !message.readAt).length;
        const latest = messages[messages.length - 1];
        return { ...trainer, id: trainer._id, role: "Assigned trainer", subtitle: trainer.courses?.map((course) => course.title).join(", ") || "Assigned trainer", course: trainer.courses?.[0]?.title || "Assigned trainer", preview: latest?.body || "No messages yet", time: messageTime(latest?.createdAt), unread, messages };
      });
      setConversations(rows);
      setThreads(Object.fromEntries(rows.map((row) => [row.id, row.messages])));
      setSelectedId((previous) => rows.some((row) => row.id === previous) ? previous : rows[0]?.id || "");
      setError("");
    } catch (loadError) { setError(loadError.message || "Could not load your assigned trainers."); }
    finally { if (isInitial) setLoading(false); }
  }, [currentUserId]);

  useEffect(() => { loadConversations(true); const timer = window.setInterval(() => loadConversations(false), 15000); return () => window.clearInterval(timer); }, [loadConversations]);

  const loadThread = useCallback(async (trainerId) => {
    try {
      const data = await api.get("/api/learner/messages", { params: { withUserId: trainerId, limit: 100 } });
      setThreads((current) => ({ ...current, [trainerId]: data.items || [] }));
      await api.patch("/api/learner/messages/read", { withUserId: trainerId });
      setConversations((current) => current.map((item) => item.id === trainerId ? { ...item, unread: 0 } : item));
    } catch (loadError) { setError(loadError.message || "Could not load this conversation."); }
  }, []);
  useEffect(() => { if (selectedId) loadThread(selectedId); }, [selectedId, loadThread]);

  const sendMessage = async (recipientId, body) => {
    setSending(true); setError("");
    try { await api.post("/api/learner/messages", { recipientId, body }); await loadConversations(false); await loadThread(recipientId); return true; }
    catch (sendError) { setError(sendError.message || "Message could not be sent."); return false; }
    finally { setSending(false); }
  };
  const currentConversation = conversations.find((item) => item.id === selectedId);
  const submitNewMessage = async (event) => { event.preventDefault(); if (!composeRecipient || !composeText.trim()) return; const sent = await sendMessage(composeRecipient, composeText.trim()); if (sent) { setSelectedId(composeRecipient); setComposeText(""); setComposeOpen(false); } };

  return <StudentLayout><div className="student-messages"><main className="messages-main"><MessagesHeader /><div className="messages-workspace"><ConversationList conversations={conversations} selectedId={selectedId} onSelect={setSelectedId} onNewMessage={() => { setComposeRecipient(conversations[0]?.id || ""); setComposeOpen(true); }} loading={loading} />{currentConversation ? <ChatPanel key={selectedId} conversation={currentConversation} messages={threads[selectedId] || []} onSend={(body) => sendMessage(selectedId, body)} sending={sending} currentUserId={currentUserId} error={error} /> : <section className="messages-chat"><div className="messages-empty messages-empty--chat"><UserRound size={30} /><h2>{loading ? "Loading your trainers…" : "No assigned trainer yet"}</h2><p>{loading ? "" : "Your course trainer will appear here when one is assigned to your enrollment."}</p><Link to="/student/support">Contact support</Link></div></section>}{currentConversation && <TrainerProfile conversation={currentConversation} />}</div></main></div>{composeOpen && <div className="messages-compose-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setComposeOpen(false); }}><form className="messages-compose-dialog" onSubmit={submitNewMessage}><div className="messages-compose-heading"><div><span>NEW MESSAGE</span><h2>Message your trainer</h2></div><button type="button" aria-label="Close new message" onClick={() => setComposeOpen(false)}><X size={19} /></button></div><label>Assigned trainer<select value={composeRecipient} onChange={(event) => setComposeRecipient(event.target.value)} required>{conversations.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.course}</option>)}</select></label><label>Your message<textarea autoFocus value={composeText} onChange={(event) => setComposeText(event.target.value)} placeholder="Write a message..." rows={4} required maxLength={5000} /></label><button type="submit" className="messages-compose-send" disabled={!composeText.trim() || sending}><Send size={16} /> Send message</button></form></div>}</StudentLayout>;
}
