import { useEffect, useRef, useState } from 'react';
import ProfileCard from '../../components/ProfileCard/ProfileCard';
import FilterTab from '../../components/Filtertabs/FilterTab';
import { searchProfiles } from '../../api/search.api';
import { getSavedProfileIds } from '../../api/savedProfile.api';
import { STATE_OPTIONS } from '../../utils/StateOptions';
import { EDUCATION_OPTIONS } from '../../utils/EducationOptions';
import { OCCUPATION_OPTIONS } from '../../utils/OccupationOptions';
import { CASTE_OPTIONS } from '../../utils/CasteOptions';
import './Search.css';

const EMPTY_FILTERS = {
  city: '',
  ageMin: '',
  ageMax: '',
  heightMin: '',
  heightMax: '',
  incomeMin: '',
  incomeMax: '',
  religion: [],
  caste: [],
  education: [],
  occupation: [],
  maritalStatus: [],
  state: [],
  gender: ''
};

const RELIGION_OPTIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Parsi', 'Jewish', 'Other'].map(
  (opt) => ({ value: opt, label: opt })
);

const MARITAL_OPTIONS = [
  { value: 'never_married', label: 'Never Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'awaiting_divorce', label: 'Awaiting Divorce' }
];

const GENDER_OPTIONS = [
  { value: '', label: 'Default (opposite gender)' },
  { value: 'male', label: 'Male profiles' },
  { value: 'female', label: 'Female profiles' },
  { value: 'other', label: 'Other' }
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

// Multi-select filters backend ko comma-separated string ke roop mein jaate hain
// (e.g. "Hindu,Sikh") - backend ko in fields par comma list -> $in query handle
// karni chahiye.
function serializeFilters(f) {
  return {
    ...f,
    religion: f.religion.join(','),
    caste: f.caste.join(','),
    education: f.education.join(','),
    occupation: f.occupation.join(','),
    maritalStatus: f.maritalStatus.join(','),
    state: f.state.join(',')
  };
}

function rangeChipLabel(title, min, max) {
  if (min && max) return `${title}: ${min}-${max}`;
  if (min) return `${title}: ${min}+`;
  if (max) return `${title}: up to ${max}`;
  return '';
}

// Multi-select ke liye pill label: 1-2 selected ho to naam dikhao, usse zyada
// ho to sirf count.
function multiChipLabel(values, options) {
  if (!values || values.length === 0) return '';
  const labels = values.map((v) => options.find((o) => o.value === v)?.label || v);
  return labels.length <= 2 ? labels.join(', ') : `${labels.length} selected`;
}

export default function Search() {
  // draft = jo popover abhi khula hai uske unsaved edits. appliedFilters = jo
  // actually search me use ho raha hai. Tab open karte waqt draft ko applied
  // se sync kar dete hain, Apply dabane par draft->applied commit hota hai.
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [openTab, setOpenTab] = useState(null);

  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedIds, setSavedIds] = useState([]);

  const filterBarRef = useRef(null);

  useEffect(() => {
    getSavedProfileIds()
      .then(setSavedIds)
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target)) {
        setOpenTab(null);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function runSearch() {
      setLoading(true);
      setError('');
      try {
        const data = await searchProfiles({ ...serializeFilters(appliedFilters), page, limit: 12 });
        if (isMounted) {
          setResults(data.results);
          setPagination(data.pagination);
        }
      } catch (err) {
        if (isMounted) setError(err.response?.data?.message || 'Search results load nahi ho paye.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    runSearch();
    return () => {
      isMounted = false;
    };
  }, [appliedFilters, page]);

  function toggleTab(key) {
    if (openTab === key) {
      setOpenTab(null);
      return;
    }
    setDraft({ ...appliedFilters });
    setOpenTab(key);
  }

  function setDraftField(name, value) {
    setDraft((prev) => ({ ...prev, [name]: value }));
  }

  function toggleDraftValue(name, value) {
    setDraft((prev) => {
      const current = prev[name];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, [name]: next };
    });
  }

  function applyFields(fields) {
    setAppliedFilters((prev) => {
      const next = { ...prev };
      fields.forEach((f) => {
        next[f] = draft[f];
      });
      return next;
    });
    setPage(1);
    setOpenTab(null);
  }

  function clearFields(fields) {
    const cleared = {};
    fields.forEach((f) => {
      cleared[f] = Array.isArray(EMPTY_FILTERS[f]) ? [] : '';
    });
    setDraft((prev) => ({ ...prev, ...cleared }));
    setAppliedFilters((prev) => ({ ...prev, ...cleared }));
    setPage(1);
    setOpenTab(null);
  }

  function selectGender(value) {
    setDraftField('gender', value);
    setAppliedFilters((prev) => ({ ...prev, gender: value }));
    setPage(1);
    setOpenTab(null);
  }

  function handleCitySubmit(e) {
    e.preventDefault();
    applyFields(['city']);
  }

  function handleResetAll() {
    setDraft(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setPage(1);
    setOpenTab(null);
  }

  const hasAnyFilter = Object.values(appliedFilters).some((v) => (Array.isArray(v) ? v.length > 0 : v !== ''));

  return (
    <div className="page-container">
      <div className="home-header">
        <h2>Search Profiles</h2>
        <p className="home-subtitle">Age, salary, city, height aur baki filters ke hisaab se dhundo</p>
      </div>

      <form className="search-bar" onSubmit={handleCitySubmit}>
        <span className="search-bar-icon">
          <SearchIcon />
        </span>
        <input
          type="text"
          name="city"
          placeholder="Search profiles by city..."
          value={draft === appliedFilters ? appliedFilters.city : draft.city}
          onChange={(e) => setDraftField('city', e.target.value)}
        />
        {draft.city && (
          <button
            type="button"
            className="search-bar-clear"
            aria-label="Clear city search"
            onClick={() => clearFields(['city'])}
          >
            <CloseIcon />
          </button>
        )}
        <button type="submit" className="search-bar-submit" aria-label="Search">
          <SearchIcon />
        </button>
      </form>

      <div className="filter-bar" ref={filterBarRef}>
        <div className="filter-bar-tabs">
          <FilterTab
            label="Age"
            activeLabel={rangeChipLabel('Age', appliedFilters.ageMin, appliedFilters.ageMax)}
            isOpen={openTab === 'age'}
            onToggle={() => toggleTab('age')}
            onClear={() => clearFields(['ageMin', 'ageMax'])}
          >
            <div className="ftab-range-row">
              <input
                type="number"
                min="18"
                max="100"
                placeholder="Min"
                value={draft.ageMin}
                onChange={(e) => setDraftField('ageMin', e.target.value)}
              />
              <span>to</span>
              <input
                type="number"
                min="18"
                max="100"
                placeholder="Max"
                value={draft.ageMax}
                onChange={(e) => setDraftField('ageMax', e.target.value)}
              />
            </div>
            <div className="ftab-popover-actions">
              <button type="button" className="link-btn" onClick={() => clearFields(['ageMin', 'ageMax'])}>
                Clear
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => applyFields(['ageMin', 'ageMax'])}>
                Apply
              </button>
            </div>
          </FilterTab>

          <FilterTab
            label="Height"
            activeLabel={rangeChipLabel('Height', appliedFilters.heightMin, appliedFilters.heightMax)}
            isOpen={openTab === 'height'}
            onToggle={() => toggleTab('height')}
            onClear={() => clearFields(['heightMin', 'heightMax'])}
          >
            <div className="ftab-range-row">
              <input
                type="number"
                min="100"
                max="250"
                placeholder="Min (cm)"
                value={draft.heightMin}
                onChange={(e) => setDraftField('heightMin', e.target.value)}
              />
              <span>to</span>
              <input
                type="number"
                min="100"
                max="250"
                placeholder="Max (cm)"
                value={draft.heightMax}
                onChange={(e) => setDraftField('heightMax', e.target.value)}
              />
            </div>
            <div className="ftab-popover-actions">
              <button type="button" className="link-btn" onClick={() => clearFields(['heightMin', 'heightMax'])}>
                Clear
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => applyFields(['heightMin', 'heightMax'])}
              >
                Apply
              </button>
            </div>
          </FilterTab>

          <FilterTab
            label="Salary"
            activeLabel={rangeChipLabel('Salary', appliedFilters.incomeMin, appliedFilters.incomeMax)}
            isOpen={openTab === 'income'}
            onToggle={() => toggleTab('income')}
            onClear={() => clearFields(['incomeMin', 'incomeMax'])}
          >
            <div className="ftab-range-row">
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={draft.incomeMin}
                onChange={(e) => setDraftField('incomeMin', e.target.value)}
              />
              <span>to</span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={draft.incomeMax}
                onChange={(e) => setDraftField('incomeMax', e.target.value)}
              />
            </div>
            <div className="ftab-popover-actions">
              <button type="button" className="link-btn" onClick={() => clearFields(['incomeMin', 'incomeMax'])}>
                Clear
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => applyFields(['incomeMin', 'incomeMax'])}
              >
                Apply
              </button>
            </div>
          </FilterTab>

          <FilterTab
            label="Religion"
            activeLabel={multiChipLabel(appliedFilters.religion, RELIGION_OPTIONS)}
            isOpen={openTab === 'religion'}
            onToggle={() => toggleTab('religion')}
            onClear={() => clearFields(['religion'])}
          >
            <div className="ftab-checklist">
              {RELIGION_OPTIONS.map((opt) => (
                <label key={opt.value} className="ftab-option">
                  <input
                    type="checkbox"
                    checked={draft.religion.includes(opt.value)}
                    onChange={() => toggleDraftValue('religion', opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            <div className="ftab-popover-actions">
              <button type="button" className="link-btn" onClick={() => clearFields(['religion'])}>
                Clear
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => applyFields(['religion'])}>
                Apply
              </button>
            </div>
          </FilterTab>

          <FilterTab
            label="Profession"
            activeLabel={multiChipLabel(appliedFilters.occupation, OCCUPATION_OPTIONS)}
            isOpen={openTab === 'occupation'}
            onToggle={() => toggleTab('occupation')}
            onClear={() => clearFields(['occupation'])}
          >
            <div className="ftab-checklist">
              {OCCUPATION_OPTIONS.map((opt) => (
                <label key={opt.value} className="ftab-option">
                  <input
                    type="checkbox"
                    checked={draft.occupation.includes(opt.value)}
                    onChange={() => toggleDraftValue('occupation', opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            <div className="ftab-popover-actions">
              <button type="button" className="link-btn" onClick={() => clearFields(['occupation'])}>
                Clear
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => applyFields(['occupation'])}>
                Apply
              </button>
            </div>
          </FilterTab>

          <FilterTab
            label="Education"
            activeLabel={multiChipLabel(appliedFilters.education, EDUCATION_OPTIONS)}
            isOpen={openTab === 'education'}
            onToggle={() => toggleTab('education')}
            onClear={() => clearFields(['education'])}
          >
            <div className="ftab-checklist">
              {EDUCATION_OPTIONS.map((opt) => (
                <label key={opt.value} className="ftab-option">
                  <input
                    type="checkbox"
                    checked={draft.education.includes(opt.value)}
                    onChange={() => toggleDraftValue('education', opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            <div className="ftab-popover-actions">
              <button type="button" className="link-btn" onClick={() => clearFields(['education'])}>
                Clear
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => applyFields(['education'])}>
                Apply
              </button>
            </div>
          </FilterTab>

          <FilterTab
            label="Caste"
            activeLabel={multiChipLabel(appliedFilters.caste, CASTE_OPTIONS)}
            isOpen={openTab === 'caste'}
            onToggle={() => toggleTab('caste')}
            onClear={() => clearFields(['caste'])}
          >
            <div className="ftab-checklist">
              {CASTE_OPTIONS.map((opt) => (
                <label key={opt.value} className="ftab-option">
                  <input
                    type="checkbox"
                    checked={draft.caste.includes(opt.value)}
                    onChange={() => toggleDraftValue('caste', opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            <div className="ftab-popover-actions">
              <button type="button" className="link-btn" onClick={() => clearFields(['caste'])}>
                Clear
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => applyFields(['caste'])}>
                Apply
              </button>
            </div>
          </FilterTab>

          <FilterTab
            label="State"
            activeLabel={multiChipLabel(appliedFilters.state, STATE_OPTIONS)}
            isOpen={openTab === 'state'}
            onToggle={() => toggleTab('state')}
            onClear={() => clearFields(['state'])}
          >
            <div className="ftab-checklist">
              {STATE_OPTIONS.map((opt) => (
                <label key={opt.value} className="ftab-option">
                  <input
                    type="checkbox"
                    checked={draft.state.includes(opt.value)}
                    onChange={() => toggleDraftValue('state', opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            <div className="ftab-popover-actions">
              <button type="button" className="link-btn" onClick={() => clearFields(['state'])}>
                Clear
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => applyFields(['state'])}>
                Apply
              </button>
            </div>
          </FilterTab>

          <FilterTab
            label="Marital Status"
            activeLabel={multiChipLabel(appliedFilters.maritalStatus, MARITAL_OPTIONS)}
            isOpen={openTab === 'maritalStatus'}
            onToggle={() => toggleTab('maritalStatus')}
            onClear={() => clearFields(['maritalStatus'])}
          >
            <div className="ftab-checklist">
              {MARITAL_OPTIONS.map((opt) => (
                <label key={opt.value} className="ftab-option">
                  <input
                    type="checkbox"
                    checked={draft.maritalStatus.includes(opt.value)}
                    onChange={() => toggleDraftValue('maritalStatus', opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            <div className="ftab-popover-actions">
              <button type="button" className="link-btn" onClick={() => clearFields(['maritalStatus'])}>
                Clear
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => applyFields(['maritalStatus'])}>
                Apply
              </button>
            </div>
          </FilterTab>

          <FilterTab
            label="Show Me"
            activeLabel={appliedFilters.gender ? GENDER_OPTIONS.find((o) => o.value === appliedFilters.gender)?.label : ''}
            isOpen={openTab === 'gender'}
            onToggle={() => toggleTab('gender')}
            onClear={() => clearFields(['gender'])}
          >
            <div className="ftab-radio-list">
              {GENDER_OPTIONS.map((opt) => (
                <label key={opt.value || 'default'} className="ftab-option">
                  <input
                    type="radio"
                    name="gender"
                    checked={draft.gender === opt.value}
                    onChange={() => selectGender(opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            <p className="ftab-hint">By default hum tumhe opposite gender ki profiles dikhate hain.</p>
          </FilterTab>
        </div>

        {hasAnyFilter && (
          <button type="button" className="filter-chip filter-chip-reset" onClick={handleResetAll}>
            Reset all
            <CloseIcon />
          </button>
        )}
      </div>

      {loading && <p className="state-message">Loading profiles...</p>}
      {!loading && error && <p className="state-message">{error}</p>}
      {!loading && !error && results.length === 0 && (
        <p className="state-message">No profiles match these filters. Try adjusting them.</p>
      )}

      {!loading && !error && results.length > 0 && (
        <>
          <div className="search-result-grid">
            {results.map((profile) => (
              <ProfileCard key={profile._id} profile={profile} initiallySaved={savedIds.includes(profile._id)} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="search-pagination">
              <button
                type="button"
                className="btn btn-outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="search-pagination-info">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                type="button"
                className="btn btn-outline"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}