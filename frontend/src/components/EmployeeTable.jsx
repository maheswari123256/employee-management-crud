/**
 * components/EmployeeTable.jsx
 * Desktop: responsive table (md+).  Mobile: stacked cards (xs–sm).
 * Includes sortable headers + skeleton loading rows.
 */
import { STATUS_BADGE, STATUS_LABEL } from '../config';
import { avatarStyle, formatDate, formatSalary, getInitials } from '../utils/formatters';

const StatusPill = ({ status }) => (
  <span className={`status-pill status-pill--${status || 'inactive'}`}>{STATUS_LABEL[status] || status}</span>
);

const SortTh = ({ field, label, sortBy, order, onSort, className = '' }) => (
  <th className={`sortable ${className}`} onClick={() => onSort(field)}>
    {label}{' '}
    <i className={`bi ${sortBy === field ? (order === 'asc' ? 'bi-sort-up' : 'bi-sort-down') : 'bi-arrow-down-up'}`} />
  </th>
);

export default function EmployeeTable({ employees, loading, sortBy, order, onSort, onEdit, onDelete }) {
  /* -------------------------------- skeleton -------------------------------- */
  if (loading && employees.length === 0) {
    return (
      <div className="p-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="d-flex align-items-center gap-3 py-2">
            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
            <div className="flex-grow-1">
              <div className="skeleton mb-2" style={{ height: 12, width: '35%' }} />
              <div className="skeleton" style={{ height: 10, width: '55%' }} />
            </div>
            <div className="skeleton d-none d-md-block" style={{ height: 12, width: 90 }} />
          </div>
        ))}
      </div>
    );
  }

  /* -------------------------- desktop: real table --------------------------- */
  return (
    <>
      <div className="d-none d-md-block table-responsive">
        <table className="table employee-table align-middle mb-0">
          <thead>
            <tr>
              <SortTh field="firstName" label="Employee" sortBy={sortBy} order={order} onSort={onSort} />
              <th>Employee ID</th>
              <SortTh field="department" label="Department" sortBy={sortBy} order={order} onSort={onSort} />
              <th>Contact</th>
              <SortTh field="dateOfJoining" label="Joined" sortBy={sortBy} order={order} onSort={onSort} />
              <SortTh field="salary" label="Salary" sortBy={sortBy} order={order} onSort={onSort} className="text-end" />
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp._id}>
                <td>
                  <div className="emp-cell">
                    <span className="wz-avatar" style={avatarStyle(emp.firstName)}>
                      {emp.photo ? <img src={emp.photo} alt="" /> : getInitials(emp.firstName, emp.lastName)}
                    </span>
                    <div className="min-w-0">
                      <div className="emp-name text-truncate">
                        {emp.firstName} {emp.lastName}
                      </div>
                      <div className="emp-mail text-truncate">{emp.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="fw-semibold">{emp.employeeId}</span>
                </td>
                <td>
                  <div>{emp.department}</div>
                  <div className="emp-sub">{emp.designation}</div>
                </td>
                <td>
                  <div>{emp.phone}</div>
                  <div className="emp-sub">
                    {emp.city ? `${emp.city}` : ''}
                    {emp.city && emp.state ? ', ' : ''}
                    {emp.state || ''}
                  </div>
                </td>
                <td>{formatDate(emp.dateOfJoining)}</td>
                <td className="text-end fw-semibold">{formatSalary(emp.salary)}</td>
                <td>
                  <StatusPill status={emp.status} />
                </td>
                <td>
                  <div className="action-btns">
                    <button
                      type="button"
                      className="icon-btn icon-btn--edit"
                      title="Edit employee"
                      onClick={() => onEdit(emp)}
                    >
                      <i className="bi bi-pencil-fill" />
                    </button>
                    <button
                      type="button"
                      className="icon-btn icon-btn--delete"
                      title="Delete employee"
                      onClick={() => onDelete(emp)}
                    >
                      <i className="bi bi-trash3-fill" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --------------------------- mobile: card list -------------------------- */}
      <div className="emp-cards d-md-none">
        {employees.map((emp) => (
          <article key={emp._id} className="emp-card">
            <div className="emp-card-top">
              <span className="wz-avatar" style={avatarStyle(emp.firstName)}>
                {emp.photo ? <img src={emp.photo} alt="" /> : getInitials(emp.firstName, emp.lastName)}
              </span>
              <div className="meta">
                <div className="name text-truncate">
                  {emp.firstName} {emp.lastName}
                </div>
                <div className="mail">{emp.email}</div>
              </div>
              <StatusPill status={emp.status} />
            </div>

            <div className="emp-card-rows">
              <div>
                <div className="k">Employee ID</div>
                <div className="v">{emp.employeeId}</div>
              </div>
              <div>
                <div className="k">Department</div>
                <div className="v">{emp.department}</div>
              </div>
              <div>
                <div className="k">Designation</div>
                <div className="v">{emp.designation}</div>
              </div>
              <div>
                <div className="k">Joined</div>
                <div className="v">{formatDate(emp.dateOfJoining)}</div>
              </div>
            </div>

            <div className="emp-card-actions">
              <button type="button" className="btn btn-outline-secondary" onClick={() => onEdit(emp)}>
                <i className="bi bi-pencil-fill me-1" /> Edit
              </button>
              <button type="button" className="btn btn-outline-danger" onClick={() => onDelete(emp)}>
                <i className="bi bi-trash3-fill me-1" /> Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
