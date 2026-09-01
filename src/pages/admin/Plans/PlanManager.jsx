import { useEffect, useState, useCallback } from 'react';
import { listPlans, createPlan, updatePlan, togglePlanActive, deletePlan, seedDefaultPlans } from '../../../api/admin/plans.api';
import Badge from '../../../components/admin/Badge/Badge';
import ConfirmDialog from '../../../components/admin/ConfirmDialog/ConfirmDialog';
import PlanFormModal from './PlanFormModal';
import './Plans.css';

function formatCurrency(paise) {
  return `₹${((paise || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function PlanManager() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingPlan, setEditingPlan] = useState(null); // null = closed, {} = new, {...} = edit
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPlans = useCallback(() => {
    setLoading(true);
    listPlans()
      .then(setPlans)
      .catch((err) => setError(err.response?.data?.message || 'Plans load nahi hue.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  async function handleSeed() {
    setActionLoading(true);
    try {
      await seedDefaultPlans();
      fetchPlans();
    } catch (err) {
      setError(err.response?.data?.message || 'Seed fail hua.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleToggle(plan) {
    setActionLoading(true);
    try {
      await togglePlanActive(plan._id);
      fetchPlans();
    } catch (err) {
      setError(err.response?.data?.message || 'Toggle fail hua.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await deletePlan(deleteTarget._id);
      setDeleteTarget(null);
      fetchPlans();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete fail hua.');
      setDeleteTarget(null);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSave(payload) {
    if (editingPlan?._id) {
      await updatePlan(editingPlan._id, payload);
    } else {
      await createPlan(payload);
    }
    setEditingPlan(null);
    fetchPlans();
  }

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div>
          <h1>Membership Plans</h1>
          <p className="page-subtitle">Tiers, pricing aur features manage karo.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {plans.length === 0 && !loading && (
            <button type="button" className="admin-btn btn-secondary" disabled={actionLoading} onClick={handleSeed}>
              Seed Default Plans
            </button>
          )}
          <button type="button" className="admin-btn admin-btn-primary" onClick={() => setEditingPlan({})}>
            + New Plan
          </button>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      {loading ? (
        <p className="admin-state-message">Loading…</p>
      ) : plans.length === 0 ? (
        <p className="admin-state-message">Abhi koi plan nahi hai. "Seed Default Plans" se shuru karo ya naya banao.</p>
      ) : (
        <div className="plan-grid">
          {plans.map((plan) => (
            <div className="plan-card" key={plan._id}>
              <div className="plan-card-header">
                <div>
                  <h3>{plan.name}</h3>
                  <span className="plan-card-slug">{plan.slug}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {plan.topSeller && <Badge value="Top Seller" tone="warning" />}
                  <Badge value={plan.isActive ? 'active' : 'inactive'} tone={plan.isActive ? 'success' : 'muted'} />
                </div>
              </div>

              <table className="plan-pricing-table">
                <thead>
                  <tr><th></th><th>1 Month</th><th>3 Months</th><th>Till Marriage</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Price</td>
                    <td>{formatCurrency(plan.pricing['1_month'])}</td>
                    <td>{formatCurrency(plan.pricing['3_months'])}</td>
                    <td>{formatCurrency(plan.pricing.till_marriage)}</td>
                  </tr>
                </tbody>
              </table>

              <ul className="plan-feature-list">
                <li>{plan.features.contactSharing ? '✅' : '❌'} Contact Sharing</li>
                <li>{plan.features.engagePlus ? '✅' : '❌'} Engage+</li>
                <li>{plan.features.goldBadge ? '✅' : '❌'} Gold Badge</li>
              </ul>

              <div className="data-table-actions" style={{ marginTop: 10 }}>
                <button type="button" className="admin-btn btn-ghost btn-sm" onClick={() => setEditingPlan(plan)}>Edit</button>
                <button type="button" className="admin-btn btn-secondary btn-sm" disabled={actionLoading} onClick={() => handleToggle(plan)}>
                  {plan.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button type="button" className="admin-btn btn-danger btn-sm" onClick={() => setDeleteTarget(plan)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingPlan && (
        <PlanFormModal
          plan={editingPlan._id ? editingPlan : null}
          onClose={() => setEditingPlan(null)}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Plan"
          message={`"${deleteTarget.name}" plan delete karna hai? Ye action undo nahi ho sakta.`}
          confirmLabel="Delete"
          tone="danger"
          loading={actionLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
