// Centralized religion list so Profile / Preferences / Search all stay in sync.
export const RELIGION_OPTIONS = [
  'Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Parsi', 'Jewish', 'Other'
].map((r) => ({ value: r, label: r }));
