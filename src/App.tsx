import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { StaffPresence } from './pages/StaffPresence';
import { Reports } from './pages/Reports';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'presence' | 'reports'>('dashboard');

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #cbd5e1',
          borderTopColor: '#1e293b',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ fontFamily: 'sans-serif', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>
          Menghubungkan ke database Supabase...
        </span>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'transactions':
        return <Transactions />;
      case 'presence':
        return <StaffPresence />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main View Area */}
      <main className="main-content">
        {/* Persistent top bar */}
        <Header activeTab={activeTab} />
        
        {/* Dynamic page area */}
        {renderActivePage()}

        {/* Footer */}
        <footer style={{
          marginTop: '4rem',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.5rem',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          fontWeight: 700,
          letterSpacing: '1px'
        }}>
          THE ATELIER FRAMEWORK • KURNIA BUKU POLMAN • 2026
        </footer>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
