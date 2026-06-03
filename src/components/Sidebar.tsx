import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Wallet, UserCheck, BarChart3, LogOut } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'presence' | 'reports') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { signOut } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'transactions', label: 'Transactions', icon: <Wallet size={20} /> },
    { id: 'presence', label: 'Staff Presence', icon: <UserCheck size={20} /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={20} /> },
  ] as const;

  return (
    <aside className="sidebar">
      <div>
        <div className="logo-section">
          <h1 className="logo-title">Kurnia Buku</h1>
          <div className="logo-subtitle">Management System</div>
        </div>

        <nav>
          <ul className="menu-list">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  className={`menu-item-link ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
        <a
          className="menu-item-link"
          onClick={signOut}
          style={{ color: 'var(--danger-text)', display: 'flex', alignItems: 'center', gap: '0.875rem' }}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </a>
      </div>
    </aside>
  );
};
