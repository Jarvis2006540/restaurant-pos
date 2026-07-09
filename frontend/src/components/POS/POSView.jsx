import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuList from '../Menu/MenuList';
import Cart from '../Cart/Cart';
import { cartAPI } from '../../services/api';

const POSView = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  const fetchCart = useCallback(async () => {
    try {
      const response = await cartAPI.get();
      setCart(response.data.cart || []);
      setTotal(response.data.total || 0);
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleCartUpdate = () => {
    fetchCart();
  };

  const handleCheckout = (metadata) => {
    navigate('/bill', { state: { metadata } });
  };

  return (
    <div className="pos-container">
      <div className="menu-section">
        <MenuList onCartUpdate={handleCartUpdate} />
      </div>
      <div className="cart-section">
        <Cart 
          cartItems={cart} 
          total={total} 
          onCartUpdate={handleCartUpdate} 
          onCheckout={handleCheckout} 
        />
      </div>
    </div>
  );
};

export default POSView;
