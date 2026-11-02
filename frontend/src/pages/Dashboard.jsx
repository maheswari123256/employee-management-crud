/**
 * pages/Dashboard.jsx — stat counters + recent joiners + quick actions
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import employeeApi, { getErrorMessage } from '../services/employeeApi';
import { useAuth } from '../context/AuthContext';
import { avatarStyle, formatDate, getInitials } from '../utils/formatters';
import useDocumentTitle from '../hooks/useDocumentTitle';

const STATS = [
  { key: 'total', label: 'Total employees', icon: 'bi-people-fill', tone: 'indigo' },
  { key: 'active', label: 'Active', icon: 'bi-check2-circle', tone: 'green' },
  { key: 'onLeave', label: 'On leave', icon: 'bi-clock-history', tone: 'amber' },
  { key: 'departments', label: 'Departments', icon: 'bi-diagram-3-fill', tone: 'slate' },
];

export default function Dashboard() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [statsRes, recentRes] = await Promise.all([
          employeeApi.getEmployeeStats(),
          employeeApi.getEmployees({ limit: 5, sortBy: 'createdAt', order: 'desc' }),
        ]);
        if (!alive) return;
        setStats(statsRes.data.data);
        setRecent(recentRes.data.data || []);
      } catch (err) {
        if (alive) setError(getErrorMessage(err));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const STATUS_CHART = [
    { name: 'Active', value: stats?.active || 0, color: '#16a34a' },
    { name: 'On Leave', value: stats?.onLeave || 0, color: '#f59e0b' },
    { name: 'Inactive', value: stats?.inactive || 0, color: '#94a3b8' },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="wz-page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="wz-page-subtitle">
            {today} · Here’s what’s happening in your team today.
          </p>
        </div>
        <div className="head-actions">
          <Link to="/employees" className="btn btn-outline-secondary">
            <i className="bi bi-list-ul me-1" /> All employees
          </Link>
          <Link to="/employees/new" className="btn btn-primary">
            <i className="bi bi-person-plus-fill me-1" /> Add employee
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2" />
          {error}
        </div>
      )}

      {/* -------------------------------- stats -------------------------------- */}
      <div className="row g-3 mb-4">
        {STATS.map((s) => (
          <div className="col-6 col-lg-3" key={s.key}>
            <div className="stat-card">
              <span className={`stat-icon stat-icon--${s.tone}`}>
                <i className={`bi ${s.icon}`} />
              </span>
              <div>
                <div className="stat-value">
                  {loading ? <span className="skeleton d-inline-block" style={{ width: 54, height: 24 }} /> : stats?.[s.key] ?? 0}
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* -------------------------------- charts -------------------------------- */}
      <div className="row g-3 g-lg-4 mb-4">
        <div className="col-lg-7">
          <div className="wz-card p-3 h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="wz-section-title mb-0">Headcount by department</div>
              <span className="count-chip">{stats?.departments ?? 0} depts</span>
            </div>

            {!stats ? (
              <div className="skeleton" style={{ height: 290, width: '100%' }} />
            ) : (stats.byDepartment || []).length === 0 ? (
              <div className="empty-state py-4">
                <p className="mb-0">No department data yet.</p>
              </div>
            ) : (
              <div style={{ height: 290 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.byDepartment}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 4, bottom: 5 }}
                    barSize={16}
                  >
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#6b7688' }} axisLine={false} tickLine={false} />
                    <YAxis
                      type="category"
                      dataKey="department"
                      width={118}
                      tick={{ fontSize: 11, fill: '#344054' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(79,70,229,0.06)' }}
                      contentStyle={{
                        borderRadius: 10,
                        border: '1px solid #e6eaf2',
                        boxShadow: '0 10px 30px -12px rgba(16,24,40,0.25)',
                        fontSize: '0.82rem',
                        fontFamily: 'Inter, sans-serif',
                      }}
                      formatter={(value, name) => [value, 'Employees']}
                    />
                    <Bar dataKey="count" radius={[0, 8, 8, 0]} fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-5">
          <div className="wz-card p-3 h-100">
            <div className="wz-section-title">Status split</div>

            {!stats ? (
              <div className="skeleton" style={{ height: 290, width: '100%' }} />
            ) : (
              <div style={{ position: 'relative' }}>
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={STATUS_CHART}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={58}
                        outerRadius={92}
                        paddingAngle={4}
                        stroke="none"
                      >
                        {STATUS_CHART.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: 10,
                          border: '1px solid #e6eaf2',
                          fontSize: '0.82rem',
                          fontFamily: 'Inter, sans-serif',
                        }}
                        formatter={(value, name) => [value, name]}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '0.78rem' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div
                  style={{
                    position: 'absolute',
                    top: '42%',
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>{stats.total}</div>
                  <div style={{ fontSize: '0.68rem', letterSpacing: '0.08em', color: '#6b7688' }}>TOTAL</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row g-3 g-lg-4">
        {/* --------------------------- recent joiners --------------------------- */}
        <div className="col-lg-8">
          <div className="wz-card h-100">
            <div className="table-toolbar">
              <h5 className="mb-0 fw-bold">Recently added</h5>
              <Link to="/employees" className="btn btn-sm btn-outline-secondary">
                View all <i className="bi bi-arrow-right ms-1" />
              </Link>
            </div>

            {loading ? (
              <div className="p-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="d-flex align-items-center gap-3 py-2">
                    <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }} />
                    <div className="flex-grow-1">
                      <div className="skeleton mb-2" style={{ height: 11, width: '40%' }} />
                      <div className="skeleton" style={{ height: 9, width: '60%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="empty-state py-4">
                <p className="mb-0">No employees yet — create your first one.</p>
              </div>
            ) : (
              <ul className="list-unstyled m-0">
                {recent.map((emp, idx) => (
                  <li
                    key={emp._id}
                    className="d-flex align-items-center gap-3 px-3 py-2"
                    style={{ borderBottom: idx === recent.length - 1 ? 'none' : '1px solid #f0f2f7' }}
                  >
                    <span className="wz-avatar" style={avatarStyle(emp.firstName)}>
                      {emp.photo ? <img src={emp.photo} alt="" /> : getInitials(emp.firstName, emp.lastName)}
                    </span>
                    <div className="min-w-0 flex-grow-1">
                      <div className="fw-semibold text-truncate">
                        {emp.firstName} {emp.lastName}
                      </div>
                      <div className="emp-sub text-truncate">
                        {emp.designation} · {emp.department}
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="fw-semibold small">{formatDate(emp.dateOfJoining)}</div>
                      <span className={`status-pill status-pill--${emp.status}`}>{emp.employeeId}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ---------------------------- quick actions --------------------------- */}
        <div className="col-lg-4">
          <div className="wz-card p-3 mb-3">
            <div className="wz-section-title">Quick actions</div>
            <div className="d-grid gap-2">
              <Link to="/employees/new" className="btn btn-primary">
                <i className="bi bi-person-plus-fill me-2" /> Create employee
              </Link>
              <Link to="/employees" className="btn btn-outline-secondary">
                <i className="bi bi-search me-2" /> Search & filter employees
              </Link>
            </div>
          </div>

          <div className="wz-card p-3">
            <div className="wz-section-title">Module checklist</div>
            <ul className="meta-list">
              <li>
                <span className="k">JWT auth middleware</span>
                <span className="v text-success">
                  <i className="bi bi-check-circle-fill" /> Active
                </span>
              </li>
              <li>
                <span className="k">Admin-only CRUD</span>
                <span className="v text-success">
                  <i className="bi bi-check-circle-fill" /> On
                </span>
              </li>
              <li>
                <span className="k">Multer photo upload</span>
                <span className="v text-success">
                  <i className="bi bi-check-circle-fill" /> 2 MB
                </span>
              </li>
              <li>
                <span className="k">Server-side pagination</span>
                <span className="v text-success">
                  <i className="bi bi-check-circle-fill" /> Enabled
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
