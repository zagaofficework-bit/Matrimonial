// Preference ke saath profile ka kitna % match hota hai, ye yahan calculate
// hota hai - backend abhi sirf preference CRUD deta hai, matching logic nahi,
// isliye ye purely frontend par ho raha hai (browseProfiles se aayi profiles
// list par).

function calculateAge(dob) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function normalize(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

function arrayIncludes(prefArray, value) {
  if (!value) return false;
  const norm = normalize(value);
  return prefArray.some((item) => normalize(item) === norm);
}

function rangeMatches(range, value) {
  if (value === undefined || value === null || value === '') return false;
  const num = Number(value);
  if (Number.isNaN(num)) return false;
  if (range.min !== undefined && range.min !== null && num < range.min) return false;
  if (range.max !== undefined && range.max !== null && num > range.max) return false;
  return true;
}

function hasRange(range) {
  return range && (range.min !== undefined && range.min !== null || range.max !== undefined && range.max !== null);
}

// preference me user ne jo bhi criteria bhare hain unhi par score banta hai.
// Jo criteria set hi nahi kiye, wo denominator me bhi count nahi hote -
// isliye ek partial preference bhi meaningful % deta hai.
// Return: 0-100 number, ya null agar koi criteria set hi nahi (preference
// khali hai / abhi tak bani hi nahi).
export function computeMatchScore(profile, preference) {
  if (!preference) return null;

  const results = [];

  if (hasRange(preference.ageRange)) {
    results.push(rangeMatches(preference.ageRange, calculateAge(profile.user?.dob)));
  }
  if (hasRange(preference.heightRange)) {
    results.push(rangeMatches(preference.heightRange, profile.height));
  }
  if (hasRange(preference.incomeRange)) {
    results.push(rangeMatches(preference.incomeRange, profile.annualIncome));
  }
  if (preference.religion?.length) {
    results.push(arrayIncludes(preference.religion, profile.religion));
  }
  if (preference.caste?.length) {
    results.push(arrayIncludes(preference.caste, profile.caste));
  }
  if (preference.education?.length) {
    results.push(arrayIncludes(preference.education, profile.education));
  }
  if (preference.location?.length) {
    results.push(
      arrayIncludes(preference.location, profile.city) || arrayIncludes(preference.location, profile.state)
    );
  }
  if (preference.motherTongue?.length) {
    results.push(arrayIncludes(preference.motherTongue, profile.motherTongue));
  }
  if (preference.diet?.length) {
    results.push(arrayIncludes(preference.diet, profile.lifestyle?.diet));
  }
  if (preference.maritalStatus?.length) {
    results.push(arrayIncludes(preference.maritalStatus, profile.maritalStatus));
  }
  if (preference.profilePostedBy?.length) {
    results.push(arrayIncludes(preference.profilePostedBy, profile.user?.profileType));
  }

  if (results.length === 0) return null;

  const matchedCount = results.filter(Boolean).length;
  return Math.round((matchedCount / results.length) * 100);
}

// Home page filtering ke liye: preference set nahi hai to kisi ko bhi hide
// nahi karta (purana behaviour intact rehta hai). strictFilter ON hai to
// sirf 100% match wale hi qualify karte hain, warna >= threshold (default 60).
export function meetsPreference(profile, preference, threshold = 60) {
  const score = computeMatchScore(profile, preference);
  if (score === null) return true;
  if (preference.strictFilter) return score === 100;
  return score >= threshold;
}