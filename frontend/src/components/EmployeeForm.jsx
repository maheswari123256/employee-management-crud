/**
 * components/EmployeeForm.jsx
 * Shared create/edit form: photo uploader + personal / employment / address sections.
 * Submits raw values + optional photo File to the parent page.
 */
import { useEffect, useRef, useState } from 'react';
import { DEPARTMENTS, EMPLOYEE_STATUSES, EMPLOYMENT_TYPES, GENDERS, MAX_PHOTO_SIZE, ACCEPTED_PHOTO_TYPES } from '../config';
import { avatarStyle, formatDate, getInitials, toDateInput } from '../utils/formatters';
import { hasErrors, validateEmployee } from '../utils/validators';

const EMPTY = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  gender: '',
  dateOfBirth: '',
  department: '',
  designation: '',
  dateOfJoining: '',
  employmentType: 'full-time',
  salary: '',
  status: 'active',
  address: '',
  city: '',
  state: '',
  pincode: '',
};

// leading icon per field (matches the login page style)
const FIELD_ICONS = {
  'First name': 'bi-person',
  'Last name': 'bi-person-lines-fill',
  'Email address': 'bi-envelope',
  'Phone number': 'bi-telephone',
  Gender: 'bi-gender-ambiguous',
  'Date of birth': 'bi-calendar-event',
  Department: 'bi-building',
  Designation: 'bi-briefcase',
  'Date of joining': 'bi-calendar-check',
  'Employment type': 'bi-diagram-3',
  'Annual salary (₹)': 'bi-currency-rupee',
  Status: 'bi-check2-circle',
  'Street address': 'bi-geo-alt',
  City: 'bi-shop',
  State: 'bi-map',
  Pincode: 'bi-pin-map',
};

const Field = ({ label, required, error, children, className = 'col-md-6' }) => (
  <div className={className}>
    <label className="wz-label">
      {label} {required && <span className="req">*</span>}
    </label>
    <div className="input-icon-wrap">
      <i className={`bi ${FIELD_ICONS[label] || 'bi-pencil'}`} />
      {children}
    </div>
    {error && <div className="invalid-feedback d-block">{error}</div>}
  </div>
);

/**
 * Downscale picked photos to <=640px / JPEG q0.82 so the base64 data-URL
 * stored in MongoDB stays tiny (~50-150 KB) — keeps list responses fast.
 */
const resizePhoto = (file) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const objUrl = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const MAX_DIM = 640;
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        if (w > MAX_DIM || h > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / w, MAX_DIM / h);
          w = Math.max(1, Math.round(w * ratio));
          h = Math.max(1, Math.round(h * ratio));
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objUrl);
            if (!blob) return resolve(file);
            const name = file.name.replace(/\.\w+$/, '.jpg');
            resolve(new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() }));
          },
          'image/jpeg',
          0.82
        );
      } catch {
        URL.revokeObjectURL(objUrl);
        resolve(file);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objUrl);
      reject(new Error('Could not read image'));
    };
    img.src = objUrl;
  });

export default function EmployeeForm({ initial, mode = 'create', onSubmit, submitting = false, serverError = '' }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoError, setPhotoError] = useState('');
  const previewUrlRef = useRef('');

  // hydrate when parent data arrives (edit) or reset (create)
  useEffect(() => {
    if (initial) {
      setValues({
        ...EMPTY,
        ...initial,
        dateOfBirth: toDateInput(initial.dateOfBirth),
        dateOfJoining: toDateInput(initial.dateOfJoining),
        salary: initial.salary ?? '',
      });
      setPhotoPreview(initial.photo || '');
    } else {
      setValues(EMPTY);
      setPhotoPreview('');
    }
    setErrors({});
    setPhotoError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  // cleanup object URLs
  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    []
  );

  const set = (field) => (event) => {
    const { value } = event.target;
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handlePhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
      setPhotoError('Only JPG, PNG, WEBP or GIF images are allowed');
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoError('Photo must be smaller than 10 MB');
      return;
    }

    // Auto-downscale so the stored data-URL stays small
    let uploadFile = file;
    try {
      uploadFile = await resizePhoto(file);
    } catch {
      uploadFile = file; // fall back to the original if resizing fails
    }

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(uploadFile);
    previewUrlRef.current = url;
    setPhotoFile(uploadFile);
    setPhotoPreview(url);
    setPhotoError('');
  };

  const removePhoto = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = '';
    setPhotoFile(null);
    setPhotoPreview(initial?.photo || '');
    setPhotoError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validation = validateEmployee(values);
    setErrors(validation);
    if (hasErrors(validation)) {
      const first = document.querySelector('.is-invalid, .invalid-feedback.d-block');
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    onSubmit(values, photoFile);
  };

  const photoLabel = mode === 'edit' ? 'Update photo' : 'Upload photo';

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-layout">
        {/* --------------------------- Left: photo panel --------------------------- */}
        <div>
          <div className="wz-card photo-panel overflow-hidden">
            <div className="wz-section-title mb-3">Employee photo</div>
            <div className="photo-frame">
              {photoPreview ? (
                <img src={photoPreview} alt="Employee preview" />
              ) : (
                <span className="placeholder">
                  <i className="bi bi-person-fill" />
                </span>
              )}
              {photoFile && (
                <span className="badge-tick">
                  <i className="bi bi-check-lg" />
                </span>
              )}
            </div>

            <div className="photo-actions">
              <label className="btn btn-outline-secondary btn-sm mb-0">
                <i className="bi bi-camera me-1" /> {photoLabel}
                <input type="file" accept="image/*" className="d-none" onChange={handlePhoto} />
              </label>
              {(photoFile || photoPreview) && (
                <button type="button" className="btn btn-outline-danger btn-sm" onClick={removePhoto}>
                  <i className="bi bi-x-lg me-1" /> Remove
                </button>
              )}
            </div>

            {photoError && <div className="text-danger small mt-2">{photoError}</div>}
            <div className="wz-hint mt-2">JPG, PNG, WEBP or GIF · max 2 MB</div>

            {!photoPreview && (
              <div
                className="wz-avatar wz-avatar--lg mt-3"
                style={avatarStyle(values.firstName || 'w')}
                aria-hidden="true"
              >
                {getInitials(values.firstName || '?', values.lastName || '')}
              </div>
            )}
          </div>

          {mode === 'edit' && initial?.createdBy && (
            <div className="wz-card p-3 mt-3">
              <div className="wz-section-title">Record info</div>
              <ul className="meta-list">
                <li>
                  <span className="k">Employee ID</span>
                  <span className="v">{initial.employeeId}</span>
                </li>
                <li>
                  <span className="k">Created by</span>
                  <span className="v">{initial.createdBy.name}</span>
                </li>
                <li>
                  <span className="k">Created on</span>
                  <span className="v">{formatDate(initial.createdAt)}</span>
                </li>
                <li>
                  <span className="k">Last updated</span>
                  <span className="v">{formatDate(initial.updatedAt)}</span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* ------------------------ Right: details sections ------------------------ */}
        <div className="wz-card overflow-hidden">
          {serverError && (
            <div className="m-3 alert alert-danger d-flex align-items-start gap-2 mb-0" role="alert">
              <i className="bi bi-exclamation-triangle-fill mt-1" />
              <span>{serverError}</span>
            </div>
          )}

          <section className="form-section">
            <div className="form-section-head">
              <i className="bi bi-person" />
              <h6>Personal details</h6>
            </div>
            <div className="row g-3">
              <Field label="First name" required error={errors.firstName}>
                <input
                  type="text"
                  className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                  placeholder="e.g. Aarav"
                  value={values.firstName}
                  onChange={set('firstName')}
                />
              </Field>
              <Field label="Last name" required error={errors.lastName}>
                <input
                  type="text"
                  className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                  placeholder="e.g. Sharma"
                  value={values.lastName}
                  onChange={set('lastName')}
                />
              </Field>
              <Field label="Email address" required error={errors.email}>
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="employee@company.com"
                  value={values.email}
                  onChange={set('email')}
                />
              </Field>
              <Field label="Phone number" required error={errors.phone}>
                <input
                  type="tel"
                  className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                  placeholder="+91 98765 43210"
                  value={values.phone}
                  onChange={set('phone')}
                />
              </Field>
              <Field label="Gender" required error={errors.gender}>
                <select
                  className={`form-select ${errors.gender ? 'is-invalid' : ''}`}
                  value={values.gender}
                  onChange={set('gender')}
                >
                  <option value="">Select gender</option>
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Date of birth" required error={errors.dateOfBirth}>
                <input
                  type="date"
                  className={`form-control ${errors.dateOfBirth ? 'is-invalid' : ''}`}
                  value={values.dateOfBirth}
                  onChange={set('dateOfBirth')}
                />
              </Field>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-head">
              <i className="bi bi-briefcase" />
              <h6>Employment details</h6>
            </div>
            <div className="row g-3">
              <Field label="Department" required error={errors.department}>
                <select
                  className={`form-select ${errors.department ? 'is-invalid' : ''}`}
                  value={values.department}
                  onChange={set('department')}
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Designation" required error={errors.designation}>
                <input
                  type="text"
                  className={`form-control ${errors.designation ? 'is-invalid' : ''}`}
                  placeholder="e.g. Software Engineer"
                  value={values.designation}
                  onChange={set('designation')}
                />
              </Field>
              <Field label="Date of joining" required error={errors.dateOfJoining}>
                <input
                  type="date"
                  className={`form-control ${errors.dateOfJoining ? 'is-invalid' : ''}`}
                  value={values.dateOfJoining}
                  onChange={set('dateOfJoining')}
                />
              </Field>
              <Field label="Employment type">
                <select className="form-select" value={values.employmentType} onChange={set('employmentType')}>
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Annual salary (₹)" error={errors.salary}>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  className={`form-control ${errors.salary ? 'is-invalid' : ''}`}
                  placeholder="e.g. 600000"
                  value={values.salary}
                  onChange={set('salary')}
                />
              </Field>
              <Field label="Status">
                <select className="form-select" value={values.status} onChange={set('status')}>
                  {EMPLOYEE_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-head">
              <i className="bi bi-geo-alt" />
              <h6>Address</h6>
            </div>
            <div className="row g-3">
              <Field label="Street address" className="col-12" error={errors.address}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="12 MG Road"
                  value={values.address}
                  onChange={set('address')}
                />
              </Field>
              <Field label="City" error={errors.city}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Chennai"
                  value={values.city}
                  onChange={set('city')}
                />
              </Field>
              <Field label="State" error={errors.state}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tamil Nadu"
                  value={values.state}
                  onChange={set('state')}
                />
              </Field>
              <Field label="Pincode" error={errors.pincode}>
                <input
                  type="text"
                  inputMode="numeric"
                  className={`form-control ${errors.pincode ? 'is-invalid' : ''}`}
                  placeholder="600001"
                  value={values.pincode}
                  onChange={set('pincode')}
                />
              </Field>
            </div>
          </section>

          <div className="form-actions-bar">
            <button type="button" className="btn btn-outline-secondary" onClick={() => window.history.back()} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="wz-spinner me-2" />
                  {mode === 'edit' ? 'Saving…' : 'Creating…'}
                </>
              ) : (
                <>
                  <i className={`bi ${mode === 'edit' ? 'bi-check2' : 'bi-plus-lg'} me-1`} />
                  {mode === 'edit' ? 'Save changes' : 'Create employee'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
