import { useEffect, useRef, useState } from 'react';
import './MultiSelectDropdown.css';

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

// options: [{ value, label }]. selected/onChange: array of selected values.
// Ek hi dropdown se multiple values choose ho sakti hain (e.g. religion me
// Hindu + Sikh dono) - isliye native <select multiple> ki jagah ye custom
// checkbox panel, jo dikhta bhi dropdown jaisa hai.
export default function MultiSelectDropdown({ label, options, selected, onChange, placeholder = 'Any' }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  function toggleValue(value) {
    const next = selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value];
    onChange(next);
  }

  // Trigger par dikhne wala clear button, aur panel ke andar wala "Clear" button,
  // dono isi ek handler ko use karte hain - stopPropagation isliye taaki trigger
  // ka click (jo panel open/close karta hai) na chal jaaye.
  function handleClear(e) {
    e.stopPropagation();
    onChange([]);
  }

  const summary =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? options.find((o) => o.value === selected[0])?.label || selected[0]
        : `${selected.length} selected`;

  return (
    <div className="msd-wrap" ref={wrapRef}>
      {label && <label className="msd-label">{label}</label>}

      <div className={`msd-trigger ${selected.length ? 'msd-trigger-active' : ''}`}>
        <button type="button" className="msd-trigger-toggle" onClick={() => setOpen((prev) => !prev)}>
          <span>{summary}</span>
          <ChevronIcon />
        </button>
        {selected.length > 0 && (
          <button
            type="button"
            className="msd-trigger-clear"
            aria-label={`Clear ${label || 'selection'}`}
            onClick={handleClear}
          >
            <ClearIcon />
          </button>
        )}
      </div>

      {open && (
        <div className="msd-panel">
          {options.map((opt) => (
            <label key={opt.value} className="msd-option">
              <input type="checkbox" checked={selected.includes(opt.value)} onChange={() => toggleValue(opt.value)} />
              <span>{opt.label}</span>
            </label>
          ))}
          {selected.length > 0 && (
            <button type="button" className="msd-clear" onClick={handleClear}>
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}