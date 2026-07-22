import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Menu, Loader2 } from 'lucide-react';
import Sidebar from './components/Layout/Sidebar';
import Login from './components/Auth/Login';
import { initDatabase } from './services/db';
import './index.css';
import './App.css';

// Lazy-loaded route components — only downloaded when navigated to
const POSView = React.lazy(() => import('./components/POS/POSView'));
const Bill = React.lazy(() => import('./components/Bill/Bill'));
const OrdersList = React.lazy(() => import('./components/Orders/OrdersList'));
const ManageMenu = React.lazy(() => import('./components/Management/ManageMenu'));
const MonthlySales = React.lazy(() => import('./components/Reports/MonthlySales'));
const ReceiptSettings = React.lazy(() => import('./components/Settings/ReceiptSettings'));

// Shared loading fallback for lazy routes
const PageLoader = () => (
  <div className="loading-state">
    <Loader2 className="spinner" size={48} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
    <p>Loading page...</p>
  </div>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('pos_token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('pos_user') || 'null'));
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Initialize database on app mount
  useEffect(() => {
    initDatabase();
  }, []);

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
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<POSView />} />
              <Route path="/bill" element={<Bill />} />
              <Route path="/orders" element={<OrdersList />} />
              <Route path="/manage" element={<ManageMenu />} />
              <Route path="/reports" element={<MonthlySales />} />
              <Route path="/settings" element={<ReceiptSettings />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

export default App;
