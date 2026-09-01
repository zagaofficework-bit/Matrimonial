// Preset annual-income slabs (in ₹) used for the Salary min/max dropdowns,
// on both the Preferences form and the Search filters. Backend
// incomeRange.min/max just take a plain number, so these values go
// straight through unchanged.
export const INCOME_AMOUNT_OPTIONS = [
  { value: 100000, label: '₹1 Lakh' },
  { value: 200000, label: '₹2 Lakh' },
  { value: 300000, label: '₹3 Lakh' },
  { value: 500000, label: '₹5 Lakh' },
  { value: 700000, label: '₹7 Lakh' },
  { value: 1000000, label: '₹10 Lakh' },
  { value: 1500000, label: '₹15 Lakh' },
  { value: 2000000, label: '₹20 Lakh' },
  { value: 3000000, label: '₹30 Lakh' },
  { value: 5000000, label: '₹50 Lakh' },
  { value: 7500000, label: '₹75 Lakh' },
  { value: 10000000, label: '₹1 Crore' },
  { value: 20000000, label: '₹2 Crore' },
  { value: 50000000, label: '₹5 Crore' }
];