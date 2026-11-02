/**
 * pages/EditEmployee.jsx — loads :id, then reuses EmployeeForm for updates.
 */
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import employeeApi, { getErrorMessage } from '../services/employeeApi';
import { useToast } from '../context/ToastContext';
import EmployeeForm from '../components/EmployeeForm';
import useDocumentTitle from '../hooks/useDocumentTitle';

const toFormData = (values, photoFile) => {
  const fd = new FormData();
  Object.entries(values).forEach(([key, value]) => fd.append(key, value ?? ''));
  if (photoFile) fd.append('photo', photoFile); // only sent when a NEW photo was picked
  return fd;
};

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  useDocumentTitle('Edit Employee');

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const fetchEmployee = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const { data } = await employeeApi.getEmployee(id);
      setEmployee(data.data);
    } catch (err) {
      setLoadError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  const handleSubmit = async (values, photoFile) => {
    setSubmitting(true);
    setServerError('');
    try {
      await employeeApi.updateEmployee(id, toFormData(values, photoFile));
      toast.success('Employee updated successfully');
      navigate('/employees');
    } catch (err) {
      const msg = getErrorMessage(err);
      setServerError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen" style={{ minHeight: '50vh' }}>
        <span className="wz-spinner" />
        <span>Loading employee…</span>
      </div>
    );
  }

  if (loadError || !employee) {
    return (
      <div className="empty-state wz-card">
        <div className="empty-icon">
          <i className="bi bi-exclamation-triangle" />
        </div>
        <h5>Couldn’t load employee</h5>
        <p>{loadError || 'Employee not found.'}</p>
        <Link to="/employees" className="btn btn-primary">
          <i className="bi bi-arrow-left me-1" /> Back to employees
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="wz-page-title">
            Edit {employee.firstName} {employee.lastName}
          </h1>
          <p className="wz-page-subtitle">
            {employee.employeeId} · {employee.department} · {employee.designation}
          </p>
        </div>
      </div>

      <EmployeeForm
        mode="edit"
        initial={employee}
        onSubmit={handleSubmit}
        submitting={submitting}
        serverError={serverError}
      />
    </>
  );
}
