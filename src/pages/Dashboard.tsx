import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet } from 'lucide-react';

interface DashboardProps {
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'presence' | 'reports') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [staffPresence, setStaffPresence] = useState<any[]>([]);

  // Mock charts data to show a beautiful trend
  const trendData = [
    { year: '2020', Revenue: 15 },
    { year: '2021', Revenue: 22 },
    { year: '2022', Revenue: 18 },
    { year: '2023', Revenue: 35 },
    { year: '2024', Revenue: 45.23 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const fetchData = async () => {
    try {
      // 1. Fetch transactions for stats
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (txData && txData.length > 0) {
        let income = 0;
        let expense = 0;
        txData.forEach((tx) => {
          const amt = parseFloat(tx.amount) || 0;
          if (tx.type === 'income' || tx.type === 'pemasukan') {
            income += amt;
          } else {
            expense += amt;
          }
        });
        setTotalIncome(income);
        setTotalExpense(expense);
        setRecentTransactions(txData.slice(0, 5));
      } else {
        // Fallback mockup data matching UI design
        setTotalIncome(45230000);
        setTotalExpense(12840500);
        setRecentTransactions([
          { id: 9821, title: 'Buku Pendidikan Jasmani VII | Grosir SMA 1 Madiun', category: 'Penjualan Buku', amount: 1250000, type: 'income', created_at: '2023-10-24T08:00:00Z' },
          { id: 9820, title: 'Pembayaran Listrik & Wifi | Tagihan Bulanan Toko', category: 'Operasional', amount: 850000, type: 'expense', created_at: '2023-10-23T09:00:00Z' },
          { id: 9819, title: 'Pengadaan ATK Kantor | Restock ATK dan Kertas', category: 'Inventaris', amount: 2400000, type: 'expense', created_at: '2023-10-23T10:00:00Z' },
          { id: 9818, title: 'Grosir Novel Best Seller | Penerbit Gramedia', category: 'Penjualan Buku', amount: 5800000, type: 'income', created_at: '2023-10-22T08:30:00Z' },
          { id: 9817, title: 'Biaya Maintenance Rak | Perbaikan Lemari Display', category: 'Operasional', amount: 350000, type: 'expense', created_at: '2023-10-22T14:00:00Z' },
        ]);
      }

      // 2. Fetch staff presence today
      const todayStr = new Date().toISOString().split('T')[0];
      const { data: staffs } = await supabase.from('staffs').select('*');
      
      if (staffs && staffs.length > 0) {
        const { data: presences } = await supabase
          .from('presences')
          .select('*')
          .gte('check_in', `${todayStr}T00:00:00Z`);

        const presenceMap = new Map();
        presences?.forEach((p) => {
          presenceMap.set(p.staff_id, p);
        });

        const list = staffs.map((st) => {
          const p = presenceMap.get(st.id);
          return {
            name: st.full_name || 'Staff Karyawan',
            status: p ? p.status : 'Alfa', // defaults to Alfa if no checkin today
          };
        });
        setStaffPresence(list.slice(0, 5));
      } else {
        // Fallback mockup matching UI design
        setStaffPresence([
          { name: 'Ahmad Fauzi', status: 'Hadir' },
          { name: 'Siti Aminah', status: 'Hadir' },
          { name: 'Budi Santoso', status: 'Izin' },
          { name: 'Laila Fitri', status: 'Hadir' },
          { name: 'Rahmat Hidayat', status: 'Sakit' },
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const netBalance = totalIncome - totalExpense;

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'hadir' || s === 'present') return <span className="badge badge-success">Hadir</span>;
    if (s === 'izin' || s === 'permission') return <span className="badge badge-warning">Izin</span>;
    if (s === 'sakit' || s === 'sick') return <span className="badge badge-danger">Sakit</span>;
    return <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>Alfa</span>;
  };

  return (
    <div>
      {/* Upper Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Kurnia Buku Polman</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Overview of business health and staff attendance.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 tour-summary-cards" style={{ marginBottom: '2rem' }}>
        {/* Income Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
              Total Pemasukan
            </span>
            <div style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)', padding: '0.375rem', borderRadius: '8px' }}>
              <ArrowUpRight size={16} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success-text)' }}>
            {formatCurrency(totalIncome)}
          </h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--success-text)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
            <span>↗ 12%</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>vs last month</span>
          </div>
        </div>

        {/* Expense Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
              Total Pengeluaran
            </span>
            <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.375rem', borderRadius: '8px' }}>
              <ArrowDownRight size={16} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--danger-text)' }}>
            {formatCurrency(totalExpense)}
          </h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--danger-text)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
            <span>↘ 4%</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>vs last month</span>
          </div>
        </div>

        {/* Balance Card */}
        <div className="card card-premium-blue" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.6)', letterSpacing: '0.5px' }}>
              Saldo Akhir
            </span>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white', padding: '0.375rem', borderRadius: '8px' }}>
              <Wallet size={16} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {formatCurrency(netBalance)}
          </h2>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <TrendingUp size={14} />
            <span>Operational capital healthy</span>
          </div>
        </div>
      </div>

      {/* Grid of Chart & Sidebar list */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Revenue Trend Chart */}
        <div className="card tour-charts" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '380px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Revenue Trend (2020 - 2024)</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>CURRENCY IN MILLIONS IDR</p>
            </div>
          </div>
          <div style={{ flex: 1, width: '100%' }}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', border: 'none' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Line
                  type="monotone"
                  dataKey="Revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                  dot={{ r: 4, stroke: '#10b981', strokeWidth: 2, fill: 'white' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Staff Presence Sidebar Widget */}
        <div className="card tour-presence-widget" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Staff Presence</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {staffPresence.map((staff, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{staff.name}</span>
                  {getStatusBadge(staff.status)}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('presence')}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#059669',
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              marginTop: '1.5rem',
              textAlign: 'center',
              width: '100%'
            }}
          >
            Manage Staff
          </button>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="card" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Transactions</h3>
          <button
            onClick={() => setActiveTab('transactions')}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#059669',
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              cursor: 'pointer'
            }}
          >
            View All Transactions
          </button>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx, idx) => {
                const isIncome = tx.type === 'income' || tx.type === 'pemasukan';
                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                      TRX-{tx.id || `TX${idx}`}
                    </td>
                    <td>
                      {new Date(tx.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{tx.title.split(' | ')[0]}</div>
                      {tx.title.includes(' | ') && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.title.split(' | ')[1]}</div>
                      )}
                    </td>
                    <td>{tx.category || 'General'}</td>
                    <td style={{
                      textAlign: 'right',
                      fontWeight: 700,
                      color: isIncome ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {isIncome ? '+' : '-'} {formatCurrency(tx.amount).replace('Rp', 'Rp ')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
