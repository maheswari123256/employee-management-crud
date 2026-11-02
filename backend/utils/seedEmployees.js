/**
 * utils/seedEmployees.js
 * Adds demo employees when they don't exist yet (disable with SEED_DEMO_DATA=false).
 * Idempotent: skips emails already in the DB and assigns fresh sequential IDs,
 * so it is safe to run multiple times / from multiple instances.
 * Photos are left empty → the UI shows an initials avatar.
 */
const Employee = require('../model/Employee');

const FIRST = ['Aarav', 'Diya', 'Kabir', 'Ananya', 'Rohan', 'Meera', 'Arjun', 'Isha', 'Vihaan', 'Sara',
  'Karthik', 'Priya', 'Rahul', 'Neha', 'Arun', 'Divya', 'Suresh', 'Kavya', 'Rajesh', 'Pooja',
  'Manoj', 'Lakshmi', 'Vikram', 'Shreya'];
const LAST = ['Sharma', 'Patel', 'Reddy', 'Nair', 'Iyer', 'Gupta', 'Verma', 'Khan', 'Das', 'Menon',
  'Rao', 'Chawla', 'Joshi', 'Pillai', 'Bose', 'Kulkarni', 'Mehta', 'Singh', 'Kumar', 'Shetty'];
const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'Sales', 'Finance', 'Human Resources', 'Operations', 'Customer Support', 'IT'];
const DESIGNATIONS = {
  Engineering: ['Software Engineer', 'Senior Software Engineer', 'Tech Lead'],
  Design: ['UI Designer', 'UX Designer', 'Design Lead'],
  Marketing: ['Marketing Executive', 'Content Strategist', 'SEO Analyst'],
  Sales: ['Sales Executive', 'Account Manager', 'Regional Sales Head'],
  Finance: ['Accountant', 'Finance Analyst', 'Chartered Accountant'],
  'Human Resources': ['HR Executive', 'Recruiter', 'HR Manager'],
  Operations: ['Operations Executive', 'Ops Manager'],
  'Customer Support': ['Support Agent', 'Support Lead'],
  IT: ['System Administrator', 'IT Support Engineer'],
};
const STATUSES = ['active', 'active', 'active', 'active', 'active', 'on-leave', 'inactive'];

const buildDoc = (i) => {
  const department = DEPARTMENTS[i % DEPARTMENTS.length];
  const gender = i % 3 === 0 ? 'female' : i % 3 === 1 ? 'male' : 'other';
  return {
    firstName: FIRST[i % FIRST.length],
    lastName: LAST[(i * 7) % LAST.length],
    email: `${FIRST[i % FIRST.length].toLowerCase()}.${LAST[(i * 7) % LAST.length].toLowerCase()}${i + 1}@wizinoa.com`,
    phone: `9${String(800000000 + i * 1234567).slice(0, 9)}`,
    gender,
    dateOfBirth: new Date(1988 + (i % 12), i % 12, ((i * 3) % 27) + 1),
    department,
    designation: DESIGNATIONS[department][i % DESIGNATIONS[department].length],
    dateOfJoining: new Date(2019 + (i % 6), (i * 2) % 12, ((i * 5) % 27) + 1),
    employmentType: ['full-time', 'full-time', 'full-time', 'part-time', 'contract', 'intern'][i % 6],
    salary: 300000 + ((i * 175000) % 1800000),
    status: STATUSES[i % STATUSES.length],
    address: `${12 + i} ${['MG Road', 'Station Road', 'Lake View', 'Park Street'][i % 4]}`,
    city: ['Chennai', 'Bengaluru', 'Hyderabad', 'Pune', 'Mumbai', 'Kochi'][i % 6],
    state: ['Tamil Nadu', 'Karnataka', 'Telangana', 'Maharashtra', 'Maharashtra', 'Kerala'][i % 6],
    pincode: String(600001 + i * 137),
    photo: '',
  };
};

const seedEmployees = async () => {
  try {
    if (process.env.SEED_DEMO_DATA === 'false') return;

    const docs = Array.from({ length: 24 }, (_, i) => buildDoc(i));

    // 1) skip records that already exist (by unique email)
    const existing = await Employee.find({ email: { $in: docs.map((d) => d.email) } }).select('email');
    const existingEmails = new Set(existing.map((e) => e.email));
    const toInsert = docs.filter((d) => !existingEmails.has(d.email));
    if (toInsert.length === 0) return;

    // 2) assign sequential IDs starting after the highest existing one
    const [last] = await Employee.find({ employeeId: /^EMP-\d+$/ })
      .select('employeeId')
      .sort({ employeeId: -1 })
      .limit(1)
      .lean();
    let next = (last ? parseInt(last.employeeId.slice(4), 10) : 0) + 1;
    for (const doc of toInsert) {
      let id = `EMP-${String(next).padStart(4, '0')}`;
      while (await Employee.exists({ employeeId: id })) {
        next += 1;
        id = `EMP-${String(next).padStart(4, '0')}`;
      }
      doc.employeeId = id;
      next += 1;
    }

    await Employee.insertMany(toInsert, { ordered: false });
    console.log(`🌱 Seeded ${toInsert.length} demo employees`);
  } catch (error) {
    console.error(`❌ Employee seed failed: ${error.message}`);
  }
};

module.exports = seedEmployees;
