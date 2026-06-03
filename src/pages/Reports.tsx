import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Calendar, X, FileText, Table } from 'lucide-react';

export const Reports: React.FC = () => {
  const [activePeriodTab, setActivePeriodTab] = useState<'month' | 'year'>('month');

  // Stats
  const [netProfit, setNetProfit] = useState(42850000);
  const [growthRate] = useState(8.2);
  const [avgAttendance, setAvgAttendance] = useState(96.4);

  // Categories Sales
  const [categorySales, setCategorySales] = useState([
    { name: 'Pendidikan', value: 7100000 },
    { name: 'Novel', value: 2130000 },
    { name: 'ATK', value: 1820000 },
    { name: 'Komik', value: 2710000 },
  ]);

  // Activity Ledger
  const [ledger, setLedger] = useState<any[]>([]);

  // Export Modal
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportPeriod, setExportPeriod] = useState('Bulan Ini');
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeTransactions, setIncludeTransactions] = useState(false);
  const [includeHR, setIncludeHR] = useState(false);
  const [fileFormat, setFileFormat] = useState<'pdf' | 'excel'>('pdf');
  const [exporting, setExporting] = useState(false);

  // Grouped Bar Chart Data: Revenue vs Expense (by Weeks)
  const barChartData = [
    { name: 'W1', Revenue: 8500000, Expense: 4200000 },
    { name: 'W2', Revenue: 6200000, Expense: 3100000 },
    { name: 'W3', Revenue: 11000000, Expense: 5500000 },
    { name: 'W4', Revenue: 5800000, Expense: 5100000 },
    { name: 'W5', Revenue: 9500000, Expense: 2900000 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const fetchReportData = async () => {
    try {
      // 1. Fetch Transactions
      const { data: txs } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (txs && txs.length > 0) {
        // Calculate totals dynamically
        let income = 0;
        let expense = 0;
        const salesMap = new Map<string, number>();

        txs.forEach(tx => {
          const amt = parseFloat(tx.amount) || 0;
          if (tx.type === 'income' || tx.type === 'pemasukan') {
            income += amt;
            // Categorize income sales
            const cat = tx.category || 'Lainnya';
            salesMap.set(cat, (salesMap.get(cat) || 0) + amt);
          } else {
            expense += amt;
          }
        });

        setNetProfit(income - expense);
        
        // Update category distribution
        const catList: any[] = [];
        salesMap.forEach((val, key) => {
          catList.push({ name: key, value: val });
        });
        if (catList.length > 0) {
          setCategorySales(catList);
        }

        // Setup ledger data
        const ledgerData = txs.slice(0, 5).map(tx => {
          const isIncome = tx.type === 'income' || tx.type === 'pemasukan';
          return {
            date: tx.created_at,
            description: tx.title.split(' | ')[0],
            category: tx.category ? tx.category.toUpperCase() : 'GENERAL',
            amount: (isIncome ? 1 : -1) * tx.amount,
            status: isIncome ? 'PAID' : 'COMPLETED'
          };
        });
        setLedger(ledgerData);
      } else {
        // Fallback Ledger
        setLedger([
          { date: '2023-10-24T08:00:00Z', description: 'Buku Pendidikan Jasmani VII', category: 'SALES', amount: 1250000, status: 'PAID' },
          { date: '2023-10-23T09:00:00Z', description: 'Pembayaran Listrik & Wifi', category: 'UTILITY', amount: -850000, status: 'COMPLETED' },
          { date: '2023-10-23T10:00:00Z', description: 'Pengadaan ATK Kantor', category: 'INVENTORY', amount: -2400000, status: 'COMPLETED' },
          { date: '2023-10-22T08:30:00Z', description: 'Grosir Novel Best Seller', category: 'SALES', amount: 5800000, status: 'PAID' },
          { date: '2023-10-22T14:00:00Z', description: 'Biaya Maintenance Rak', category: 'MAINTENANCE', amount: -350000, status: 'COMPLETED' },
        ]);
      }

      // 2. Fetch Average Attendance
      const { data: presenceData } = await supabase.from('presences').select('*');
      const { data: staffData } = await supabase.from('staffs').select('*');
      if (presenceData && staffData && staffData.length > 0) {
        // calculate average attendance rate
        // total days = unique dates in presenceData
        const dates = new Set(presenceData.map(p => p.check_in.split('T')[0]));
        const uniqueDatesCount = dates.size || 1;
        
        const totalPossiblePresences = staffData.length * uniqueDatesCount;
        const actualHadir = presenceData.filter(p => p.status.toLowerCase() === 'hadir' || p.status.toLowerCase() === 'present').length;
        
        const rate = (actualHadir / totalPossiblePresences) * 100;
        setAvgAttendance(parseFloat(rate.toFixed(1)));
      }

    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const totalCategorySales = categorySales.reduce((acc, c) => acc + c.value, 0);

  const handleExport = (e: React.FormEvent) => {
    e.preventDefault();
    setExporting(true);

    setTimeout(() => {
      // Create a text representing reports and trigger browser download
      let reportText = `KURNIA BUKU POLMAN - EXPORT REPORT\n`;
      reportText += `Period: ${exportPeriod}\n`;
      reportText += `Generated on: ${new Date().toLocaleString()}\n`;
      reportText += `=========================================\n\n`;

      if (includeSummary) {
        reportText += `FINANCIAL SUMMARY\n`;
        reportText += `- Net Profit: ${formatCurrency(netProfit)}\n`;
        reportText += `- Average Staff Attendance: ${avgAttendance}%\n`;
        reportText += `- Business Growth Rate: ${growthRate}%\n\n`;
      }

      if (includeTransactions) {
        reportText += `TRANSACTION HISTORY LEDGER\n`;
        ledger.forEach(item => {
          reportText += `[${item.date.split('T')[0]}] [${item.category}] ${item.description}: ${formatCurrency(item.amount)} (${item.status})\n`;
        });
        reportText += `\n`;
      }

      if (includeHR) {
        reportText += `HR PERFORMANCE SUMMARY\n`;
        reportText += `- Average daily attendance rate: ${avgAttendance}%\n`;
        reportText += `- Performance standing: Excellent\n\n`;
      }

      const fileExtension = fileFormat === 'pdf' ? 'pdf' : 'xlsx';
      const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan_Kurnia_Buku_${exportPeriod.replace(' ', '_')}.${fileExtension}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExporting(false);
      setShowExportModal(false);
    }, 2000);
  };

  return (
    <div>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
            Financial Analysis
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Laporan Operasional & Keuangan</h2>
        </div>

        <button className="btn btn-primary" onClick={() => setShowExportModal(true)}>
          <Download size={18} />
          <span>Export Laporan</span>
        </button>
      </div>

      {/* Tabs Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <button
            onClick={() => setActivePeriodTab('month')}
            style={{
              padding: '0.75rem 0.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activePeriodTab === 'month' ? '3px solid var(--success)' : '3px solid transparent',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: activePeriodTab === 'month' ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => setActivePeriodTab('year')}
            style={{
              padding: '0.75rem 0.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activePeriodTab === 'year' ? '3px solid var(--success)' : '3px solid transparent',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: activePeriodTab === 'year' ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            Tahun Ini
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          <Calendar size={14} />
          <span>Oct 1, 2023 - Oct 31, 2023</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4" style={{ marginBottom: '2rem' }}>
        {/* Net Profit */}
        <div className="card">
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Laba Bersih</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.25rem 0' }}>{formatCurrency(netProfit)}</h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--success-text)', fontWeight: 600 }}>↗ +12.4% vs last month</div>
        </div>

        {/* Growth Rate */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Pertumbuhan</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{growthRate} %</h2>
          
          {/* Progress bar */}
          <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', margin: '0.5rem 0 0.25rem 0' }}>
            <div style={{ width: '65%', height: '100%', backgroundColor: 'var(--success)', borderRadius: '3px' }} />
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target performance reach: 65%</span>
        </div>

        {/* Staff Attendance */}
        <div className="card">
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rata-rata Kehadiran Staf</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.25rem 0' }}>{avgAttendance} %</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--info-text)', fontWeight: 600 }}>Excellent performance</span>
        </div>
      </div>

      {/* Chart and distribution list */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Revenue vs Expense Chart */}
        <div className="card" style={{ minHeight: '380px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Revenue vs Expense</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Weekly operational analysis</p>
          </div>
          
          <div style={{ flex: 1, width: '100%' }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', border: 'none' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Laporan Per Kategori */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Laporan Per Kategori</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '1.5rem' }}>Sales distribution by book type</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {categorySales.map((item, index) => {
                const ratio = totalCategorySales > 0 ? (item.value / totalCategorySales) * 100 : 0;
                return (
                  <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                      <span style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{formatCurrency(item.value)}</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px' }}>
                      <div style={{ width: `${ratio}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Sales</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {formatCurrency(totalCategorySales || 12850000)}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Ledger */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Financial Activity</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>View Ledger</span>
            <span>→</span>
          </span>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((item, idx) => {
                const isPositive = item.amount > 0;
                return (
                  <tr key={idx}>
                    <td>
                      {new Date(item.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.description}</td>
                    <td style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{item.category}</td>
                    <td style={{
                      textAlign: 'right',
                      fontWeight: 700,
                      color: isPositive ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {isPositive ? '+' : ''} {formatCurrency(item.amount).replace('Rp', 'Rp ')}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-info" style={{
                        backgroundColor: item.status === 'PAID' ? 'var(--success-bg)' : '#f1f5f9',
                        color: item.status === 'PAID' ? 'var(--success-text)' : 'var(--text-secondary)'
                      }}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Report Configuration Modal */}
      {showExportModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Konfigurasi Ekspor Laporan</h3>
              <button className="modal-close" onClick={() => setShowExportModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleExport} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Period Select */}
              <div className="form-group">
                <label className="form-label">Pilih Periode</label>
                <select className="form-input" value={exportPeriod} onChange={e => setExportPeriod(e.target.value)}>
                  <option value="Bulan Ini">Bulan Ini</option>
                  <option value="Tahun Ini">Tahun Ini</option>
                  <option value="Kuartal Ini">Kuartal Ini</option>
                </select>
              </div>

              {/* Checkboxes */}
              <div className="form-group">
                <label className="form-label">Data Yang Disertakan</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={includeSummary} onChange={e => setIncludeSummary(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                    <span style={{ fontWeight: 600 }}>Ringkasan Finansial</span>
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={includeTransactions} onChange={e => setIncludeTransactions(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                    <span style={{ fontWeight: 600 }}>Detail Transaksi</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={includeHR} onChange={e => setIncludeHR(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                    <span style={{ fontWeight: 600 }}>Performa SDM (Absensi Karyawan)</span>
                  </label>
                </div>
              </div>

              {/* Format selection */}
              <div className="form-group">
                <label className="form-label">Pilih Format File</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.25rem' }}>
                  
                  <div
                    onClick={() => setFileFormat('pdf')}
                    style={{
                      border: fileFormat === 'pdf' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      backgroundColor: fileFormat === 'pdf' ? 'var(--primary-light)' : 'white'
                    }}
                  >
                    <FileText size={28} style={{ color: fileFormat === 'pdf' ? 'var(--primary)' : 'var(--text-muted)' }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>PDF Document</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Dokumen cetak instan</div>
                    </div>
                  </div>

                  <div
                    onClick={() => setFileFormat('excel')}
                    style={{
                      border: fileFormat === 'excel' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      backgroundColor: fileFormat === 'excel' ? 'var(--primary-light)' : 'white'
                    }}
                  >
                    <Table size={28} style={{ color: fileFormat === 'excel' ? 'var(--primary)' : 'var(--text-muted)' }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Excel Spreadsheet</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Analisis lembar kerja</div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowExportModal(false)} disabled={exporting}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--primary)' }} disabled={exporting}>
                  {exporting ? 'Memproses Unduhan...' : 'Generate & Unduh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
