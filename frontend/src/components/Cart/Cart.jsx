import React, { useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, User, Phone, Hash } from 'lucide-react';
import { cartAPI } from '../../services/api';

const Cart = ({ cartItems, total, onCartUpdate, onCheckout }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [orderType, setOrderType] = useState('Dine-in');
  const [discountPercent, setDiscountPercent] = useState(0);

  const handleUpdateQuantity = async (menuId, quantity) => {
    try {
      await cartAPI.update(menuId, quantity);
      onCartUpdate();
    } catch (err) {
      alert('Failed to update cart: ' + err.message);
    }
  };

  const handleRemove = async (menuId) => {
    try {
      await cartAPI.remove(menuId);
      onCartUpdate();
    } catch (err) {
      alert('Failed to remove item: ' + err.message);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Clear all items from the cart?')) {
      try {
        await cartAPI.clear();
        onCartUpdate();
      } catch (err) {
        alert('Failed to clear cart: ' + err.message);
      }
    }
  };

  const handleProceedToCheckout = () => {
    const discountAmount = total * (discountPercent / 100);
    const subtotalAfterDiscount = total - discountAmount;
    
    // Calculate precise tax by summing individual item taxes
    const discountFactor = 1 - (discountPercent / 100);
    const taxAmount = cartItems.reduce((acc, item) => {
      const itemDiscountedSubtotal = item.subtotal * discountFactor;
      const itemTax = itemDiscountedSubtotal * ((item.gst_percentage || 0) / 100);
      return acc + itemTax;
    }, 0);
    
    const grandTotal = subtotalAfterDiscount + taxAmount;

    onCheckout({
      customer_name: customerName,
      customer_phone: customerPhone,
      table_number: tableNumber,
      order_type: orderType,
      subtotal: total,
      discount_amount: discountAmount,
      tax_amount: taxAmount,
      grand_total: grandTotal
    });
  };

  const discountAmount = total * (discountPercent / 100);
  const subtotalAfterDiscount = total - discountAmount;
  
  const discountFactor = 1 - (discountPercent / 100);
  const taxAmount = cartItems.reduce((acc, item) => {
    const itemDiscountedSubtotal = item.subtotal * discountFactor;
    const itemTax = itemDiscountedSubtotal * ((item.gst_percentage || 0) / 100);
    return acc + itemTax;
  }, 0);
  
  const grandTotal = subtotalAfterDiscount + taxAmount;

  return (
    <>
      <div className="cart-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3>Current Order</h3>
            <span className="cart-count-badge">
              {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          </div>
          {cartItems.length > 0 && (
            <button className="clear-cart-btn" onClick={handleClearCart}>
              Clear
            </button>
          )}
        </div>
        
        {/* Order Metadata Form */}
        <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
          <button 
            className={`btn-secondary ${orderType === 'Dine-in' ? 'active' : ''}`}
            style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', background: orderType === 'Dine-in' ? 'var(--primary)' : 'var(--bg-color)', color: orderType === 'Dine-in' ? 'white' : 'inherit' }}
            onClick={() => setOrderType('Dine-in')}
          >
            Dine-in
          </button>
          <button 
            className={`btn-secondary ${orderType === 'Takeaway' ? 'active' : ''}`}
            style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', background: orderType === 'Takeaway' ? 'var(--primary)' : 'var(--bg-color)', color: orderType === 'Takeaway' ? 'white' : 'inherit' }}
            onClick={() => setOrderType('Takeaway')}
          >
            Takeaway
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', width: '100%' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-color)', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.5rem' }}>
              <User size={14} color="var(--text-muted)" style={{ marginRight: '0.25rem' }} />
              <input type="text" placeholder="Customer Name" value={customerName} onChange={e => setCustomerName(e.target.value)} style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '0.85rem', outline: 'none' }} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-color)', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.5rem' }}>
              <Phone size={14} color="var(--text-muted)" style={{ marginRight: '0.25rem' }} />
              <input type="text" placeholder="Phone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '0.85rem', outline: 'none' }} />
            </div>
          </div>
          {orderType === 'Dine-in' && (
            <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-color)', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.5rem' }}>
                <Hash size={14} color="var(--text-muted)" style={{ marginRight: '0.25rem' }} />
                <input type="text" placeholder="Table Number" value={tableNumber} onChange={e => setTableNumber(e.target.value)} style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '0.85rem', outline: 'none' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="cart-items-container">
        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <ShoppingCart className="cart-empty-icon" />
            <p>Select items from the menu to start an order.</p>
          </div>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-details">
                <div className="cart-item-title">{item.name}</div>
                <div className="cart-item-price">₹{item.price.toFixed(2)}</div>
              </div>
              <div className="cart-item-actions">
                <button 
                  className="cart-qty-btn"
                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                >
                  {item.quantity === 1 ? <Trash2 size={14} color="var(--danger)" /> : <Minus size={14} />}
                </button>
                <span className="cart-qty-val">{item.quantity}</span>
                <button 
                  className="cart-qty-btn"
                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="cart-footer">
        <div className="cart-summary-row" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Discount (%)</span>
          <input 
            type="number" 
            min="0" max="100" 
            value={discountPercent} 
            onChange={e => setDiscountPercent(Number(e.target.value))} 
            style={{ width: '60px', padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--border-color)', textAlign: 'right' }} 
          />
        </div>
        <div className="cart-summary-row">
          <span>Subtotal</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
        {discountPercent > 0 && (
          <div className="cart-summary-row" style={{ color: 'var(--danger)' }}>
            <span>Discount</span>
            <span>-₹{discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="cart-summary-row">
          <span>Tax (Calculated)</span>
          <span>₹{taxAmount.toFixed(2)}</span>
        </div>
        <div className="cart-total-row">
          <span>Total</span>
          <span>₹{grandTotal.toFixed(2)}</span>
        </div>
        
        <button 
          className="checkout-btn" 
          onClick={handleProceedToCheckout}
          disabled={cartItems.length === 0}
        >
          Pay Now <ArrowRight size={18} />
        </button>
      </div>
    </>
  );
};

export default Cart;
