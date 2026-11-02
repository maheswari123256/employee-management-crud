/**
 * components/Pagination.jsx — server-side pagination + page-size selector.
 */
import { PAGE_SIZE_OPTIONS } from '../config';

const buildPages = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const items = [];
  let prev = 0;
  sorted.forEach((p) => {
    if (p - prev > 1) items.push('…');
    items.push(p);
    prev = p;
  });
  return items;
};

export default function Pagination({ pagination, onPageChange, onLimitChange }) {
  const { page, limit, total, totalPages } = pagination;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="pager">
      <div className="range">
        Showing <b>{from}–{to}</b> of <b>{total}</b> employee{total === 1 ? '' : 's'}
      </div>

      <div className="limit">
        Rows
        <select
          className="form-select"
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          aria-label="Rows per page"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <ul className="pagination pagination-sm">
        <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
          <button type="button" className="page-link" onClick={() => onPageChange(page - 1)} aria-label="Previous">
            <i className="bi bi-chevron-left" />
          </button>
        </li>

        {buildPages(page, totalPages).map((item, idx) =>
          item === '…' ? (
            <li key={`gap-${idx}`} className="page-item disabled">
              <span className="page-link">…</span>
            </li>
          ) : (
            <li key={item} className={`page-item ${item === page ? 'active' : ''}`}>
              <button type="button" className="page-link" onClick={() => onPageChange(item)}>
                {item}
              </button>
            </li>
          )
        )}

        <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
          <button type="button" className="page-link" onClick={() => onPageChange(page + 1)} aria-label="Next">
            <i className="bi bi-chevron-right" />
          </button>
        </li>
      </ul>
    </div>
  );
}
