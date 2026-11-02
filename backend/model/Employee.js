/**
 * model/Employee.js
 * Employee document schema (mongoose ODM).
 */
const mongoose = require('mongoose');

const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Marketing',
  'Sales',
  'Finance',
  'Human Resources',
  'Operations',
  'Customer Support',
  'IT',
];

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    firstName: { type: String, required: [true, 'First name is required'], trim: true, maxlength: 50 },
    lastName: { type: String, required: [true, 'Last name is required'], trim: true, maxlength: 50 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[0-9+\-\s()]{7,20}$/, 'Please provide a valid phone number'],
    },
    gender: { type: String, enum: ['male', 'female', 'other'], required: [true, 'Gender is required'] },
    dateOfBirth: { type: Date, required: [true, 'Date of birth is required'] },
    department: { type: String, required: [true, 'Department is required'], enum: DEPARTMENTS },
    designation: { type: String, required: [true, 'Designation is required'], trim: true, maxlength: 80 },
    dateOfJoining: { type: Date, required: [true, 'Date of joining is required'] },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'intern'],
      default: 'full-time',
    },
    salary: { type: Number, default: 0, min: [0, 'Salary cannot be negative'] },
    status: { type: String, enum: ['active', 'inactive', 'on-leave'], default: 'active' },
    address: { type: String, trim: true, maxlength: 200 },
    city: { type: String, trim: true, maxlength: 60 },
    state: { type: String, trim: true, maxlength: 60 },
    pincode: {
      type: String,
      trim: true,
      match: [/^[0-9]{4,10}$/, 'Please provide a valid pincode'],
    },
    photo: { type: String, default: '' }, // e.g. /uploads/employees/xxx.jpg
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Fast text search across key fields
employeeSchema.index({ firstName: 'text', lastName: 'text', email: 'text', employeeId: 'text' });

module.exports = mongoose.model('Employee', employeeSchema);
module.exports.DEPARTMENTS = DEPARTMENTS;
