import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './components/Layout/Sidebar';
import POSView from './components/POS/POSView';
import Bill from './components/Bill/Bill';
import OrdersList from './components/Orders/OrdersList';
import ManageMenu from './components/Management/ManageMenu';
import MonthlySales from './components/Reports/MonthlySales';
import ReceiptSettings from './components/Settings/ReceiptSettings';
import Login from './components/Auth/Login';
import './index.css';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('pos_token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('pos_user') || 'null'));
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('pos_token');
    localStorage.removeItem('pos_user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="app-layout">
        
        {/* Mobile Top Header */}
        <div className="mobile-top-header">
          <button className="mobile-menu-btn" onClick={() => setIsMobileSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="mobile-header-title">POS System</div>
        </div>
        
        {/* Sidebar Overlay */}
        <div 
          className={`mobile-sidebar-overlay ${isMobileSidebarOpen ? 'open' : ''}`} 
          onClick={() => setIsMobileSidebarOpen(false)}
        />
        
        <Sidebar onLogout={handleLogout} user={user} isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
  
        <main className="main-content">
          <Routes>
            <Route path="/" element={<POSView />} />
            <Route path="/bill" element={<Bill />} />
            <Route path="/orders" element={<OrdersList />} />
            <Route path="/manage" element={<ManageMenu />} />
            <Route path="/reports" element={<MonthlySales />} />
            <Route path="/settings" element={<ReceiptSettings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
