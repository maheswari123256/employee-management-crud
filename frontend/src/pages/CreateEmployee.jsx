/**
 * pages/CreateEmployee.jsx — admin-only create (multipart + optional photo)
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import employeeApi, { getErrorMessage } from '../services/employeeApi';
import { useToast } from '../context/ToastContext';
import EmployeeForm from '../components/EmployeeForm';
import useDocumentTitle from '../hooks/useDocumentTitle';

const toFormData = (values, photoFile) => {
  const fd = new FormData();
  Object.entries(values).forEach(([key, value]) => fd.append(key, value ?? ''));
  if (photoFile) fd.append('photo', photoFile);
  return fd;
};

export default function CreateEmployee() {
  useDocumentTitle('Add Employee');
  const navigate = useNavigate();
  const toast = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (values, photoFile) => {
    setSubmitting(true);
    setServerError('');
    try {
      await employeeApi.createEmployee(toFormData(values, photoFile));
      toast.success('Employee created successfully');
      navigate('/employees');
    } catch (err) {
      const msg = getErrorMessage(err);
      setServerError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="wz-page-title">Add employee</h1>
          <p className="wz-page-subtitle">Only admin accounts can create employee records.</p>
        </div>
      </div>

      <EmployeeForm
        mode="create"
        onSubmit={handleSubmit}
        submitting={submitting}
        serverError={serverError}
      />
    </>
  );
}
