import { useEffect, useRef, useState } from 'react';
import ProfileCard from '../../components/ProfileCard/ProfileCard';
import { searchProfiles } from '../../api/search.api';
import './Search.css';

const EMPTY_FILTERS = {
  city: '',
  ageMin: '',
  ageMax: '',
  heightMin: '',
  heightMax: '',
  incomeMin: '',
  incomeMax: '',
  religion: '',
  caste: '',
  education: '',
  occupation: '',
  maritalStatus: '',
  gender: ''
};

const RELIGION_OPTIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Parsi', 'Jewish', 'Other'];

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

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export default function Search() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [openChip, setOpenChip] = useState(null);

  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const chipBarRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (chipBarRef.current && !chipBarRef.current.contains(e.target)) {
        setOpenChip(null);
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
        const data = await searchProfiles({ ...appliedFilters, page, limit: 12 });
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

  function setField(name, value) {
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  function runFilters(next) {
    setPage(1);
    setAppliedFilters(next);
  }

  function handleCitySubmit(e) {
    e.preventDefault();
    runFilters(filters);
  }

  function applyChip() {
    runFilters(filters);
    setOpenChip(null);
  }

  function clearChip(fields) {
    const next = { ...filters };
    fields.forEach((f) => {
      next[f] = '';
    });
    setFilters(next);
    runFilters(next);
  }

  function handleResetAll() {
    setFilters(EMPTY_FILTERS);
    setPage(1);
    setAppliedFilters(EMPTY_FILTERS);
    setOpenChip(null);
  }

  function toggleChip(key) {
    setOpenChip((prev) => (prev === key ? null : key));
  }

  const hasAnyFilter = Object.values(appliedFilters).some((v) => v !== '');

  function rangeChipLabel(title, min, max) {
    if (min && max) return `${title}: ${min}-${max}`;
    if (min) return `${title}: ${min}+`;
    if (max) return `${title}: up to ${max}`;
    return title;
  }

  function valueChipLabel(title, value, optionLabel) {
    return value ? optionLabel || value : title;
  }

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
          value={filters.city}
          onChange={(e) => setField('city', e.target.value)}
        />
        {filters.city && (
          <button
            type="button"
            className="search-bar-clear"
            aria-label="Clear city search"
            onClick={() => {
              setField('city', '');
              runFilters({ ...filters, city: '' });
            }}
          >
            <CloseIcon />
          </button>
        )}
        <button type="submit" className="search-bar-submit" aria-label="Search">
          <SearchIcon />
        </button>
      </form>

      <div className="filter-chip-bar" ref={chipBarRef}>
        {/* Age */}
        <div className="filter-chip-wrap">
          <button
            type="button"
            className={`filter-chip ${filters.ageMin || filters.ageMax ? 'filter-chip-active' : ''}`}
            onClick={() => toggleChip('age')}
          >
            {rangeChipLabel('Age', filters.ageMin, filters.ageMax)}
            <ChevronIcon />
          </button>
          {openChip === 'age' && (
            <div className="filter-popover">
              <div className="filter-popover-row">
                <input
                  type="number"
                  min="18"
                  max="100"
                  placeholder="Min"
                  value={filters.ageMin}
                  onChange={(e) => setField('ageMin', e.target.value)}
                />
                <span>to</span>
                <input
                  type="number"
                  min="18"
                  max="100"
                  placeholder="Max"
                  value={filters.ageMax}
                  onChange={(e) => setField('ageMax', e.target.value)}
                />
              </div>
              <div className="filter-popover-actions">
                <button type="button" className="link-btn" onClick={() => clearChip(['ageMin', 'ageMax'])}>
                  Clear
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={applyChip}>
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Height */}
        <div className="filter-chip-wrap">
          <button
            type="button"
            className={`filter-chip ${filters.heightMin || filters.heightMax ? 'filter-chip-active' : ''}`}
            onClick={() => toggleChip('height')}
          >
            {rangeChipLabel('Height', filters.heightMin, filters.heightMax)}
            <ChevronIcon />
          </button>
          {openChip === 'height' && (
            <div className="filter-popover">
              <div className="filter-popover-row">
                <input
                  type="number"
                  min="100"
                  max="250"
                  placeholder="Min cm"
                  value={filters.heightMin}
                  onChange={(e) => setField('heightMin', e.target.value)}
                />
                <span>to</span>
                <input
                  type="number"
                  min="100"
                  max="250"
                  placeholder="Max cm"
                  value={filters.heightMax}
                  onChange={(e) => setField('heightMax', e.target.value)}
                />
              </div>
              <div className="filter-popover-actions">
                <button type="button" className="link-btn" onClick={() => clearChip(['heightMin', 'heightMax'])}>
                  Clear
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={applyChip}>
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Income */}
        <div className="filter-chip-wrap">
          <button
            type="button"
            className={`filter-chip ${filters.incomeMin || filters.incomeMax ? 'filter-chip-active' : ''}`}
            onClick={() => toggleChip('income')}
          >
            {rangeChipLabel('Salary', filters.incomeMin, filters.incomeMax)}
            <ChevronIcon />
          </button>
          {openChip === 'income' && (
            <div className="filter-popover">
              <div className="filter-popover-row">
                <input
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={filters.incomeMin}
                  onChange={(e) => setField('incomeMin', e.target.value)}
                />
                <span>to</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={filters.incomeMax}
                  onChange={(e) => setField('incomeMax', e.target.value)}
                />
              </div>
              <div className="filter-popover-actions">
                <button type="button" className="link-btn" onClick={() => clearChip(['incomeMin', 'incomeMax'])}>
                  Clear
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={applyChip}>
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Religion */}
        <div className="filter-chip-wrap">
          <button
            type="button"
            className={`filter-chip ${filters.religion ? 'filter-chip-active' : ''}`}
            onClick={() => toggleChip('religion')}
          >
            {valueChipLabel('Religion', filters.religion)}
            <ChevronIcon />
          </button>
          {openChip === 'religion' && (
            <div className="filter-popover filter-popover-options">
              <button
                type="button"
                className={`filter-option ${!filters.religion ? 'filter-option-selected' : ''}`}
                onClick={() => {
                  const next = { ...filters, religion: '' };
                  setFilters(next);
                  runFilters(next);
                  setOpenChip(null);
                }}
              >
                Any
              </button>
              {RELIGION_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`filter-option ${filters.religion === opt ? 'filter-option-selected' : ''}`}
                  onClick={() => {
                    const next = { ...filters, religion: opt };
                    setFilters(next);
                    runFilters(next);
                    setOpenChip(null);
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Profession / Occupation */}
        <div className="filter-chip-wrap">
          <button
            type="button"
            className={`filter-chip ${filters.occupation ? 'filter-chip-active' : ''}`}
            onClick={() => toggleChip('occupation')}
          >
            {valueChipLabel('Profession', filters.occupation)}
            <ChevronIcon />
          </button>
          {openChip === 'occupation' && (
            <div className="filter-popover">
              <input
                type="text"
                placeholder="e.g. Engineer, Doctor..."
                value={filters.occupation}
                onChange={(e) => setField('occupation', e.target.value)}
              />
              <div className="filter-popover-actions">
                <button type="button" className="link-btn" onClick={() => clearChip(['occupation'])}>
                  Clear
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={applyChip}>
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Education */}
        <div className="filter-chip-wrap">
          <button
            type="button"
            className={`filter-chip ${filters.education ? 'filter-chip-active' : ''}`}
            onClick={() => toggleChip('education')}
          >
            {valueChipLabel('Education', filters.education)}
            <ChevronIcon />
          </button>
          {openChip === 'education' && (
            <div className="filter-popover">
              <input
                type="text"
                placeholder="e.g. B.Tech, MBA..."
                value={filters.education}
                onChange={(e) => setField('education', e.target.value)}
              />
              <div className="filter-popover-actions">
                <button type="button" className="link-btn" onClick={() => clearChip(['education'])}>
                  Clear
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={applyChip}>
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Caste */}
        <div className="filter-chip-wrap">
          <button
            type="button"
            className={`filter-chip ${filters.caste ? 'filter-chip-active' : ''}`}
            onClick={() => toggleChip('caste')}
          >
            {valueChipLabel('Caste', filters.caste)}
            <ChevronIcon />
          </button>
          {openChip === 'caste' && (
            <div className="filter-popover">
              <input
                type="text"
                placeholder="Enter caste"
                value={filters.caste}
                onChange={(e) => setField('caste', e.target.value)}
              />
              <div className="filter-popover-actions">
                <button type="button" className="link-btn" onClick={() => clearChip(['caste'])}>
                  Clear
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={applyChip}>
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Marital Status */}
        <div className="filter-chip-wrap">
          <button
            type="button"
            className={`filter-chip ${filters.maritalStatus ? 'filter-chip-active' : ''}`}
            onClick={() => toggleChip('maritalStatus')}
          >
            {valueChipLabel(
              'Marital Status',
              filters.maritalStatus,
              MARITAL_OPTIONS.find((o) => o.value === filters.maritalStatus)?.label
            )}
            <ChevronIcon />
          </button>
          {openChip === 'maritalStatus' && (
            <div className="filter-popover filter-popover-options">
              <button
                type="button"
                className={`filter-option ${!filters.maritalStatus ? 'filter-option-selected' : ''}`}
                onClick={() => {
                  const next = { ...filters, maritalStatus: '' };
                  setFilters(next);
                  runFilters(next);
                  setOpenChip(null);
                }}
              >
                Any
              </button>
              {MARITAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`filter-option ${filters.maritalStatus === opt.value ? 'filter-option-selected' : ''}`}
                  onClick={() => {
                    const next = { ...filters, maritalStatus: opt.value };
                    setFilters(next);
                    runFilters(next);
                    setOpenChip(null);
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Gender preference */}
        <div className="filter-chip-wrap">
          <button
            type="button"
            className={`filter-chip ${filters.gender ? 'filter-chip-active' : ''}`}
            onClick={() => toggleChip('gender')}
          >
            {valueChipLabel(
              'Show Me',
              filters.gender,
              GENDER_OPTIONS.find((o) => o.value === filters.gender)?.label
            )}
            <ChevronIcon />
          </button>
          {openChip === 'gender' && (
            <div className="filter-popover filter-popover-options">
              {GENDER_OPTIONS.map((opt) => (
                <button
                  key={opt.value || 'default'}
                  type="button"
                  className={`filter-option ${filters.gender === opt.value ? 'filter-option-selected' : ''}`}
                  onClick={() => {
                    const next = { ...filters, gender: opt.value };
                    setFilters(next);
                    runFilters(next);
                    setOpenChip(null);
                  }}
                >
                  {opt.label}
                </button>
              ))}
              <p className="filter-popover-hint">
                By default hum tumhe opposite gender ki profiles dikhate hain. Yahan se badal sakte ho.
              </p>
            </div>
          )}
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
              <ProfileCard key={profile._id} profile={profile} />
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
