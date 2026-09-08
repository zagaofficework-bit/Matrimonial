// The 22 scheduled languages of India, plus a few common additions and an
// "Other" fallback, so the dropdown covers virtually every mother tongue.
export const MOTHER_TONGUE_OPTIONS = [
  'Assamese', 'Bengali', 'Bodo', 'Dogri', 'English', 'Gujarati', 'Hindi', 'Kannada',
  'Kashmiri', 'Konkani', 'Maithili', 'Malayalam', 'Manipuri', 'Marathi', 'Nepali',
  'Odia', 'Punjabi', 'Sanskrit', 'Santali', 'Sindhi', 'Tamil', 'Telugu', 'Urdu', 'Other'
].map((lang) => ({ value: lang, label: lang }));
