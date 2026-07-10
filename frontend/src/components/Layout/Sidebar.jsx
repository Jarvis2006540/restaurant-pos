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
        <Link to="/orders" className={`nav-item ${isActive('/orders')}`}>
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

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <User size={16} />
          <span>{user?.username || 'Admin'}</span>
        </div>
        <button 
          onClick={onLogout}
          className="sidebar-logout-btn"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
