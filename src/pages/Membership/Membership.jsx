import { useEffect, useState } from 'react';
import { getPlans, getMembershipStatus, createMembershipOrder, verifyMembershipPayment } from '../../api/membership.api';
import { useAuth } from '../../context/AuthContext';
import './Membership.css';

const DURATION_ORDER = ['1_month', '3_months', 'till_marriage'];

const FEATURE_ROWS = [
  { key: 'contactSharing', label: 'Contact Sharing', type: 'check' },
  { key: 'engagePlus', label: 'Engage+', type: 'check' },
  { key: 'contactDetails', label: 'Contact Details', type: 'number' },
  { key: 'superInterest', label: 'Super Interest', type: 'number' },
  { key: 'spotlights', label: 'Spotlights', type: 'number' },
  { key: 'goldBadge', label: 'Gold Badge', type: 'check' }
];

function formatRupees(paise) {
  return `₹${Math.round(paise / 100).toLocaleString('en-IN')}`;
}

// Razorpay checkout.js script - ek hi baar load hota hai, dobara load
// karne ki koshish nahi karta agar already page pe hai.
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Membership() {
  const { user } = useAuth();

  const [plans, setPlans] = useState([]);
  const [durations, setDurations] = useState({});
  const [status, setStatus] = useState(null);

  const [selectedPlan, setSelectedPlan] = useState('pro_supreme');
  const [selectedDuration, setSelectedDuration] = useState('1_month');

  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const [plansData, membershipStatus] = await Promise.all([getPlans(), getMembershipStatus()]);
        if (!isMounted) return;
        setPlans(plansData.plans);
        setDurations(plansData.durations);
        setStatus(membershipStatus);
      } catch (err) {
        if (isMounted) setError(err.response?.data?.message || 'Plans load nahi ho paye. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handlePurchase(planId) {
    setError('');
    setSuccess('');
    setPurchasing(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Razorpay load nahi ho paya. Internet check karke dobara try karein.');
        setPurchasing(false);
        return;
      }

      const order = await createMembershipOrder(planId, selectedDuration);

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'VivahSetu',
        description: `${order.plan} - ${order.duration}`,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: { color: '#9f1239' },
        handler: async (response) => {
          try {
            const membership = await verifyMembershipPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            setStatus({ ...membership, isActive: true });
            setSuccess('Payment successful! Aapki membership active ho gayi hai.');
          } catch (err) {
            setError(err.response?.data?.message || 'Payment verify nahi ho paya. Support se contact karein.');
          } finally {
            setPurchasing(false);
          }
        },
        modal: {
          ondismiss: () => setPurchasing(false)
        }
      });

      razorpay.on('payment.failed', () => {
        setError('Payment fail ho gaya. Please dobara try karein.');
        setPurchasing(false);
      });

      razorpay.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Order create nahi ho paya. Please try again.');
      setPurchasing(false);
    }
  }

  if (loading) return <p className="state-message">Loading plans...</p>;

  return (
    <div className="page-container mem-page">
      <div className="mem-header">
        <h1>Upgrade Membership</h1>
        {status?.isActive && (
          <span className="mem-current-badge">
            Current plan: {plans.find((p) => p.id === status.plan)?.name || status.plan}
          </span>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="mem-duration-tabs">
        {DURATION_ORDER.map((d) => (
          <button
            key={d}
            type="button"
            className={`mem-duration-tab ${selectedDuration === d ? 'active' : ''}`}
            onClick={() => setSelectedDuration(d)}
          >
            {durations[d]?.label || d}
          </button>
        ))}
      </div>

      <div className="mem-plans-grid">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const isCurrent = status?.plan === plan.id && status?.isActive;
          const price = formatRupees(plan.pricing[selectedDuration]);

          return (
            <div
              key={plan.id}
              className={`mem-plan-card ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.topSeller && <span className="mem-top-seller">Top Seller</span>}

              <div className="mem-plan-radio">
                <span className={`mem-radio-dot ${isSelected ? 'checked' : ''}`} />
              </div>

              <h3 className="mem-plan-name">{plan.name}</h3>
              <p className="mem-plan-price">{price}</p>

              <div className="mem-plan-features">
                {FEATURE_ROWS.map((row) => {
                  const value = plan.features[row.key];
                  const display =
                    row.type === 'check' ? (value ? '✓' : '—') : value?.[selectedDuration] ?? 0;
                  return (
                    <div className="mem-feature-row" key={row.key}>
                      <span className="mem-feature-label">{row.label}</span>
                      <span className={`mem-feature-value ${row.type === 'check' && value ? 'yes' : ''}`}>
                        {display}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                className="btn btn-primary btn-block mem-buy-btn"
                disabled={purchasing || isCurrent}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPlan(plan.id);
                  handlePurchase(plan.id);
                }}
              >
                {isCurrent ? 'Active' : purchasing ? 'Please wait...' : `Get ${plan.name} now`}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mem-note">Recurring payment nahi hai - one-time payment, plan khatam hone tak valid.</p>
    </div>
  );
}
