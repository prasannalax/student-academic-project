/**
 * Section & Department Configuration for CSE
 * 
 * Total CSE range: 324103210001 - 324103210250
 * Modular section mapping:
 * - CSE 1: 324103210001 - 324103210063
 * - CSE 2: 324103210064 - 324103210126
 * - CSE 3: 324103210127 - 324103210189 (explicitly specified)
 * - CSE 4: 324103210190 - 324103210250
 */

const DEPARTMENT = 'CSE';
const DEPARTMENT_FULL_NAME = 'Computer Science & Engineering';

const SECTION_CONFIG = [
  {
    name: 'CSE 1',
    startRoll: BigInt('324103210001'),
    endRoll: BigInt('324103210063'),
    startStr: '324103210001',
    endStr: '324103210063',
  },
  {
    name: 'CSE 2',
    startRoll: BigInt('324103210064'),
    endRoll: BigInt('324103210126'),
    startStr: '324103210064',
    endStr: '324103210126',
  },
  {
    name: 'CSE 3',
    startRoll: BigInt('324103210127'),
    endRoll: BigInt('324103210189'),
    startStr: '324103210127',
    endStr: '324103210189',
  },
  {
    name: 'CSE 4',
    startRoll: BigInt('324103210190'),
    endRoll: BigInt('324103210250'),
    startStr: '324103210190',
    endStr: '324103210250',
  },
];

const SECTIONS = ['CSE 1', 'CSE 2', 'CSE 3', 'CSE 4'];
const TARGET_SECTIONS = ['CSE 1', 'CSE 2', 'CSE 3', 'CSE 4', 'All CSE Sections'];

const MIN_ROLL = BigInt('324103210001');
const MAX_ROLL = BigInt('324103210250');

/**
 * Determine section from roll number
 * @param {string|number} roll
 * @returns {string|null} section name (e.g., 'CSE 3') or null if invalid
 */
function getSectionFromRoll(roll) {
  if (!roll) return null;
  const cleanRoll = String(roll).trim();
  if (!/^\d{12}$/.test(cleanRoll)) {
    return null;
  }

  try {
    const rollNum = BigInt(cleanRoll);
    if (rollNum < MIN_ROLL || rollNum > MAX_ROLL) {
      return null;
    }

    for (const sec of SECTION_CONFIG) {
      if (rollNum >= sec.startRoll && rollNum <= sec.endRoll) {
        return sec.name;
      }
    }
  } catch (err) {
    return null;
  }

  return null;
}

/**
 * Validate college email address and verify roll number matching
 * Format required: rollnumber.name@gvpcew.ac.in
 * E.g., 324103210127.prasanna@gvpcew.ac.in
 * 
 * @param {string} email
 * @param {string} rollNumber
 * @returns {{ isValid: boolean, error?: string, emailRoll?: string, emailName?: string }}
 */
function validateCollegeEmail(email, rollNumber) {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'College email is required.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanRoll = rollNumber ? String(rollNumber).trim() : '';

  if (!cleanEmail.endsWith('@gvpcew.ac.in')) {
    return {
      isValid: false,
      error: 'College email must belong to the official domain @gvpcew.ac.in',
    };
  }

  // Regex pattern: ^(\d+)\.([a-z0-9_.-]+)@gvpcew\.ac\.in$
  const emailRegex = /^([0-9]+)\.([a-z0-9_.-]+)@gvpcew\.ac\.in$/;
  const match = cleanEmail.match(emailRegex);

  if (!match) {
    return {
      isValid: false,
      error: 'Email format must be: rollnumber.name@gvpcew.ac.in (e.g. 324103210127.prasanna@gvpcew.ac.in)',
    };
  }

  const emailRoll = match[1];
  const emailName = match[2];

  if (!emailName || emailName.length === 0) {
    return {
      isValid: false,
      error: 'Email must contain student name after the dot (e.g. rollnumber.name@gvpcew.ac.in).',
    };
  }

  if (cleanRoll && emailRoll !== cleanRoll) {
    return {
      isValid: false,
      error: `The roll number in your email address (${emailRoll}) does not match your entered roll number (${cleanRoll}).`,
    };
  }

  return {
    isValid: true,
    emailRoll,
    emailName,
  };
}

module.exports = {
  DEPARTMENT,
  DEPARTMENT_FULL_NAME,
  SECTION_CONFIG,
  SECTIONS,
  TARGET_SECTIONS,
  MIN_ROLL_STR: '324103210001',
  MAX_ROLL_STR: '324103210250',
  getSectionFromRoll,
  validateCollegeEmail,
};
