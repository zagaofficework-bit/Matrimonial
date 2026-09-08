import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getMyPreferences, saveMyPreferences } from '../../api/preference.api';
import MultiSelectDropdown from "../../components/MultiSelectDropDown/MultiSelectDropdown";
import { HEIGHT_OPTIONS } from '../../utils/Heightoptions';
import { INCOME_AMOUNT_OPTIONS, bracketToRupees, rupeesToBracket, bracketIndex } from '../../utils/Incomeoptions';
import { RELIGION_OPTIONS } from '../../utils/Religionoptions';
import { CASTE_OPTIONS } from '../../utils/Casteoptions';
import { EDUCATION_OPTIONS } from '../../utils/Educationoptions';
import { MOTHER_TONGUE_OPTIONS } from '../../utils/MotherTongueoptions';
import './Preferences.css';

const DIET_OPTIONS = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'non_vegetarian', label: 'Non-Vegetarian' },
  { value: 'eggetarian', label: 'Eggetarian' },
  { value: 'vegan', label: 'Vegan' }
];

const MARITAL_OPTIONS = [
  { value: 'never_married', label: 'Never Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'awaiting_divorce', label: 'Awaiting Divorce' }
];

const PROFILE_POSTED_BY_OPTIONS = [
  { value: 'self', label: 'Self' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'relative', label: 'Relative' },
  { value: 'friend', label: 'Friend' }
];

const initialForm = {
  ageMin: '',
  ageMax: '',
  heightMin: '',
  heightMax: '',
  incomeMin: '',
  incomeMax: '',
  religion: [],
  caste: [],
  education: [],
  location: '',
  motherTongue: [],
  diet: [],
  maritalStatus: [],
  profilePostedBy: [],
  strictFilter: false
};

function extractErrorMessage(err, fallback) {
  const data = err?.response?.data;
  if (!data) return err?.message || fallback;

  // Backend format: { message, error: { code, details: [...] } }
  if (Array.isArray(data.error?.details) && data.error.details.length > 0) {
    return data.error.details.join(' | ');
  }

  if (data.message) return data.message;
  return fallback;
}
// Splits a comma-separated string like "Mumbai, Pune" into a clean array.
function tagsToArray(str) {
  return str
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function arrayToTags(arr) {
  return Array.isArray(arr) ? arr.join(', ') : '';
}

export default function Preferences() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isOnboarding = searchParams.get('from') === 'profile-create';

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [rangeErrors, setRangeErrors] = useState({});

  useEffect(() => {
    let isMounted = true;

    async function loadExisting() {
      try {
        const pref = await getMyPreferences();
        if (!isMounted) return;
        setForm({
          ageMin: pref.ageRange?.min ?? '',
          ageMax: pref.ageRange?.max ?? '',
          heightMin: pref.heightRange?.min ?? '',
          heightMax: pref.heightRange?.max ?? '',
          incomeMin: rupeesToBracket(pref.incomeRange?.min),
          incomeMax: rupeesToBracket(pref.incomeRange?.max),
          religion: pref.religion || [],
          caste: pref.caste || [],
          education: pref.education || [],
          location: arrayToTags(pref.location),
          motherTongue: pref.motherTongue || [],
          diet: pref.diet || [],
          maritalStatus: pref.maritalStatus || [],
          profilePostedBy: pref.profilePostedBy || [],
          strictFilter: Boolean(pref.strictFilter)
        });
      } catch {
        // 404 PREFERENCE_NOT_FOUND -> first time, keep the defaults.
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadExisting();
    return () => {
      isMounted = false;
    };
  }, []);

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validateRangePair(minVal, maxVal, label) {
    if (minVal !== '' && maxVal !== '' && Number(minVal) > Number(maxVal)) {
      return `${label}: min cannot be greater than max.`;
    }
    return null;
  }

  // Income uses bracket strings ("3-5", "100+"), not plain numbers, so it
  // can't be compared with Number(minVal) > Number(maxVal) like the other
  // ranges - that would just produce NaN on both sides. Compare by each
  // bracket's position in the ordered options list instead.
  function validateIncomeRangePair(minVal, maxVal) {
    if (minVal !== '' && maxVal !== '' && bracketIndex(minVal) > bracketIndex(maxVal)) {
      return 'Salary: min cannot be greater than max.';
    }
    return null;
  }

  function buildRange(minVal, maxVal) {
    if (minVal === '' && maxVal === '') return undefined;
    const range = {};
    if (minVal !== '') range.min = Number(minVal);
    if (maxVal !== '') range.max = Number(maxVal);
    return range;
  }

  // Converts the two selected income brackets into a plain-rupee
  // { min, max } range for the backend (see bracketToRupees in
  // utils/Incomeoptions.js for why this can't just be Number(bracket)).
  function buildIncomeRange(minVal, maxVal) {
    if (minVal === '' && maxVal === '') return undefined;
    const range = {};
    if (minVal !== '') range.min = bracketToRupees(minVal, 'min');
    if (maxVal !== '') range.max = bracketToRupees(maxVal, 'max');
    return range;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const errors = {
      ageRange: validateRangePair(form.ageMin, form.ageMax, 'Age'),
      heightRange: validateRangePair(form.heightMin, form.heightMax, 'Height'),
      incomeRange: validateIncomeRangePair(form.incomeMin, form.incomeMax)
    };
    Object.keys(errors).forEach((key) => {
      if (!errors[key]) delete errors[key];
    });
    setRangeErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError('Please fix the highlighted fields.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ageRange: buildRange(form.ageMin, form.ageMax),
        heightRange: buildRange(form.heightMin, form.heightMax),
        incomeRange: buildIncomeRange(form.incomeMin, form.incomeMax),
        religion: form.religion,
        caste: form.caste,
        education: form.education,
        location: tagsToArray(form.location),
        motherTongue: form.motherTongue,
        diet: form.diet,
        maritalStatus: form.maritalStatus,
        profilePostedBy: form.profilePostedBy,
        strictFilter: form.strictFilter
      };
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) delete payload[key];
      });

      await saveMyPreferences(payload);
      setSuccessMsg('Your partner preferences have been saved.');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (isOnboarding) {
        setTimeout(() => navigate('/'), 1200);
      }
    } catch (err) {
      setError(extractErrorMessage(err, 'Preferences could not be saved. Please try again.'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <p className="state-message">Loading your preferences...</p>
      </div>
    );
  }

  return (
    <div className="page-container preferences-page">
      <div className="preferences-header">
        <h2>Partner Preferences</h2>
        <p className="home-subtitle">
          {isOnboarding
            ? 'One last step - tell us what you are looking for. Homepage suggestions will be sorted by how well they match.'
            : "Set what you're looking for - profiles on your homepage will show a match % based on this."}
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <form onSubmit={handleSubmit} className="preferences-form">
        <section className="preferences-section">
          <h3>Basic Range</h3>
          <div className="preferences-range-grid">
            <div className="field-group">
              <label htmlFor="ageMin">Age (years)</label>
              <div className="range-inputs">
                <input
                  id="ageMin"
                  type="number"
                  min="18"
                  max="100"
                  placeholder="Min"
                  value={form.ageMin}
                  onChange={(e) => setField('ageMin', e.target.value)}
                />
                <span>to</span>
                <input
                  type="number"
                  min="18"
                  max="100"
                  placeholder="Max"
                  value={form.ageMax}
                  onChange={(e) => setField('ageMax', e.target.value)}
                />
              </div>
              {rangeErrors.ageRange && <span className="field-error">{rangeErrors.ageRange}</span>}
            </div>

            <div className="field-group">
              <label htmlFor="heightMin">Height</label>
              <div className="range-inputs">
                <select id="heightMin" value={form.heightMin} onChange={(e) => setField('heightMin', e.target.value)}>
                  <option value="">Min</option>
                  {HEIGHT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span>to</span>
                <select value={form.heightMax} onChange={(e) => setField('heightMax', e.target.value)}>
                  <option value="">Max</option>
                  {HEIGHT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              {rangeErrors.heightRange && <span className="field-error">{rangeErrors.heightRange}</span>}
            </div>

            <div className="field-group">
              <label htmlFor="incomeMin">Annual Income</label>
              <div className="range-inputs">
                <select id="incomeMin" value={form.incomeMin} onChange={(e) => setField('incomeMin', e.target.value)}>
                  <option value="">Min</option>
                  {INCOME_AMOUNT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span>to</span>
                <select value={form.incomeMax} onChange={(e) => setField('incomeMax', e.target.value)}>
                  <option value="">Max</option>
                  {INCOME_AMOUNT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              {rangeErrors.incomeRange && <span className="field-error">{rangeErrors.incomeRange}</span>}
            </div>
          </div>
        </section>

        <section className="preferences-section">
          <h3>Community & Lifestyle</h3>
          <div className="preferences-range-grid">
            <MultiSelectDropdown
              label="Religion"
              options={RELIGION_OPTIONS}
              selected={form.religion}
              onChange={(val) => setField('religion', val)}
            />
            <MultiSelectDropdown
              label="Diet"
              options={DIET_OPTIONS}
              selected={form.diet}
              onChange={(val) => setField('diet', val)}
            />
            <MultiSelectDropdown
              label="Marital Status"
              options={MARITAL_OPTIONS}
              selected={form.maritalStatus}
              onChange={(val) => setField('maritalStatus', val)}
            />
            <MultiSelectDropdown
              label="Profile Posted By"
              options={PROFILE_POSTED_BY_OPTIONS}
              selected={form.profilePostedBy}
              onChange={(val) => setField('profilePostedBy', val)}
            />
            <MultiSelectDropdown
              label="Caste"
              options={CASTE_OPTIONS}
              selected={form.caste}
              onChange={(val) => setField('caste', val)}
            />
            <MultiSelectDropdown
              label="Education"
              options={EDUCATION_OPTIONS}
              selected={form.education}
              onChange={(val) => setField('education', val)}
            />
            <MultiSelectDropdown
              label="Mother Tongue"
              options={MOTHER_TONGUE_OPTIONS}
              selected={form.motherTongue}
              onChange={(val) => setField('motherTongue', val)}
            />
          </div>
        </section>

        <section className="preferences-section">
          <h3>More Details</h3>
          <div className="field-group">
            <label htmlFor="location">Location - city / state (comma separated)</label>
            <input
              id="location"
              type="text"
              placeholder="e.g. Mumbai, Pune"
              value={form.location}
              onChange={(e) => setField('location', e.target.value)}
            />
          </div>
        </section>

        <section className="preferences-section preferences-strict">
          <label className="strict-toggle">
            <input
              type="checkbox"
              checked={form.strictFilter}
              onChange={(e) => setField('strictFilter', e.target.checked)}
            />
            <span>
              Strict filter - only show profiles that match <strong>every</strong> criterion above (100% match)
            </span>
          </label>
          <p className="hint">
            Off by default: homepage shows profiles that match 60% or more of what you've set here.
          </p>
        </section>

        <div className="preferences-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
          {!isOnboarding && (
            <Link to="/" className="btn btn-outline">
              Skip for now
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}