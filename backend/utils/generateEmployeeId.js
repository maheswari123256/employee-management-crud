/**
 * utils/generateEmployeeId.js
 * Generates the next sequential employee id, e.g. EMP-0001, EMP-0002 …
 * Uses the highest existing number (not count) so gaps/duplicates can never collide.
 */
const Employee = require('../model/Employee');

const generateEmployeeId = async () => {
  const [last] = await Employee.find({ employeeId: /^EMP-\d+$/ })
    .select('employeeId')
    .sort({ employeeId: -1 })
    .limit(1)
    .lean();

  const max = last ? parseInt(last.employeeId.slice(4), 10) : 0;

  for (let n = max + 1; n <= max + 500; n++) {
    const candidate = `EMP-${String(n).padStart(4, '0')}`;
    // eslint-disable-next-line no-await-in-loop
    const exists = await Employee.exists({ employeeId: candidate });
    if (!exists) return candidate;
  }

  // Extremely unlikely fallback
  return `EMP-${Date.now().toString().slice(-6)}`;
};

module.exports = generateEmployeeId;
