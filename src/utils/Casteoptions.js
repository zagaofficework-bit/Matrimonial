// NOTE: generic starting list only, not exhaustive - caste names vary a lot by
// religion/region. Consider replacing this later with values fetched from your
// backend (e.g. distinct castes already saved on user profiles) once you have
// real data, and/or add a free-text "Other" fallback in the UI.
export const CASTE_OPTIONS = [
  'Agarwal', 'Arora', 'Baniya', 'Bhumihar', 'Brahmin', 'Chettiar', 'Gounder', 'Gupta', 'Iyengar', 'Iyer',
  'Jat', 'Jatt Sikh', 'Kamma', 'Kapu', 'Kayastha', 'Khatri', 'Khandayat', 'Kshatriya', 'Kurmi', 'Lingayat',
  'Maratha', 'Nadar', 'Nair', 'Naidu', 'Patel', 'Rajput', 'Reddy', 'Sindhi', 'Vaishya', 'Vanniyar',
  'Vishwakarma', 'Yadav', 'Other'
].map((c) => ({ value: c, label: c }));