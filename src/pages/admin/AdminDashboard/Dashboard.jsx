import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getDashboardStats } from '../../../api/admin/dashboard.api';
import StatCard from '../../../components/admin/StatCard/StatCard';
import './Dashboard.css';

const PIE_COLORS = ['#16a34a', '#d97706', '#dc2626', '#9ca3af'];

function formatCurrency(paise) {
  return `₹${((paise || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((err) => setError(err.response?.data?.message || 'Stats load nahi ho paye.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="admin-state-message">Loading dashboard…</p>;
  if (error) return <div className="admin-alert admin-alert-error">{error}</div>;
  if (!stats) return null;

  const kycData = [
    { name: 'Verified', value: stats.kyc.verified },
    { name: 'Pending', value: stats.kyc.pending },
    { name: 'Rejected', value: stats.kyc.rejected },
    { name: 'Not Submitted', value: stats.kyc.notSubmitted }
  ];

  const userStatusData = [
    { name: 'Active', value: stats.users.active },
    { name: 'Suspended', value: stats.users.suspended },
    { name: 'Blocked', value: stats.users.blocked }
  ];

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Users, revenue aur KYC ka ek nazar me overview.</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Total Users" value={stats.users.total.toLocaleString('en-IN')} hint={`${stats.users.active} active`} icon="👥" />
        <StatCard label="Total Revenue" value={formatCurrency(stats.revenue.total)} hint={`${formatCurrency(stats.revenue.thisMonth)} this month`} tone="success" icon="💰" />
        <StatCard label="Active Memberships" value={stats.revenue.activeMemberships.toLocaleString('en-IN')} tone="secondary" icon="💎" />
        <StatCard label="Pending KYC" value={stats.kyc.pending.toLocaleString('en-IN')} hint="Verification queue" tone="warning" icon="🛂" />
        <StatCard label="Pending Reports" value={stats.pendingActions.reports.toLocaleString('en-IN')} tone="error" icon="🚩" />
        <StatCard label="Total Matches" value={stats.engagement.totalMatches.toLocaleString('en-IN')} icon="💞" />
      </div>

      <div className="dashboard-charts">
        <div className="card">
          <h3>KYC Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={kycData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {kycData.map((entry, index) => (
                  <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>User Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={userStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
