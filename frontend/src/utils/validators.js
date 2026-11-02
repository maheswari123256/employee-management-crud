/**
 * utils/validators.js
 * Client-side validation helpers (mirrors backend rules).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/; // allows admin@wizinoa.com, a.b@sub.domain.co
const PHONE_RE = /^[0-9+\-\s()]{7,20}$/;
const PINCODE_RE = /^[0-9]{4,10}$/;

export const validateLogin = (values) => {
  const errors = {};
  if (!values.email?.trim()) errors.email = 'Email is required';
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Enter a valid email address';
  if (!values.password) errors.password = 'Password is required';
  else if (values.password.length < 6) errors.password = 'Password must be at least 6 characters';
  return errors;
};

const isFutureDate = (value) => value && new Date(value) > new Date();

export const validateEmployee = (values) => {
  const errors = {};

  if (!values.firstName?.trim()) errors.firstName = 'First name is required';
  else if (values.firstName.trim().length > 50) errors.firstName = 'Max 50 characters';

  if (!values.lastName?.trim()) errors.lastName = 'Last name is required';
  else if (values.lastName.trim().length > 50) errors.lastName = 'Max 50 characters';

  if (!values.email?.trim()) errors.email = 'Email is required';
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Enter a valid email address';

  if (!values.phone?.trim()) errors.phone = 'Phone number is required';
  else if (!PHONE_RE.test(values.phone.trim())) errors.phone = 'Enter a valid phone number (7–20 digits)';

  if (!values.gender) errors.gender = 'Gender is required';

  if (!values.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
  else if (isFutureDate(values.dateOfBirth)) errors.dateOfBirth = 'Date of birth cannot be in the future';

  if (!values.department) errors.department = 'Department is required';
  if (!values.designation?.trim()) errors.designation = 'Designation is required';

  if (!values.dateOfJoining) errors.dateOfJoining = 'Date of joining is required';
  else if (isFutureDate(values.dateOfJoining)) errors.dateOfJoining = 'Joining date cannot be in the future';

  if (values.salary !== '' && values.salary !== undefined && values.salary !== null) {
    const salary = Number(values.salary);
    if (Number.isNaN(salary) || salary < 0) errors.salary = 'Salary must be 0 or more';
  }

  if (values.pincode && !PINCODE_RE.test(values.pincode.trim())) {
    errors.pincode = 'Pincode must be 4–10 digits';
  }

  if (values.dateOfBirth && values.dateOfJoining) {
    const dob = new Date(values.dateOfBirth);
    const joining = new Date(values.dateOfJoining);
    if (joining < dob) errors.dateOfJoining = 'Joining date cannot be before date of birth';
  }

  return errors;
};

export const hasErrors = (errors) => Object.keys(errors).length > 0;
