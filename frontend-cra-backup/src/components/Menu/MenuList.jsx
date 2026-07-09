import React, { useState, useEffect } from 'react';
import MenuItem from './MenuItem';
import { menuAPI, cartAPI } from '../../services/api';
import { Loader2 } from 'lucide-react';

const MenuList = ({ onCartUpdate }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await menuAPI.getAll();
      setMenuItems(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleAddToCart = async (menuId) => {
    try {
      await cartAPI.add(menuId, 1);
      if (onCartUpdate) {
        onCartUpdate();
      }
    } catch (err) {
      alert('Failed to add item to cart: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 className="spinner" size={48} color="var(--primary)" style={{ animation: 'spin 2s linear infinite' }} />
        <p>Loading the menu...</p>
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
          <MenuItem key={item.id} item={item} onAddToCart={handleAddToCart} />
        ))}
      </div>
    </>
  );
};

// Add keyframes for spinner locally or it can be global
export default MenuList;
