import { useEffect, useState } from "react";
import { BarChart3, ClipboardList, CloudUpload } from "lucide-react";
import api from "../services/api";

const REFRESH_INTERVAL_MS = 15_000;

export function useTrainerActivity(limit = 6) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let timer;
    const load = async () => {
      try {
        const result = await api.get("/api/admin/trainer/activity", { params: { limit } });
        if (active) { setItems(result?.items || []); setError(""); }
      } catch (requestError) {
        if (active) setError(requestError.message || "Could not load trainer activity.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    timer = window.setInterval(load, REFRESH_INTERVAL_MS);
    return () => { active = false; window.clearInterval(timer); };
  }, [limit]);

  return { items, loading, error };
}

function describeActivity(item) {
  const metadata = item.metadata || {};
  const assessmentKind = metadata.type === "POST" ? "post" : metadata.type === "PRE" ? "pre" : "module";
  const contentVerb = item.action === "CONTENT_CREATED"
    ? metadata.type === "VIDEO" ? "You uploaded a video" : "You added course content"
    : item.action === "CONTENT_SCHEDULED" ? "You scheduled course content"
      : metadata.type === "VIDEO" ? "You published a video" : "You published course content";
  const assessmentVerb = item.action === "ASSESSMENT_CREATED"
    ? `You created a ${assessmentKind} assessment`
    : `You published a ${assessmentKind} assessment`;
  const title = metadata.title || (item.action === "RESULTS_VIEWED" ? "Assessment results" : "Course activity");
  const detail = item.action === "RESULTS_VIEWED"
    ? `Results · ${metadata.courseTitle || "assigned courses"}`
    : [title, metadata.courseTitle].filter(Boolean).join(" · ");
  const Icon = item.action.startsWith("CONTENT_") ? CloudUpload : item.action.startsWith("ASSESSMENT_") ? ClipboardList : BarChart3;
  const tone = item.action.startsWith("CONTENT_") ? "blue" : item.action.startsWith("ASSESSMENT_") ? "green" : "purple";
  return { title: item.action === "RESULTS_VIEWED" ? "You viewed results" : item.action.startsWith("CONTENT_") ? contentVerb : assessmentVerb, detail, Icon, tone };
}

export function ActivityList({ items, loading, error, emptyMessage = "No activity yet. Upload content, create an assessment, or review results to see activity here." }) {
  if (loading && !items.length) return <div className="trainer-activity-state" role="status">Loading recent activity…</div>;
  if (error && !items.length) return <div className="trainer-activity-state" role="alert">{error}</div>;
  if (!items.length) return <div className="trainer-activity-state">{emptyMessage}</div>;
  return <div className="trainer-timeline" aria-live="polite">
    {items.map(item => {
      const activity = describeActivity(item);
      const timestamp = new Date(item.createdAt);
      const validDate = Number.isNaN(timestamp.getTime()) ? null : timestamp;
      const elapsedMinutes = validDate ? Math.max(0, Math.floor((Date.now() - validDate.getTime()) / 60_000)) : 0;
      const time = !validDate ? "Recently" : elapsedMinutes < 1 ? "Just now" : elapsedMinutes < 60 ? `${elapsedMinutes}m ago` : elapsedMinutes < 1_440 ? `${Math.floor(elapsedMinutes / 60)}h ago` : elapsedMinutes < 10_080 ? `${Math.floor(elapsedMinutes / 1_440)}d ago` : validDate.toLocaleDateString();
      return <p key={item._id}>
        <i className={activity.tone}><activity.Icon /></i>
        <span><b>{activity.title}</b><small>{activity.detail}</small></span>
        <time dateTime={validDate?.toISOString()}>{time}</time>
      </p>;
    })}
    {error && <small className="trainer-activity-update-error" role="status">Live refresh paused: {error}</small>}
  </div>;
}
