import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, X } from 'lucide-react';
import MenuList from '../Menu/MenuList';
import Cart from '../Cart/Cart';
import { cartAPI } from '../../services/api';

const POSView = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

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
    navigate('/bill', { state: { metadata, cartItems: cart, cartTotal: total } });
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="pos-container">
      <div className="menu-section">
        <MenuList onCartUpdate={handleCartUpdate} />
      </div>

      {/* Floating Action Button for Mobile Cart */}
      <button 
        className={`mobile-cart-fab ${totalItems > 0 ? 'active' : ''}`}
        onClick={() => setIsMobileCartOpen(true)}
      >
        <div className="fab-content">
          <ShoppingCart size={24} />
          {totalItems > 0 && <span className="fab-badge">{totalItems}</span>}
          <span className="fab-price">₹{total.toFixed(2)}</span>
        </div>
      </button>

      {/* Mobile Overlay */}
      <div 
        className={`mobile-cart-overlay ${isMobileCartOpen ? 'open' : ''}`} 
        onClick={() => setIsMobileCartOpen(false)} 
      />

      {/* Cart Section (Sidebar on Desktop, Bottom Drawer on Mobile) */}
      <div className={`cart-section ${isMobileCartOpen ? 'open' : ''}`}>
        <button 
          className="mobile-cart-close"
          onClick={() => setIsMobileCartOpen(false)}
        >
          <X size={24} />
        </button>
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
