import './FilterTab.css';

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

// Ek pill button jo apna khud ka popover open/close karta hai. Value set hai
// to pill "active" style leti hai aur ek chota clear (x) button dikhata hai -
// bina popover khole hi filter hata sakte ho.
export default function FilterTab({ label, activeLabel, isOpen, onToggle, onClear, children }) {
  const isActive = Boolean(activeLabel);

  return (
    <div className={`ftab ${isActive ? 'ftab-active' : ''}`}>
      <button type="button" className="ftab-trigger" onClick={onToggle}>
        <span>{activeLabel || label}</span>
        <ChevronIcon />
      </button>

      {isActive && (
        <button type="button" className="ftab-clear" aria-label={`Clear ${label}`} onClick={onClear}>
          <ClearIcon />
        </button>
      )}

      {isOpen && <div className="ftab-popover">{children}</div>}
    </div>
  );
}