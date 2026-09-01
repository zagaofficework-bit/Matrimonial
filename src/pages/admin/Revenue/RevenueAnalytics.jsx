import { useEffect, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getRevenueAnalytics, listTransactions } from '../../../api/admin/revenue.api';
import DataTable from '../../../components/admin/DataTable/DataTable';
import Pagination from '../../../components/admin/Pagination/Pagination';
import StatCard from '../../../components/admin/StatCard/StatCard';
import Badge from '../../../components/admin/Badge/Badge';
import './Revenue.css';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatCurrency(paise) {
  return `₹${((paise || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function RevenueAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getRevenueAnalytics()
      .then(setAnalytics)
      .catch((err) => setError(err.response?.data?.message || 'Analytics load nahi hue.'));
  }, []);

  const fetchTransactions = useCallback((page = 1) => {
    setLoading(true);
    listTransactions({ status: statusFilter || undefined, page, limit: 15 })
      .then((result) => {
        setTransactions(result.transactions);
        setPagination(result.pagination);
      })
      .catch((err) => setError(err.response?.data?.message || 'Transactions load nahi hui.'))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { fetchTransactions(1); }, [fetchTransactions]);

  const chartData = (analytics?.revenueByMonth || []).map((r) => ({
    name: `${MONTH_NAMES[r.month - 1]} ${String(r.year).slice(2)}`,
    total: r.total / 100
  }));

  const columns = [
    { key: 'user', label: 'User', render: (t) => t.user?.name || '—' },
    { key: 'plan', label: 'Plan', render: (t) => t.plan?.name || t.planSlug },
    { key: 'duration', label: 'Duration', render: (t) => t.duration.replace(/_/g, ' ') },
    { key: 'amount', label: 'Amount', render: (t) => formatCurrency(t.amount) },
    { key: 'status', label: 'Status', render: (t) => <Badge value={t.status} /> },
    { key: 'createdAt', label: 'Date', render: (t) => new Date(t.createdAt).toLocaleDateString('en-IN') }
  ];

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div>
          <h1>Revenue & Transactions</h1>
          <p className="page-subtitle">Membership revenue analytics aur payment logs.</p>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      {analytics && (
        <>
          <div className="stat-grid">
            <StatCard label="Total Revenue" value={formatCurrency(analytics.totalRevenue)} tone="success" icon="💰" />
            <StatCard label="This Month" value={formatCurrency(analytics.thisMonthRevenue)} icon="📅" />
            <StatCard label="Last 30 Days" value={formatCurrency(analytics.last30DaysRevenue)} icon="🗓️" />
            <StatCard label="Paid Transactions" value={analytics.totalPaidTransactions} tone="secondary" icon="🧾" />
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <h3>Revenue — Last 12 Months</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                <Bar dataKey="total" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {analytics.revenueByPlan?.length > 0 && (
            <div className="revenue-by-plan">
              {analytics.revenueByPlan.map((p) => (
                <div className="card revenue-plan-card" key={p.plan}>
                  <p className="plan-name">{p.plan}</p>
                  <p className="plan-total">{formatCurrency(p.total)}</p>
                  <p className="plan-count">{p.count} transactions</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <h3 style={{ margin: '24px 0 12px' }}>Transaction Log</h3>
      <div className="filters-bar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="paid">Paid</option>
          <option value="created">Created</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {loading ? (
        <p className="admin-state-message">Loading…</p>
      ) : (
        <>
          <DataTable columns={columns} rows={transactions} emptyMessage="Koi transaction nahi mili." />
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={fetchTransactions} />
        </>
      )}
    </div>
  );
}
