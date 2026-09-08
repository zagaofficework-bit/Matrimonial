// Preset annual-income *brackets* (in Lakh) used for the Salary min/max
// dropdowns, on both the Preferences form and the Search filters.
//
// IMPORTANT: unlike the comment here used to claim, `value` is NOT a plain
// rupee number - it's a bracket string like "3-5" (3-5 Lakh) or "100+"
// (1 Crore and above). The backend's incomeRange.min/max fields are plain
// rupee numbers (see preference.validator.js), so a bracket has to be
// converted to a rupee figure before it's sent, and converted back when an
// existing preference is loaded into the form. Use the helpers below for
// that instead of calling Number(value) directly on a bracket string.
export const INCOME_AMOUNT_OPTIONS = [
  { value: "0-3", label: "Rs. 0 - 3 Lakh p.a" },
  { value: "3-5", label: "Rs. 3 - 5 Lakh p.a" },
  { value: "5-7.5", label: "Rs. 5 - 7.5 Lakh p.a" },
  { value: "7.5-10", label: "Rs. 7.5 - 10 Lakh p.a" },
  { value: "10-15", label: "Rs. 10 - 15 Lakh p.a" },
  { value: "15-20", label: "Rs. 15 - 20 Lakh p.a" },
  { value: "20-30", label: "Rs. 20 - 30 Lakh p.a" },
  { value: "30-50", label: "Rs. 30 - 50 Lakh p.a" },
  { value: "50-75", label: "Rs. 50 - 75 Lakh p.a" },
  { value: "75-100", label: "Rs. 75 Lakh - 1 Crore p.a" },
  { value: "100+", label: "Rs. 1 Crore+ p.a" }
];

const LAKH = 100000;
// Matches the upper bound of incomeRange in preference.validator.js
// (rangeSchema(0, 100000000)), used as the effective ceiling for "100+".
const MAX_INCOME_RUPEES = 100000000;

// Converts a bracket value ("3-5", "100+") to a single rupee number.
// `edge` picks which side of the bracket to use:
//  - 'min' -> the bracket's lower bound (used when this bracket was picked
//    in the "Min" dropdown - "at least this much")
//  - 'max' -> the bracket's upper bound (used when picked in "Max" -
//    "at most this much")
export function bracketToRupees(bracket, edge) {
  if (!bracket) return undefined;

  if (bracket.endsWith('+')) {
    const lakh = parseFloat(bracket);
    return edge === 'min' ? lakh * LAKH : MAX_INCOME_RUPEES;
  }

  const [lowLakh, highLakh] = bracket.split('-').map(Number);
  return edge === 'min' ? lowLakh * LAKH : highLakh * LAKH;
}

// Reverse lookup: given a rupee number (as returned by the backend for an
// already-saved preference), finds the bracket whose range contains it, so
// the dropdown can show the right selection when the form loads.
export function rupeesToBracket(rupees) {
  if (rupees === undefined || rupees === null || rupees === '') return '';
  const lakh = rupees / LAKH;

  for (const opt of INCOME_AMOUNT_OPTIONS) {
    if (opt.value.endsWith('+')) {
      if (lakh >= parseFloat(opt.value)) return opt.value;
      continue;
    }
    const [low, high] = opt.value.split('-').map(Number);
    if (lakh >= low && lakh <= high) return opt.value;
  }
  return '';
}

// Position of a bracket in the ordered list - used to compare "is min
// bracket after max bracket" without trying to parse/compare the raw
// strings numerically.
export function bracketIndex(bracket) {
  return INCOME_AMOUNT_OPTIONS.findIndex((o) => o.value === bracket);
}