// How well a profile matches a preference is calculated here - the
// backend only gives preference CRUD, no matching logic, so this is
// purely frontend (run on the profiles list that came from browseProfiles).

function calculateAge(dob) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function normalize(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

// Returns true/false when the profile has this field filled in, or `null`
// when it doesn't - `null` means "can't tell", not "doesn't match", so
// computeMatchScore below excludes it from scoring instead of counting it
// as a miss. Without this, any profile that simply hasn't filled in a
// field (very common for religion/caste/education on partial profiles)
// would get unfairly penalized on a criterion it never had a chance to
// satisfy.
function arrayIncludes(prefArray, value) {
  if (!value) return null;
  const norm = normalize(value);
  return prefArray.some((item) => normalize(item) === norm);
}

function rangeMatches(range, value) {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  if (range.min !== undefined && range.min !== null && num < range.min) return false;
  if (range.max !== undefined && range.max !== null && num > range.max) return false;
  return true;
}

function hasRange(range) {
  return range && (range.min !== undefined && range.min !== null || range.max !== undefined && range.max !== null);
}

// Scoring only covers criteria the user actually set in their preferences.
// Criteria they left unset don't count toward the denominator either - so
// even a partially-filled preference still gives a meaningful %.
// Return: 0-100 number, or null if no criteria are set at all (preference
// is empty / hasn't been created yet).
export function computeMatchScore(profile, preference) {
  if (!preference) return null;

  const results = [];

  // Only push a result when it's actually knowable (not null) - see the
  // comment on arrayIncludes/rangeMatches above for why.
  function pushIfKnown(value) {
    if (value !== null) results.push(value);
  }

  if (hasRange(preference.ageRange)) {
    pushIfKnown(rangeMatches(preference.ageRange, calculateAge(profile.user?.dob)));
  }
  if (hasRange(preference.heightRange)) {
    pushIfKnown(rangeMatches(preference.heightRange, profile.height));
  }
  if (hasRange(preference.incomeRange)) {
    pushIfKnown(rangeMatches(preference.incomeRange, profile.annualIncome));
  }
  if (preference.religion?.length) {
    pushIfKnown(arrayIncludes(preference.religion, profile.religion));
  }
  if (preference.caste?.length) {
    pushIfKnown(arrayIncludes(preference.caste, profile.caste));
  }
  if (preference.education?.length) {
    pushIfKnown(arrayIncludes(preference.education, profile.education));
  }
  if (preference.location?.length) {
    const cityMatch = arrayIncludes(preference.location, profile.city);
    const stateMatch = arrayIncludes(preference.location, profile.state);
    // Either field alone being unknown shouldn't drop the whole criterion -
    // only treat it as unknown if BOTH city and state are unset.
    if (cityMatch === null && stateMatch === null) {
      // neither field filled in - not knowable, skip
    } else {
      results.push(Boolean(cityMatch) || Boolean(stateMatch));
    }
  }
  if (preference.motherTongue?.length) {
    pushIfKnown(arrayIncludes(preference.motherTongue, profile.motherTongue));
  }
  if (preference.diet?.length) {
    pushIfKnown(arrayIncludes(preference.diet, profile.lifestyle?.diet));
  }
  if (preference.maritalStatus?.length) {
    pushIfKnown(arrayIncludes(preference.maritalStatus, profile.maritalStatus));
  }
  if (preference.profilePostedBy?.length) {
    pushIfKnown(arrayIncludes(preference.profilePostedBy, profile.user?.profileType));
  }

  if (results.length === 0) return null;

  const matchedCount = results.filter(Boolean).length;
  return Math.round((matchedCount / results.length) * 100);
}

// For Home page filtering: if no preference is set, nobody gets hidden
// (keeps the old behaviour intact). If strictFilter is ON, only 100%
// matches qualify, otherwise >= threshold (default 60).
// Age is a mandatory filter.
// Other preferences are scored normally.
// If strictFilter is ON, all selected preferences must match (100%).
// If strictFilter is OFF, overall score must be >= threshold (default 60).

export function meetsPreference(profile, preference, threshold = 60) {
  const score = computeMatchScore(profile, preference);

  if (score === null) return true;

  // --------------------------------------------------
  // AGE = HARD FILTER
  // --------------------------------------------------
  if (hasRange(preference.ageRange)) {
    const profileAge = calculateAge(profile.user?.dob);

    // If profile age is not available, don't show it
    // when the user has specified an age preference.
    if (profileAge === null) {
      return false;
    }

    // Profile MUST be inside the selected age range.
    if (
      preference.ageRange.min !== undefined &&
      preference.ageRange.min !== null &&
      profileAge < preference.ageRange.min
    ) {
      return false;
    }

    if (
      preference.ageRange.max !== undefined &&
      preference.ageRange.max !== null &&
      profileAge > preference.ageRange.max
    ) {
      return false;
    }
  }

  // --------------------------------------------------
  // OTHER PREFERENCES
  // --------------------------------------------------

  // Strict filter ON → everything selected must match.
  if (preference.strictFilter) {
    return score === 100;
  }

  // Strict filter OFF → 60%+ match.
  return score >= threshold;
}