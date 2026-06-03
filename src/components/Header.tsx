import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, HelpCircle } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onRestartTour: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onRestartTour }) => {
  const { profile } = useAuth();

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case 'transactions':
        return 'Search transactions...';
      case 'presence':
        return 'Search data absensi...';
      case 'reports':
        return 'Search reports...';
      default:
        return 'Search data...';
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: '2rem',
      borderBottom: '1px solid var(--border-color)',
      marginBottom: '2rem'
    }}>
      {/* Search Section */}
      <div style={{ position: 'relative', width: '380px' }}>
        <Search size={18} style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)'
        }} />
        <input
          type="text"
          placeholder={getSearchPlaceholder()}
          className="form-input"
          style={{
            paddingLeft: '2.5rem',
            backgroundColor: '#f1f5f9',
            border: 'none',
            borderRadius: '10px',
            fontSize: '0.875rem'
          }}
        />
      </div>

      {/* User & Options Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {/* Icons */}
        <button style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Bell size={20} />
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'var(--danger)'
          }} />
        </button>

        <button 
          className="tour-help-btn"
          onClick={onRestartTour}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <HelpCircle size={20} />
        </button>

        {/* User Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {profile?.full_name || 'Admin Kurnia'}
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {profile?.role || 'MANAGER'}
            </div>
          </div>
          
          {/* Avatar */}
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.9rem'
          }}>
            {getInitials(profile?.full_name || 'Admin Kurnia')}
          </div>
        </div>
      </div>
    </header>
  );
};
