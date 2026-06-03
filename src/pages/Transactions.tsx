import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit3, Trash2, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';

export const Transactions: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // CRUD Modals States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  // Form Fields
  const [mainTitle, setMainTitle] = useState('');
  const [subDetail, setSubDetail] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState('Penjualan Buku');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = ['Penjualan Buku', 'Operasional', 'Inventaris', 'Gaji Staff', 'Lainnya'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...transactions];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(tx => 
        tx.title.toLowerCase().includes(lower) || 
        tx.id.toString().includes(lower) ||
        (tx.category && tx.category.toLowerCase().includes(lower))
      );
    }

    if (categoryFilter) {
      result = result.filter(tx => tx.category === categoryFilter);
    }

    if (dateFilter) {
      result = result.filter(tx => {
        const txDate = new Date(tx.created_at).toISOString().split('T')[0];
        return txDate === dateFilter;
      });
    }

    setFilteredTransactions(result);
    setCurrentPage(1);
  }, [transactions, searchTerm, categoryFilter, dateFilter]);

  // Bottom Stats Calculations
  const stats = filteredTransactions.reduce((acc, tx) => {
    const amt = parseFloat(tx.amount) || 0;
    if (tx.type === 'income' || tx.type === 'pemasukan') {
      acc.income += amt;
    } else {
      acc.expense += amt;
    }
    return acc;
  }, { income: 0, expense: 0 });

  const netBalance = stats.income - stats.expense;

  // Pagination indexing
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

  // CRUD Handlers
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainTitle || !amount) return;

    try {
      const fullTitle = subDetail ? `${mainTitle} | ${subDetail}` : mainTitle;
      const payload = {
        title: fullTitle,
        amount: parseFloat(amount),
        type: type,
        category: category,
        created_at: new Date(date).toISOString(),
        created_by: user?.id || null
      };

      const { error } = await supabase.from('transactions').insert(payload);
      if (error) throw error;
      
      setShowAddModal(false);
      resetForm();
      fetchTransactions();
    } catch (err) {
      console.error('Error adding transaction:', err);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx || !mainTitle || !amount) return;

    try {
      const fullTitle = subDetail ? `${mainTitle} | ${subDetail}` : mainTitle;
      const payload = {
        title: fullTitle,
        amount: parseFloat(amount),
        type: type,
        category: category,
        created_at: new Date(date).toISOString(),
      };

      const { error } = await supabase
        .from('transactions')
        .update(payload)
        .eq('id', selectedTx.id);

      if (error) throw error;

      setShowEditModal(false);
      setSelectedTx(null);
      resetForm();
      fetchTransactions();
    } catch (err) {
      console.error('Error editing transaction:', err);
    }
  };

  const handleDelete = async () => {
    if (!selectedTx) return;
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', selectedTx.id);

      if (error) throw error;

      setShowDeleteModal(false);
      setSelectedTx(null);
      fetchTransactions();
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  };

  const openEdit = (tx: any) => {
    setSelectedTx(tx);
    const [main, sub] = tx.title.split(' | ');
    setMainTitle(main || '');
    setSubDetail(sub || '');
    setAmount(tx.amount.toString());
    setType(tx.type === 'pemasukan' ? 'income' : tx.type);
    setCategory(tx.category || 'Penjualan Buku');
    setDate(new Date(tx.created_at).toISOString().split('T')[0]);
    setShowEditModal(true);
  };

  const openDelete = (tx: any) => {
    setSelectedTx(tx);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setMainTitle('');
    setSubDetail('');
    setAmount('');
    setType('income');
    setCategory('Penjualan Buku');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const parseTitle = (title: string) => {
    const parts = title.split(' | ');
    return {
      main: parts[0] || 'Transaksi',
      sub: parts[1] || 'Umum',
    };
  };

  return (
    <div>
      {/* Title & Action Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
            Financial Records
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Data Transaksi Keuangan</h2>
        </div>

        <button className="btn btn-primary" onClick={() => { resetForm(); setShowAddModal(true); }}>
          <Plus size={18} />
          <span>Tambah Transaksi</span>
        </button>
      </div>

      {/* Filter Section */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          
          {/* Search */}
          <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
            <label className="form-label">Search Identifier</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="ID or Description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>
          </div>

          {/* Category */}
          <div className="form-group" style={{ width: '180px' }}>
            <label className="form-label">Kategori</label>
            <select
              className="form-input"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="">Semua Kategori</option>
              {categories.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="form-group" style={{ width: '180px' }}>
            <label className="form-label">Rentang Tanggal</label>
            <input
              type="date"
              className="form-input"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          {/* Clear Filters */}
          {(searchTerm || categoryFilter || dateFilter) && (
            <button
              className="btn btn-secondary"
              onClick={() => { setSearchTerm(''); setCategoryFilter(''); setDateFilter(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', height: '40px' }}
            >
              <X size={16} />
              <span>Reset</span>
            </button>
          )}

        </div>
      </div>

      {/* Main CRUD Table */}
      <div className="table-container" style={{ marginBottom: '2rem' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tanggal</th>
              <th>Deskripsi</th>
              <th>Kategori</th>
              <th style={{ textAlign: 'right' }}>Jumlah</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Memuat data transaksi...
                </td>
              </tr>
            ) : currentItems.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Tidak ada transaksi yang cocok dengan filter.
                </td>
              </tr>
            ) : (
              currentItems.map((tx) => {
                const { main, sub } = parseTitle(tx.title);
                const isIncome = tx.type === 'income' || tx.type === 'pemasukan';
                return (
                  <tr key={tx.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                      TRX-{tx.id}
                    </td>
                    <td>
                      {new Date(tx.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{main}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub}</div>
                    </td>
                    <td>
                      <span className={`badge ${isIncome ? 'badge-success' : 'badge-danger'}`}>
                        {isIncome ? 'PEMASUKAN' : 'PENGELUARAN'}
                      </span>
                    </td>
                    <td style={{
                      textAlign: 'right',
                      fontWeight: 700,
                      color: isIncome ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {isIncome ? '+' : '-'} {formatCurrency(tx.amount).replace('Rp', 'Rp ')}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <button
                          onClick={() => openEdit(tx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <Edit3 size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => openDelete(tx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--danger-text)',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <Trash2 size={14} />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredTransactions.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTransactions.length)} of {filteredTransactions.length} transactions
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{ padding: '0.5rem', display: 'flex', alignItems: 'center' }}
            >
              <ChevronLeft size={16} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`btn ${currentPage === page ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCurrentPage(page)}
                style={{
                  minWidth: '36px',
                  height: '36px',
                  padding: 0,
                  backgroundColor: currentPage === page ? 'var(--primary)' : 'white',
                  color: currentPage === page ? 'white' : 'var(--text-secondary)',
                  border: currentPage === page ? 'none' : '1px solid var(--border-color)',
                }}
              >
                {page}
              </button>
            ))}

            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{ padding: '0.5rem', display: 'flex', alignItems: 'center' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Stats Summary cards at bottom */}
      <div className="grid grid-cols-3 gap-4" style={{ marginTop: '2rem' }}>
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Pemasukan</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem' }}>{formatCurrency(stats.income)}</h2>
          </div>
          <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.875rem' }}>↗ 12%</div>
        </div>
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Pengeluaran</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem' }}>{formatCurrency(stats.expense)}</h2>
          </div>
          <div style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '0.875rem' }}>↘ 4%</div>
        </div>
        <div className="card card-premium-blue" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase' }}>Saldo Bersih</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem' }}>{formatCurrency(netBalance)}</h2>
          </div>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '50%', padding: '0.5rem', display: 'flex', alignItems: 'center' }}>
            💼
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Tambah Transaksi Baru</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Deskripsi Utama</label>
                <input type="text" className="form-input" placeholder="e.g. Penjualan Buku Teknik" value={mainTitle} onChange={e => setMainTitle(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Pihak Kedua / Penerima / Detail</label>
                <input type="text" className="form-input" placeholder="e.g. Grosir Politeknik Negeri" value={subDetail} onChange={e => setSubDetail(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Tipe Transaksi</label>
                  <select className="form-input" value={type} onChange={e => setType(e.target.value as 'income' | 'expense')}>
                    <option value="income">Pemasukan (Kredit)</option>
                    <option value="expense">Pengeluaran (Debit)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Kategori</label>
                  <select className="form-input" value={category} onChange={e => setCategory(e.target.value)}>
                    {categories.map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Jumlah (Rp)</label>
                  <input type="number" className="form-input" placeholder="e.g. 4500000" value={amount} onChange={e => setAmount(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Tanggal</label>
                  <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan Transaksi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Edit Transaksi</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Deskripsi Utama</label>
                <input type="text" className="form-input" value={mainTitle} onChange={e => setMainTitle(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Pihak Kedua / Penerima / Detail</label>
                <input type="text" className="form-input" value={subDetail} onChange={e => setSubDetail(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Tipe Transaksi</label>
                  <select className="form-input" value={type} onChange={e => setType(e.target.value as 'income' | 'expense')}>
                    <option value="income">Pemasukan (Kredit)</option>
                    <option value="expense">Pengeluaran (Debit)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Kategori</label>
                  <select className="form-input" value={category} onChange={e => setCategory(e.target.value)}>
                    {categories.map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Jumlah (Rp)</label>
                  <input type="number" className="form-input" value={amount} onChange={e => setAmount(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Tanggal</label>
                  <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Hapus Transaksi?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Batal</button>
              <button className="btn btn-danger" onClick={handleDelete}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
