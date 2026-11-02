/**
 * components/Navbar.jsx — sticky top bar with page title + user dropdown
 */
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { avatarStyle, getInitials } from '../utils/formatters';

const TITLES = [
  { match: (p) => p === '/', title: 'Dashboard', crumb: 'Overview' },
  { match: (p) => p === '/employees', title: 'Employees', crumb: 'People / Employees' },
  { match: (p) => p === '/employees/new', title: 'Add Employee', crumb: 'People / Employees / New' },
  { match: (p) => /^\/employees\/[^/]+\/edit$/.test(p), title: 'Edit Employee', crumb: 'People / Employees / Edit' },
];

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const active = TITLES.find((t) => t.match(pathname)) || { title: 'Wizinoa HR', crumb: 'Admin' };

  const parts = (user?.name || 'Admin User').trim().split(/\s+/);

  return (
    <header className="topbar">
      <button type="button" className="menu-btn" onClick={onMenuClick} aria-label="Open menu">
        <i className="bi bi-list" />
      </button>

      <div className="me-auto">
        <p className="topbar-crumb">{active.crumb}</p>
        <h2 className="topbar-title">{active.title}</h2>
      </div>

      <div className="dropdown">
        <div
          className="topbar-user dropdown-toggle"
          role="button"
          data-bs-toggle="dropdown"
          data-bs-offset="0,10"
          aria-expanded="false"
        >
          <span className="wz-avatar wz-avatar--sm" style={avatarStyle(user?.name || '')}>
            {getInitials(parts[0], parts[1] || '')}
          </span>
          <span className="meta">
            <b>{user?.name}</b>
            <span style={{ textTransform: 'capitalize' }}>{user?.role}</span>
          </span>
        </div>
        <ul className="dropdown-menu dropdown-menu-end">
          <li className="px-3 py-2">
            <div className="fw-semibold">{user?.name}</div>
            <div className="small text-muted">{user?.email}</div>
          </li>
          <li>
            <hr className="dropdown-divider" />
          </li>
          <li>
            <button type="button" className="dropdown-item text-danger" onClick={logout}>
              <i className="bi bi-box-arrow-right me-2" />
              Sign out
            </button>
          </li>
        </ul>
      </div>
    </header>
  );
}
