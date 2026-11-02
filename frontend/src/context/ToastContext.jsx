/**
 * context/ToastContext.jsx
 * Lightweight Bootstrap-style toast notifications: toast.success('Saved')
 */
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};

const ICONS = {
  success: 'bi-check-circle-fill',
  error: 'bi-x-circle-fill',
  info: 'bi-info-circle-fill',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const remove = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (type, message, duration = 3500) => {
      const id = ++idRef.current;
      setToasts((list) => [...list, { id, type, message }]);
      window.setTimeout(() => remove(id), duration);
    },
    [remove]
  );

  const value = useMemo(
    () => ({
      success: (msg, ms) => push('success', msg, ms),
      error: (msg, ms) => push('error', msg, ms),
      info: (msg, ms) => push('info', msg, ms),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack position-fixed top-0 end-0 p-3" style={{ zIndex: 2000 }} aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`wz-toast wz-toast--${t.type}`}>
            <i className={`bi ${ICONS[t.type]}`} />
            <span>{t.message}</span>
            <button type="button" className="btn-close ms-auto" onClick={() => remove(t.id)} aria-label="Close" />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
