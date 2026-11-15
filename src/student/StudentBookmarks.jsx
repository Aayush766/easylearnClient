import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, BookOpen, Clock3, PlayCircle, Search, Trash2 } from "lucide-react";
import StudentLayout from "./StudentLayout";
import { bookmarkId, readBookmarks, subscribeToBookmarks, writeBookmarks } from "./bookmarkStore";
import "./StudentBookmarks.css";

export default function StudentBookmarks() {
  const [bookmarks, setBookmarks] = useState(() => readBookmarks());
  const [search, setSearch] = useState("");
  useEffect(() => subscribeToBookmarks(() => setBookmarks(readBookmarks())), []);
  const visibleBookmarks = useMemo(() => bookmarks.filter((item) => `${item.title} ${item.courseTitle} ${item.type}`.toLowerCase().includes(search.trim().toLowerCase())), [bookmarks, search]);
  const removeBookmark = (item) => writeBookmarks(bookmarks.filter((saved) => bookmarkId(saved) !== bookmarkId(item)));

  return <StudentLayout><main className="student-bookmarks"><header className="student-bookmarks__header"><div><span className="student-bookmarks__eyebrow">YOUR LIBRARY</span><h1>Bookmarks</h1><p>Keep useful lessons close and return to them whenever you need.</p></div><span className="student-bookmarks__count"><Bookmark size={16} /> {bookmarks.length} saved</span></header><section className="student-bookmarks__panel"><div className="student-bookmarks__toolbar"><div><h2>Saved lessons</h2><p>{bookmarks.length ? "Your bookmarked course materials" : "Lessons you save will appear here"}</p></div><label className="student-bookmarks__search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search bookmarks" aria-label="Search bookmarks" /></label></div>{visibleBookmarks.length ? <div className="student-bookmarks__list">{visibleBookmarks.map((item) => <article className="student-bookmark" key={bookmarkId(item)}><div className="student-bookmark__icon">{item.type === "VIDEO" ? <PlayCircle size={21} /> : <BookOpen size={21} />}</div><div className="student-bookmark__body"><span className="student-bookmark__course">{item.courseTitle || "Course"}</span><h3>{item.title}</h3><div className="student-bookmark__meta"><span>{item.type === "VIDEO" ? "Video lesson" : item.type === "PDF" ? "PDF reading" : "Course material"}</span>{item.duration && <><i /> <span><Clock3 size={13} /> {item.duration}</span></>}</div></div><div className="student-bookmark__actions"><Link to={`/student/courses/${item.courseId}`} className="student-bookmark__open">Open course</Link><button type="button" aria-label={`Remove ${item.title} bookmark`} onClick={() => removeBookmark(item)}><Trash2 size={17} /> Remove</button></div></article>)}</div> : <div className="student-bookmarks__empty"><div><Bookmark size={25} /></div><h3>{search ? "No matching bookmarks" : "No bookmarks yet"}</h3><p>{search ? "Try a different search term." : "Open a lesson in one of your courses and select Save bookmark to add it here."}</p>{!search && <Link to="/student/courses">Browse my courses</Link>}</div>}</section></main></StudentLayout>;
}
