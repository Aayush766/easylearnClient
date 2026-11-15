import { ChevronLeft, ChevronRight } from "lucide-react";

function Pagination({ onPageChange, page = 1, totalPages = 1 }) {
  if (totalPages <= 1) return null;
  return <nav aria-label="Pagination" className="pagination"><button aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)} type="button"><ChevronLeft size={18} /></button><span>Page {page} of {totalPages}</span><button aria-label="Next page" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} type="button"><ChevronRight size={18} /></button></nav>;
}

export default Pagination;
