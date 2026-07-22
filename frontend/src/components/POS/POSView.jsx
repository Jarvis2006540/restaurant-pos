import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, X } from 'lucide-react';
import MenuList from '../Menu/MenuList';
import Cart from '../Cart/Cart';
import { menuAPI } from '../../services/api';

const POSView = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState(null);
  const [cart, setCart] = useState([]);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Fetch menu items once on mount
  useEffect(() => {
    let cancelled = false;
    const fetchMenu = async () => {
      try {
        const response = await menuAPI.getAll();
        if (!cancelled) {
          setMenuItems(response.data);
          setMenuLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setMenuError(err.message);
          setMenuLoading(false);
        }
      }
    };
    fetchMenu();
    return () => { cancelled = true; };
  }, []);

  // Client-side cart operations — instant, no network calls
  const addToCart = useCallback((menuId) => {
    setCart(prev => {
      const menuItem = menuItems.find(item => item.id === menuId);
      if (!menuItem) return prev;

      const existingIndex = prev.findIndex(item => item.id === menuId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
          subtotal: (updated[existingIndex].quantity + 1) * updated[existingIndex].price,
        };
        return updated;
      }

      return [...prev, {
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        image: menuItem.image,
        gst_percentage: menuItem.gst_percentage || 0,
        quantity: 1,
        subtotal: menuItem.price,
      }];
    });
  }, [menuItems]);

  const updateCartQuantity = useCallback((menuId, quantity) => {
    setCart(prev => {
      if (quantity <= 0) {
        return prev.filter(item => item.id !== menuId);
      }
      return prev.map(item =>
        item.id === menuId
          ? { ...item, quantity, subtotal: quantity * item.price }
          : item
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const handleCheckout = (metadata) => {
    navigate('/bill', { state: { metadata, cartItems: cart, cartTotal: total } });
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="pos-container">
      <div className="menu-section">
        <MenuList
          menuItems={menuItems}
          loading={menuLoading}
          error={menuError}
          onAddToCart={addToCart}
        />
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
          onUpdateQuantity={updateCartQuantity}
          onClearCart={clearCart}
          onCheckout={handleCheckout} 
        />
      </div>
    </div>
  );
};

export default POSView;
