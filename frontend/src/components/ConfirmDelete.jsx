/**
 * components/ConfirmDelete.jsx — accessible delete confirmation modal.
 */
export default function ConfirmDelete({ show, employee, loading = false, onConfirm, onCancel }) {
  if (!show || !employee) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} onClick={onCancel} />
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true" style={{ zIndex: 1060 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header border-0 pb-0">
              <div className="d-flex align-items-center gap-2">
                <span
                  className="d-inline-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: 40, height: 40, background: '#fef2f2', color: '#dc2626' }}
                >
                  <i className="bi bi-trash3" />
                </span>
                <h5 className="modal-title fw-bold mb-0">Delete employee?</h5>
              </div>
              <button type="button" className="btn-close" onClick={onCancel} aria-label="Close" />
            </div>

            <div className="modal-body text-secondary">
              You’re about to permanently delete{' '}
              <b className="text-dark">
                {employee.firstName} {employee.lastName}
              </b>{' '}
              <span className="text-dark">({employee.employeeId})</span> and their photo. This action cannot be undone.
            </div>

            <div className="modal-footer border-0 pt-0">
              <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={loading}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger px-4" onClick={onConfirm} disabled={loading}>
                {loading ? (
                  <>
                    <span className="wz-spinner me-2" /> Deleting…
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash3-fill me-1" /> Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
