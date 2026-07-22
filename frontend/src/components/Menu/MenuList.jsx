import React from 'react';
import MenuItem from './MenuItem';
import { Loader2 } from 'lucide-react';

const MenuList = ({ menuItems, loading, error, onAddToCart }) => {
  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 className="spinner" size={48} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <p>Connecting to server...</p>
      </div>
    );
  }

  if (error) {
    return <div className="loading-state error">Error: {error}</div>;
  }

  return (
    <>
      <div className="section-header">
        <h2>Our Menu</h2>
        <p>Select items to add them to your order.</p>
      </div>
      <div className="menu-grid">
        {menuItems.map((item) => (
          <MenuItem key={item.id} item={item} onAddToCart={onAddToCart} />
        ))}
      </div>
    </>
  );
};

export default MenuList;
