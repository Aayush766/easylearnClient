import { useCallback, useEffect, useState } from "react";
import { CheckCheck, MessageSquare, Search, Send, UserRound } from "lucide-react";
import api from "../services/api";
import TrainerLayout from "./TrainerLayout";
import useAuth from "../context/useAuth";
import "./TrainerMessages.css";

const idOf = (value) => String(value?._id || value?.id || value || "");
const timeOf = (date) => date ? new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(date)) : "";

export default function TrainerMessages() {
  const { user } = useAuth();
  const selfId = idOf(user);
  const [learners, setLearners] = useState([]);
  const [threads, setThreads] = useState({});
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async (initial = false) => {
    try {
      if (initial) setLoading(true);
      const { learners: contacts = [] } = await api.get("/api/learner/message-contacts");
      const rows = await Promise.all(contacts.map(async (learner) => {
        const data = await api.get("/api/learner/messages", { params: { withUserId: learner._id, limit: 100 } });
        return { ...learner, messages: data.items || [] };
      }));
      setLearners(rows);
      setThreads(Object.fromEntries(rows.map((learner) => [learner._id, learner.messages])));
      setSelectedId((current) => rows.some((row) => row._id === current) ? current : rows[0]?._id || "");
      setError("");
    } catch (loadError) { setError(loadError.message || "Could not load learner conversations."); }
    finally { if (initial) setLoading(false); }
  }, []);

  useEffect(() => { refresh(true); const timer = window.setInterval(() => refresh(false), 15000); return () => window.clearInterval(timer); }, [refresh]);
  const selected = learners.find((item) => item._id === selectedId);
  const messages = threads[selectedId] || [];
  const send = async (event) => {
    event.preventDefault();
    const body = text.trim();
    if (!body || !selectedId || sending) return;
    setSending(true); setError("");
    try {
      await api.post("/api/learner/messages", { recipientId: selectedId, body });
      setText("");
      await refresh(false);
      const data = await api.get("/api/learner/messages", { params: { withUserId: selectedId, limit: 100 } });
      setThreads((current) => ({ ...current, [selectedId]: data.items || [] }));
    } catch (sendError) { setError(sendError.message || "Message could not be sent."); }
    finally { setSending(false); }
  };
  const select = async (learnerId) => {
    setSelectedId(learnerId);
    try { const data = await api.get("/api/learner/messages", { params: { withUserId: learnerId, limit: 100 } }); setThreads((current) => ({ ...current, [learnerId]: data.items || [] })); await api.patch("/api/learner/messages/read", { withUserId: learnerId }); }
    catch (loadError) { setError(loadError.message || "Could not load this conversation."); }
  };
  const filtered = learners.filter((learner) => `${learner.name} ${learner.courses.map((course) => course.title).join(" ")}`.toLowerCase().includes(search.toLowerCase()));

  return <TrainerLayout><main className="trainer-messages"><header><div><span>LEARNER SUPPORT</span><h1>Messages</h1><p>Respond to learners enrolled in your assigned courses.</p></div></header>{error && <div className="trainer-messages__error" role="alert">{error}</div>}<section className="trainer-messages__workspace"><aside className="trainer-messages__contacts"><label><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search learners" /></label>{loading ? <p className="trainer-messages__empty">Loading learners…</p> : filtered.length ? filtered.map((learner) => { const thread = threads[learner._id] || []; const latest = thread[thread.length - 1]; const unread = thread.filter((item) => idOf(item.recipientId) === selfId && !item.readAt).length; return <button type="button" key={learner._id} className={selectedId === learner._id ? "is-active" : ""} onClick={() => select(learner._id)}><span className="trainer-messages__avatar">{learner.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("")}</span><span className="trainer-messages__contact-copy"><b>{learner.name}</b><small>{latest?.body || learner.courses[0]?.title || "Enrolled learner"}</small></span><time>{timeOf(latest?.createdAt)}</time>{unread > 0 && <i>{unread}</i>}</button>; }) : <p className="trainer-messages__empty">No learners are currently enrolled in your assigned courses.</p>}</aside><section className="trainer-messages__chat">{selected ? <><header><span className="trainer-messages__avatar"><UserRound size={18} /></span><div><b>{selected.name}</b><small>{selected.courses.map((course) => course.title).join(" · ")}</small></div></header><div className="trainer-messages__thread">{messages.length ? messages.map((message) => { const mine = idOf(message.senderId) === selfId; return <article key={message._id} className={mine ? "is-mine" : ""}><p>{message.body}</p><small>{timeOf(message.createdAt)} {mine && <CheckCheck size={13} />}</small></article>; }) : <div className="trainer-messages__empty"><MessageSquare size={22} /><p>No messages yet. Start the conversation with {selected.name}.</p></div>}</div><form onSubmit={send}><input value={text} onChange={(event) => setText(event.target.value)} placeholder={`Message ${selected.name}...`} maxLength={5000} /><button type="submit" disabled={!text.trim() || sending} aria-label="Send message"><Send size={18} /></button></form></> : <div className="trainer-messages__empty"><MessageSquare size={25} /><p>Select a learner to view messages.</p></div>}</section></section></main></TrainerLayout>;
}
