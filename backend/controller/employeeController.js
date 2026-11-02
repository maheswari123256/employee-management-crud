/**
 * controller/employeeController.js
 * Full CRUD for employees (list w/ pagination & filters, detail, create, update, delete).
 * Every handler runs after `protect`, so the logged-in user is on req.user.
 */
const Employee = require('../model/Employee');
const generateEmployeeId = require('../utils/generateEmployeeId');
const { deleteFile } = require('../utils/file');

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORTABLE = ['firstName', 'lastName', 'email', 'department', 'dateOfJoining', 'salary', 'status', 'createdAt'];

/* ------------------------------- LIST (paged) ------------------------------- */
exports.getEmployees = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const { search = '', department = '', status = '', sortBy = 'createdAt', order = 'desc' } = req.query;

    const filter = {};
    if (department) filter.department = department;
    if (status) filter.status = status;
    if (String(search).trim()) {
      const rx = new RegExp(escapeRegex(String(search).trim()), 'i');
      filter.$or = [
        { firstName: rx },
        { lastName: rx },
        { email: rx },
        { employeeId: rx },
        { phone: rx },
        { designation: rx },
      ];
    }

    const sortField = SORTABLE.includes(sortBy) ? sortBy : 'createdAt';
    const sortDir = order === 'asc' ? 1 : -1;

    const [total, employees] = await Promise.all([
      Employee.countDocuments(filter),
      Employee.find(filter)
        .sort({ [sortField]: sortDir, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('createdBy', 'name email role'),
    ]);

    res.json({
      success: true,
      message: 'Employees fetched',
      data: employees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/* ---------------------------------- STATS ---------------------------------- */
exports.getStats = async (req, res, next) => {
  try {
    const [total, byStatus, departments, byDepartment] = await Promise.all([
      Employee.countDocuments(),
      Employee.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Employee.distinct('department'),
      Employee.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
      ]),
    ]);

    const statusMap = Object.fromEntries(byStatus.map((s) => [s._id || 'active', s.count]));
    res.json({
      success: true,
      message: 'Stats fetched',
      data: {
        total,
        active: statusMap.active || 0,
        inactive: statusMap.inactive || 0,
        onLeave: statusMap['on-leave'] || 0,
        departments: departments.filter(Boolean).length,
        byDepartment: byDepartment
          .filter((d) => d._id)
          .map((d) => ({ department: d._id, count: d.count })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/* --------------------------------- DETAIL ---------------------------------- */
exports.getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('createdBy', 'name email role');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    return res.json({ success: true, message: 'Employee fetched', data: employee });
  } catch (error) {
    return next(error);
  }
};

/* --------------------------------- CREATE ---------------------------------- */
exports.createEmployee = async (req, res, next) => {
  try {
    const {
      firstName, lastName, email, phone, gender, dateOfBirth,
      department, designation, dateOfJoining, employmentType, salary,
      status, address, city, state, pincode,
    } = req.body || {};

    // Basic required-field validation
    const required = { firstName, lastName, email, phone, gender, dateOfBirth, department, designation, dateOfJoining };
    const missing = Object.entries(required)
      .filter(([, v]) => v === undefined || String(v).trim() === '')
      .map(([k]) => k);
    if (missing.length) {
      if (req.file) deleteFile(req.file.filename);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    const duplicate = await Employee.findOne({ email: String(email).toLowerCase().trim() });
    if (duplicate) {
      if (req.file) deleteFile(req.file.filename);
      return res.status(409).json({ success: false, message: 'An employee with this email already exists' });
    }

    const employee = await Employee.create({
      employeeId: await generateEmployeeId(),
      firstName, lastName, email, phone, gender, dateOfBirth,
      department, designation, dateOfJoining,
      employmentType: employmentType || 'full-time',
      salary: salary === undefined || salary === '' ? 0 : Number(salary),
      status: status || 'active',
      address, city, state, pincode,
      photo: req.file ? `/uploads/employees/${req.file.filename}` : '',
      createdBy: req.user.id, // 🔐 which admin created this record
    });

    return res.status(201).json({ success: true, message: 'Employee created', data: employee });
  } catch (error) {
    if (req.file) deleteFile(req.file.filename);
    return next(error);
  }
};

/* --------------------------------- UPDATE ---------------------------------- */
exports.updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      if (req.file) deleteFile(req.file.filename);
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const body = req.body || {};
    if (body.email) {
      const normalized = String(body.email).toLowerCase().trim();
      const duplicate = await Employee.findOne({ email: normalized, _id: { $ne: employee._id } });
      if (duplicate) {
        if (req.file) deleteFile(req.file.filename);
        return res.status(409).json({ success: false, message: 'An employee with this email already exists' });
      }
      employee.email = normalized;
    }

    const editable = [
      'firstName', 'lastName', 'phone', 'gender', 'dateOfBirth', 'department',
      'designation', 'dateOfJoining', 'employmentType', 'status',
      'address', 'city', 'state', 'pincode',
    ];
    editable.forEach((field) => {
      if (body[field] !== undefined && body[field] !== '') employee[field] = body[field];
    });
    if (body.salary !== undefined && body.salary !== '') employee.salary = Number(body.salary);

    // New photo replaces the old one
    if (req.file) {
      const oldPhoto = employee.photo;
      employee.photo = `/uploads/employees/${req.file.filename}`;
      if (oldPhoto) deleteFile(oldPhoto.split('/').pop());
    }

    employee.updatedBy = req.user.id;
    await employee.save(); // runs schema validation

    return res.json({ success: true, message: 'Employee updated', data: employee });
  } catch (error) {
    if (req.file) deleteFile(req.file.filename);
    return next(error);
  }
};

/* --------------------------------- DELETE ---------------------------------- */
exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    await employee.deleteOne();
    if (employee.photo) deleteFile(employee.photo.split('/').pop());

    return res.json({ success: true, message: 'Employee deleted', data: { id: req.params.id } });
  } catch (error) {
    return next(error);
  }
};
