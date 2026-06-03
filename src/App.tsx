import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { StaffPresence } from './pages/StaffPresence';
import { Reports } from './pages/Reports';
import { TourOverlay } from './components/TourOverlay';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'presence' | 'reports'>('dashboard');
  const [isTourOpen, setIsTourOpen] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const tourCompleted = localStorage.getItem('kurnia_buku_tour_completed');
      if (tourCompleted !== 'true') {
        // Delay slightly to ensure dashboard DOM is ready
        const timer = setTimeout(() => {
          setIsTourOpen(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, user]);

  const handleRestartTour = () => {
    setActiveTab('dashboard');
    // Ensure dashboard tab is loaded before opening the tour
    setTimeout(() => {
      setIsTourOpen(true);
    }, 150);
  };

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
        <Header activeTab={activeTab} onRestartTour={handleRestartTour} />
        
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

      {/* Onboarding Tour Spotlight Overlay */}
      <TourOverlay isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
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
