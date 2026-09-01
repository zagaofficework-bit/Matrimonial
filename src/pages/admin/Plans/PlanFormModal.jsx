import { useState } from 'react';
import Modal from '../../../components/admin/Modal/Modal';

const DURATIONS = [
  { key: '1_month', label: '1 Month' },
  { key: '3_months', label: '3 Months' },
  { key: 'till_marriage', label: 'Till Marriage' }
];

function rupeesToPaise(v) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

function paiseToRupees(v) {
  return v ? (v / 100).toString() : '';
}

function emptyDurationMap() {
  return { '1_month': '', '3_months': '', till_marriage: '' };
}

export default function PlanFormModal({ plan, onClose, onSave }) {
  const isEdit = !!plan;
  const [slug, setSlug] = useState(plan?.slug || '');
  const [name, setName] = useState(plan?.name || '');
  const [topSeller, setTopSeller] = useState(plan?.topSeller || false);
  const [sortOrder, setSortOrder] = useState(plan?.sortOrder ?? 0);
  const [pricing, setPricing] = useState(() => {
    if (!plan) return emptyDurationMap();
    return {
      '1_month': paiseToRupees(plan.pricing?.['1_month']),
      '3_months': paiseToRupees(plan.pricing?.['3_months']),
      till_marriage: paiseToRupees(plan.pricing?.till_marriage)
    };
  });
  const [contactSharing, setContactSharing] = useState(plan?.features?.contactSharing || false);
  const [engagePlus, setEngagePlus] = useState(plan?.features?.engagePlus || false);
  const [goldBadge, setGoldBadge] = useState(plan?.features?.goldBadge || false);
  const [contactDetails, setContactDetails] = useState(() => ({
    '1_month': plan?.features?.contactDetails?.['1_month'] ?? '',
    '3_months': plan?.features?.contactDetails?.['3_months'] ?? '',
    till_marriage: plan?.features?.contactDetails?.till_marriage ?? ''
  }));
  const [superInterest, setSuperInterest] = useState(() => ({
    '1_month': plan?.features?.superInterest?.['1_month'] ?? '',
    '3_months': plan?.features?.superInterest?.['3_months'] ?? '',
    till_marriage: plan?.features?.superInterest?.till_marriage ?? ''
  }));
  const [spotlights, setSpotlights] = useState(() => ({
    '1_month': plan?.features?.spotlights?.['1_month'] ?? '',
    '3_months': plan?.features?.spotlights?.['3_months'] ?? '',
    till_marriage: plan?.features?.spotlights?.till_marriage ?? ''
  }));

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function updateDurationField(setter, key, value) {
    setter((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        name,
        topSeller,
        sortOrder: Number(sortOrder) || 0,
        pricing: {
          '1_month': rupeesToPaise(pricing['1_month']),
          '3_months': rupeesToPaise(pricing['3_months']),
          till_marriage: rupeesToPaise(pricing.till_marriage)
        },
        features: {
          contactSharing,
          engagePlus,
          goldBadge,
          contactDetails: {
            '1_month': Number(contactDetails['1_month']) || 0,
            '3_months': Number(contactDetails['3_months']) || 0,
            till_marriage: Number(contactDetails.till_marriage) || 0
          },
          superInterest: {
            '1_month': Number(superInterest['1_month']) || 0,
            '3_months': Number(superInterest['3_months']) || 0,
            till_marriage: Number(superInterest.till_marriage) || 0
          },
          spotlights: {
            '1_month': Number(spotlights['1_month']) || 0,
            '3_months': Number(spotlights['3_months']) || 0,
            till_marriage: Number(spotlights.till_marriage) || 0
          }
        }
      };
      if (!isEdit) payload.slug = slug;

      await onSave(payload);
    } catch (err) {
      setError(err.response?.data?.message || 'Save fail hua.');
    } finally {
      setSaving(false);
    }
  }

  function renderDurationRow(label, map, setter) {
    return (
      <div className="form-group">
        <label>{label}</label>
        <div className="admin-form-row">
          {DURATIONS.map((d) => (
            <input
              key={d.key}
              type="number"
              min="0"
              placeholder={d.label}
              value={map[d.key]}
              onChange={(e) => updateDurationField(setter, d.key, e.target.value)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Modal
      title={isEdit ? `Edit ${plan.name}` : 'New Plan'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="admin-btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" form="plan-form" className="admin-btn admin-btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save Plan'}
          </button>
        </>
      }
    >
      <form id="plan-form" onSubmit={handleSubmit}>
        {error && <div className="admin-alert admin-alert-error">{error}</div>}

        <div className="admin-form-row">
          <div className="form-group">
            <label htmlFor="plan-name">Plan Name</label>
            <input id="plan-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          {!isEdit && (
            <div className="form-group">
              <label htmlFor="plan-slug">Slug (unique id)</label>
              <input
                id="plan-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                placeholder="pro_max"
                required
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="sort-order">Sort Order</label>
            <input id="sort-order" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </div>
        </div>

        <div className="checkbox-row" style={{ marginBottom: 14 }}>
          <input id="top-seller" type="checkbox" checked={topSeller} onChange={(e) => setTopSeller(e.target.checked)} />
          <label htmlFor="top-seller" style={{ margin: 0 }}>Mark as "Top Seller"</label>
        </div>

        {renderDurationRow('Pricing (₹)', pricing, setPricing)}

        <div className="checkbox-row" style={{ marginBottom: 8 }}>
          <input id="contact-sharing" type="checkbox" checked={contactSharing} onChange={(e) => setContactSharing(e.target.checked)} />
          <label htmlFor="contact-sharing" style={{ margin: 0 }}>Contact Sharing enabled</label>
        </div>
        <div className="checkbox-row" style={{ marginBottom: 8 }}>
          <input id="engage-plus" type="checkbox" checked={engagePlus} onChange={(e) => setEngagePlus(e.target.checked)} />
          <label htmlFor="engage-plus" style={{ margin: 0 }}>Engage+ enabled</label>
        </div>
        <div className="checkbox-row" style={{ marginBottom: 14 }}>
          <input id="gold-badge" type="checkbox" checked={goldBadge} onChange={(e) => setGoldBadge(e.target.checked)} />
          <label htmlFor="gold-badge" style={{ margin: 0 }}>Gold Badge enabled</label>
        </div>

        {renderDurationRow('Contact Details quota (per duration)', contactDetails, setContactDetails)}
        {renderDurationRow('Super Interest quota (per duration)', superInterest, setSuperInterest)}
        {renderDurationRow('Spotlights quota (per duration)', spotlights, setSpotlights)}
      </form>
    </Modal>
  );
}
