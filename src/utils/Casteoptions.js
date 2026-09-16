// Religion ke hisaab se caste options grouped hain. Naya religion add karna ho
// to isi object me ek naya key add kar do.
export const CASTE_OPTIONS_BY_RELIGION = {
  hindu: [
    'Agarwal', 'Arora', 'Baniya', 'Bhumihar', 'Brahmin', 'Chettiar', 'Gounder', 'Gupta',
    'Iyengar', 'Iyer', 'Jat', 'Kamma', 'Kapu', 'Kayastha', 'Khatri', 'Khandayat',
    'Kshatriya', 'Kurmi', 'Lingayat', 'Maratha', 'Nadar', 'Nair', 'Naidu', 'Patel',
    'Rajput', 'Reddy', 'Vaishya', 'Vanniyar', 'Vishwakarma', 'Yadav', 'Other'
  ],
  muslim: [
    'Sheikh', 'Syed', 'Pathan', 'Mughal', 'Ansari', 'Qureshi', 'Khan', 'Malik',
    'Shaikh', 'Baig', 'Rizvi', 'Chishti', 'Sunni', 'Shia', 'Other'
  ],
  sikh: [
    'Jat Sikh', 'Khatri Sikh', 'Ramgarhia', 'Ravidasia', 'Saini', 'Arora Sikh', 'Other'
  ],
  christian: [
    'Roman Catholic', 'Protestant', 'Syrian Christian', 'Latin Catholic', 'Baptist', 'Other'
  ],
  jain: [
    'Digambar', 'Shwetambar', 'Agrawal Jain', 'Oswal', 'Other'
  ],
  buddhist: [
    'Theravada', 'Mahayana', 'Navayana', 'Other'
  ],
  parsi: [
    'Zoroastrian', 'Other'
  ],
  jewish: [
    'Other'
  ],
  other: [
    'Other'
  ]
};

// Fallback - agar religion select nahi hui ho to purani flat list dikhado
export const CASTE_OPTIONS = Object.values(CASTE_OPTIONS_BY_RELIGION)
  .flat()
  .filter((v, i, arr) => arr.indexOf(v) === i)
  .map((c) => ({ value: c, label: c }));

// Religion ke hisaab se caste dropdown options nikalne wala helper.
export function getCasteOptions(religion) {
  const key = (religion || '').toLowerCase();
  const list = CASTE_OPTIONS_BY_RELIGION[key] || CASTE_OPTIONS_BY_RELIGION.other;
  return list.map((c) => ({ value: c, label: c }));
}