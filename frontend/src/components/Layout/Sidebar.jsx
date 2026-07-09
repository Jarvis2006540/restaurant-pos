import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, UtensilsCrossed, BarChart3, Settings, LogOut, User } from 'lucide-react';

const Sidebar = ({ onLogout, user }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <UtensilsCrossed size={24} />
      </div>
      
      <nav className="sidebar-nav">
        <Link to="/" className={`nav-item ${isActive('/')}`}>
          <LayoutDashboard size={24} />
          <span>POS</span>
        </Link>
        <Link to="/bill" className={`nav-item ${isActive('/bill')}`}>
          <ReceiptText size={24} />
          <span>Orders</span>
        </Link>
        <Link to="/manage" className={`nav-item ${isActive('/manage')}`}>
          <Settings size={24} />
          <span>Manage</span>
        </Link>
        <Link to="/reports" className={`nav-item ${isActive('/reports')}`}>
          <BarChart3 size={24} />
          <span>Reports</span>
        </Link>
      </nav>

      <div className="sidebar-footer" style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-color)' }}>
          <User size={16} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.username || 'Admin'}</span>
        </div>
        <button 
          onClick={onLogout}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: 'none', 
            border: 'none', 
            color: 'var(--danger)', 
            cursor: 'pointer',
            padding: '0.5rem',
            width: '100%',
            textAlign: 'left',
            borderRadius: 'var(--radius-sm)'
          }}
          className="logout-btn"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
