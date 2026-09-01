import Modal from '../Modal/Modal';

export default function ConfirmDialog({ title, message, confirmLabel = 'Confirm', tone = 'danger', onConfirm, onCancel, loading }) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="admin-btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button type="button" className={`admin-btn btn-${tone}`} onClick={onConfirm} disabled={loading}>
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </>
      }
    >
      <p style={{ margin: 0, color: 'var(--color-text)' }}>{message}</p>
    </Modal>
  );
}
