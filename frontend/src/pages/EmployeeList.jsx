/**
 * pages/EmployeeList.jsx — search, filters, sorting, pagination, delete flow.
 */
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import employeeApi, { getErrorMessage } from '../services/employeeApi';
import useDebounce from '../hooks/useDebounce';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { DEPARTMENTS, EMPLOYEE_STATUSES } from '../config';
import { useToast } from '../context/ToastContext';

import EmployeeTable from '../components/EmployeeTable';
import Pagination from '../components/Pagination';
import ConfirmDelete from '../components/ConfirmDelete';

export default function EmployeeList() {
  useDocumentTitle('Employees');
  const toast = useToast();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  // new filter → back to page 1
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, department, status, limit]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await employeeApi.getEmployees({
        page,
        limit,
        search: debouncedSearch,
        department,
        status,
        sortBy,
        order,
      });
      setEmployees(data.data || []);
      setPagination(data.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, department, status, sortBy, order]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setOrder(field === 'createdAt' || field === 'salary' ? 'desc' : 'asc');
    }
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setDepartment('');
    setStatus('');
    setPage(1);
  };

  const hasFilters = Boolean(debouncedSearch || department || status);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await employeeApi.deleteEmployee(deleteTarget._id);
      toast.success(`${deleteTarget.firstName} ${deleteTarget.lastName} deleted`);
      setDeleteTarget(null);
      await fetchList();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const total = pagination.total;

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="wz-page-title">Employees</h1>
          <p className="wz-page-subtitle">Manage employee records, photos and status.</p>
        </div>
        <div className="head-actions">
          <button type="button" className="btn btn-outline-secondary" onClick={fetchList} disabled={loading}>
            <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''} me-1`} /> Refresh
          </button>
          <Link to="/employees/new" className="btn btn-primary">
            <i className="bi bi-person-plus-fill me-1" /> Add employee
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-start gap-2" role="alert">
          <i className="bi bi-exclamation-triangle-fill mt-1" />
          <div>{error}</div>
        </div>
      )}

      {/* -------------------------------- filters -------------------------------- */}
      <div className="wz-card filter-bar mb-3">
        <div className="filter-grid">
          <div className="search-wrap">
            <i className="bi bi-search" />
            <input
              type="search"
              className="form-control"
              placeholder="Search name, email, ID, phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search employees"
            />
          </div>

          <select
            className="form-select"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            aria-label="Filter by department"
          >
            <option value="">All departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {EMPLOYEE_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={clearFilters}
            disabled={!hasFilters}
          >
            <i className="bi bi-x-lg me-1" /> Clear
          </button>
        </div>
      </div>

      {/* -------------------------------- table --------------------------------- */}
      <div className="wz-card table-card">
        <div className="table-toolbar">
          <div className="d-flex align-items-center gap-2">
            <h5 className="mb-0 fw-bold d-none d-sm-block">All employees</h5>
            <span className="count-chip">{loading ? '…' : `${total} found`}</span>
          </div>
          <div className="wz-hint d-none d-md-block">
            <i className="bi bi-arrow-down-up me-1" /> Click a column header to sort
          </div>
        </div>

        {loading && employees.length === 0 ? (
          <EmployeeTable employees={[]} loading sortBy={sortBy} order={order} onSort={handleSort} onEdit={() => {}} onDelete={() => {}} />
        ) : employees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className={`bi ${hasFilters ? 'bi-search' : 'bi-people'}`} />
            </div>
            <h5>{hasFilters ? 'No matching employees' : 'No employees yet'}</h5>
            <p>
              {hasFilters
                ? 'Try a different search term or clear the filters to see more results.'
                : 'Create your first employee to get the module rolling — photo upload, pagination and more are ready.'}
            </p>
            {hasFilters ? (
              <button type="button" className="btn btn-outline-secondary" onClick={clearFilters}>
                <i className="bi bi-x-lg me-1" /> Clear filters
              </button>
            ) : (
              <Link to="/employees/new" className="btn btn-primary">
                <i className="bi bi-person-plus-fill me-1" /> Add employee
              </Link>
            )}
          </div>
        ) : (
          <>
            <EmployeeTable
              employees={employees}
              loading={loading}
              sortBy={sortBy}
              order={order}
              onSort={handleSort}
              onEdit={(emp) => navigate(`/employees/${emp._id}/edit`)}
              onDelete={(emp) => setDeleteTarget(emp)}
            />
            <Pagination
              pagination={pagination}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          </>
        )}
      </div>

      <ConfirmDelete
        show={Boolean(deleteTarget)}
        employee={deleteTarget}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </>
  );
}
