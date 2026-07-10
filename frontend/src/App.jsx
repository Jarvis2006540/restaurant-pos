import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import POSView from './components/POS/POSView';
import Bill from './components/Bill/Bill';
import OrdersList from './components/Orders/OrdersList';
import ManageMenu from './components/Management/ManageMenu';
import MonthlySales from './components/Reports/MonthlySales';
import Login from './components/Auth/Login';
import './index.css';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('pos_token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('pos_user') || 'null'));

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
        <Sidebar onLogout={handleLogout} user={user} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<POSView />} />
            <Route path="/bill" element={<Bill />} />
            <Route path="/orders" element={<OrdersList />} />
            <Route path="/manage" element={<ManageMenu />} />
            <Route path="/reports" element={<MonthlySales />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
