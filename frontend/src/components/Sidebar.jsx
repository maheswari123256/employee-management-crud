/**
 * components/Sidebar.jsx — dark ink sidebar (off-canvas on mobile, fixed on lg+)
 */
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { avatarStyle, getInitials } from '../utils/formatters';

const LINKS = [
  { to: '/', label: 'Dashboard', icon: 'bi-speedometer2', end: true },
  { to: '/employees', label: 'Employees', icon: 'bi-people-fill' },
  { to: '/employees/new', label: 'Add Employee', icon: 'bi-person-plus-fill', badge: 'New' },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const parts = (user?.name || 'Admin User').trim().split(/\s+/);
  const initials = getInitials(parts[0], parts[1] || '');

  return (
    <>
      <div className={`sidebar-backdrop ${open ? 'is-open' : ''}`} onClick={onClose} aria-hidden="true" />

      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        <div className="sidebar-brand">
          <img src="/favicon.svg" alt="Wizinoa HR" />
          <div>
            <div className="brand-name">Wizinoa HR</div>
            <div className="brand-sub">Admin Panel</div>
          </div>
          <button type="button" className="sidebar-close" onClick={onClose} aria-label="Close menu">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="sidebar-heading">Main menu</div>
        <nav className="sidebar-nav">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <i className={`bi ${link.icon}`} />
              <span>{link.label}</span>
              {link.badge && <span className="link-badge">{link.badge}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="sidebar-user">
            <span className="wz-avatar wz-avatar--sm" style={avatarStyle(user?.name || '')}>
              {initials}
            </span>
            <div className="min-w-0">
              <div className="user-name text-truncate">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
