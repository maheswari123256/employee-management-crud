/**
 * App.jsx — routes + protected admin shell (Sidebar + Navbar + Outlet).
 */
import { useState } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import CreateEmployee from './pages/CreateEmployee';
import EditEmployee from './pages/EditEmployee';

/* ------------------------------ Admin shell ------------------------------ */
function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="admin-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-content">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="admin-main">
          <Outlet />
        </main>
        <footer className="admin-footer">© {new Date().getFullYear()} Wizinoa HR · Employee Management Module</footer>
      </div>
    </div>
  );
}

function ProtectedRoute() {
  const { user, booting } = useAuth();
  if (booting) {
    return (
      <div className="loading-screen">
        <span className="wz-spinner" />
        <span>Preparing your workspace…</span>
      </div>
    );
  }
  return user ? <AdminLayout /> : <Navigate to="/login" replace />;
}

function PublicRoute() {
  const { user, booting } = useAuth();
  if (booting) return null;
  return user ? <Navigate to="/" replace /> : <Outlet />;
}

/* ------------------------------- 404 page ------------------------------- */
function NotFound() {
  return (
    <div className="notfound">
      <div className="code">404</div>
      <h4>Page not found</h4>
      <p className="text-muted">The page you are looking for doesn’t exist or was moved.</p>
      <a href="/" className="btn btn-primary">
        <i className="bi bi-house me-1" /> Back to Dashboard
      </a>
    </div>
  );
}

/* --------------------------------- Routes -------------------------------- */
export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/employees" element={<EmployeeList />} />
              <Route path="/employees/new" element={<CreateEmployee />} />
              <Route path="/employees/:id/edit" element={<EditEmployee />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
