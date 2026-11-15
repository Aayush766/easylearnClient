const STORAGE_KEY = "prime-easy-learn:student-bookmarks";
const CHANGE_EVENT = "student-bookmarks-changed";

export function readBookmarks() {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function writeBookmarks(bookmarks) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeToBookmarks(callback) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function bookmarkId(bookmark) {
  return String(bookmark.contentId || `${bookmark.courseId}:${bookmark.title}`);
}
