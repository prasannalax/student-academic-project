/**
 * Section & Email validation helper for Frontend
 */

export const MIN_ROLL = BigInt('324103210001');
export const MAX_ROLL = BigInt('324103210250');

export const SECTION_RANGES = [
  { name: 'CSE 1', start: BigInt('324103210001'), end: BigInt('324103210063'), display: '324103210001 - 324103210063' },
  { name: 'CSE 2', start: BigInt('324103210064'), end: BigInt('324103210126'), display: '324103210064 - 324103210126' },
  { name: 'CSE 3', start: BigInt('324103210127'), end: BigInt('324103210189'), display: '324103210127 - 324103210189' },
  { name: 'CSE 4', start: BigInt('324103210190'), end: BigInt('324103210250'), display: '324103210190 - 324103210250' },
];

export const detectSection = (roll) => {
  if (!roll) return null;
  const clean = String(roll).trim();
  if (!/^\d{12}$/.test(clean)) return null;

  try {
    const num = BigInt(clean);
    if (num < MIN_ROLL || num > MAX_ROLL) return null;
    for (const s of SECTION_RANGES) {
      if (num >= s.start && num <= s.end) {
        return s.name;
      }
    }
  } catch (e) {
    return null;
  }
  return null;
};

export const validateStudentEmail = (email, roll) => {
  if (!email) return { isValid: false, message: 'College email is required.' };
  const cleanEmail = email.trim().toLowerCase();
  const cleanRoll = roll ? String(roll).trim() : '';

  if (!cleanEmail.endsWith('@gvpcew.ac.in')) {
    return {
      isValid: false,
      message: 'Must end with official domain @gvpcew.ac.in',
    };
  }

  const match = cleanEmail.match(/^([0-9]+)\.([a-z0-9_.-]+)@gvpcew\.ac\.in$/);
  if (!match) {
    return {
      isValid: false,
      message: 'Format must be: rollnumber.name@gvpcew.ac.in',
    };
  }

  const emailRoll = match[1];
  if (cleanRoll && emailRoll !== cleanRoll) {
    return {
      isValid: false,
      message: `Roll prefix (${emailRoll}) does not match entered roll number (${cleanRoll}).`,
    };
  }

  return { isValid: true, message: 'Valid official college email' };
};
