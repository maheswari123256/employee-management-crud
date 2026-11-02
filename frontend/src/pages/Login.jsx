/**
 * pages/Login.jsx — centered auth card (CityCabz/Filament style)
 */
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/employeeApi';
import { validateLogin } from '../utils/validators';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function Login() {
  useDocumentTitle('Sign in');
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [reveal, setReveal] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const set = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setFormError('');
  };

  const fillDemo = () => {
    setValues({ email: 'admin@wizinoa.com', password: 'Admin@123' });
    setErrors({});
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateLogin(values);
    setErrors(validation);
    if (Object.keys(validation).length) return;

    setLoading(true);
    setFormError('');
    try {
      await login(values.email.trim(), values.password);
      navigate('/', { replace: true });
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <img src="/favicon.svg" alt="Wizinoa HR" />
          <div>
            <div className="brand-name">Wizinoa HR</div>
            <div className="brand-sub">Employee Management</div>
          </div>
        </div>

        <h1>Sign in</h1>
        <p className="sub">Admin access required to manage employees.</p>

        {formError && (
          <div className="alert alert-danger d-flex align-items-start gap-2" role="alert">
            <i className="bi bi-exclamation-circle-fill mt-1" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="wz-label" htmlFor="login-email">
              Email address <span className="req">*</span>
            </label>
            <div className="input-icon-wrap">
              <i className="bi bi-envelope" />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="admin@wizinoa.com"
                value={values.email}
                onChange={set('email')}
                autoFocus
              />
            </div>
            {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="wz-label" htmlFor="login-password">
              Password <span className="req">*</span>
            </label>
            <div className="input-icon-wrap">
              <i className="bi bi-lock" />
              <input
                id="login-password"
                type={reveal ? 'text' : 'password'}
                autoComplete="current-password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="••••••••"
                value={values.password}
                onChange={set('password')}
              />
              <button
                type="button"
                className="reveal"
                onClick={() => setReveal((r) => !r)}
                aria-label={reveal ? 'Hide password' : 'Show password'}
              >
                <i className={`bi ${reveal ? 'bi-eye-slash' : 'bi-eye'}`} />
              </button>
            </div>
            {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
          </div>

          <button type="submit" className="btn btn-primary w-100 btn-lg mt-2" disabled={loading}>
            {loading ? (
              <>
                <span className="wz-spinner me-2" /> Signing in…
              </>
            ) : (
              <>
                Sign in <i className="bi bi-arrow-right ms-1" />
              </>
            )}
          </button>
        </form>

        <div className="demo-chip">
          Demo admin → <b>admin@wizinoa.com</b> / <b>Admin@123</b>{' '}
          <button type="button" className="btn btn-link p-0 align-baseline" onClick={fillDemo}>
            fill
          </button>
        </div>
      </div>
    </div>
  );
}
