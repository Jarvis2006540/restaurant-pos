import React, { useState, useEffect } from 'react';
import { ordersAPI, settingsAPI } from '../../services/api';
import QRCodePayment from '../Payment/QRCodePayment';
import PrintBill from './PrintBill';
import { ArrowLeft, Printer, Banknote, QrCode, CreditCard, CheckCircle2, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Bill = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const metadata = location.state?.metadata || {};
  const cartItems = location.state?.cartItems || [];
  const cartTotal = location.state?.cartTotal || 0;
  
  const [order, setOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null); // 'cash', 'upi', 'card'
  const [showQRCode, setShowQRCode] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [receiptSettings, setReceiptSettings] = useState(null);

  useEffect(() => {
    // Fetch receipt settings when component mounts
    settingsAPI.get().then(res => {
      if (res.data) setReceiptSettings(res.data);
    }).catch(err => console.error("Failed to load receipt settings:", err));
  }, []);

  const handleSelectPayment = async (method) => {
    setPaymentMethod(method);
    setLoading(true);
    
    try {
      const orderData = {
        payment_method: method,
        payment_method_display: method === 'cash' ? 'Cash' : method === 'upi' ? 'UPI' : 'Card',
        ...metadata,
      };
      
      const response = await ordersAPI.create(orderData);
      setOrder(response.data);
      
      if (method === 'upi') {
        setShowQRCode(true);
      } else {
        // For cash & card, go directly to receipt
        setShowReceipt(true);
      }
    } catch (err) {
      alert('Failed to create order: ' + (err.response?.data?.error || err.message));
      setPaymentMethod(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentConfirmed = () => {
    setShowQRCode(false);
    setShowReceipt(true);
  };

  const handlePrintBill = () => {
    window.print();
  };

  // No cart items passed from POS - redirect
  if (cartItems.length === 0 && !order) {
    return (
      <div className="bill-empty-state">
        <div className="bill-empty-icon">
          <Banknote size={48} strokeWidth={1.5} />
        </div>
        <h3>No active order to bill</h3>
        <p>Add items from the POS screen to create a new order.</p>
        <button className="btn-primary" onClick={() => navigate('/')}>
          <ArrowLeft size={18} /> Return to POS
        </button>
      </div>
    );
  }

  return (
    <div className="bill-page">
      {/* Step 1: Order Summary + Payment Selection */}
      {!order && (
        <div className="bill-container">
          <div className="bill-summary-card">
            <div className="bill-summary-header">
              <h2>Order Summary</h2>
              <p>Review your items and select payment method</p>
            </div>
            
            {/* Customer Info Bar */}
            {(metadata.customer_name || metadata.table_number) && (
              <div className="bill-customer-bar">
                {metadata.customer_name && <span>👤 {metadata.customer_name}</span>}
                {metadata.customer_phone && <span>📞 {metadata.customer_phone}</span>}
                {metadata.order_type && <span className="bill-order-type-badge">{metadata.order_type}</span>}
                {metadata.table_number && <span>🪑 Table {metadata.table_number}</span>}
              </div>
            )}
            
            <table className="bill-items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="text-center">Qty</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id}>
                    <td className="bill-item-name">{item.name}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right">₹{item.price.toFixed(2)}</td>
                    <td className="text-right">₹{item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="bill-totals">
              <div className="bill-total-row">
                <span>Subtotal</span>
                <span>₹{Number(metadata.subtotal || cartTotal).toFixed(2)}</span>
              </div>
              {metadata.discount_amount > 0 && (
                <div className="bill-total-row bill-discount">
                  <span>Discount ({((Number(metadata.discount_amount) / Number(metadata.subtotal || cartTotal)) * 100).toFixed(0)}%)</span>
                  <span>-₹{Number(metadata.discount_amount).toFixed(2)}</span>
                </div>
              )}
              <div className="bill-total-row">
                <span>Tax (GST)</span>
                <span>₹{Number(metadata.tax_amount || 0).toFixed(2)}</span>
              </div>
              <div className="bill-total-row bill-grand-total">
                <span>Grand Total</span>
                <span>₹{Number(metadata.grand_total || cartTotal).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bill-payment-section">
            <h3>Select Payment Method</h3>
            <div className="payment-methods-grid">
              <button
                className={`payment-method-card ${paymentMethod === 'cash' ? 'selected' : ''}`}
                onClick={() => handleSelectPayment('cash')}
                disabled={loading}
              >
                <div className="payment-method-icon cash">
                  <Banknote size={32} />
                </div>
                <span className="payment-method-label">Cash</span>
                {loading && paymentMethod === 'cash' && <Loader2 size={18} className="spinner" />}
              </button>
              
              <button
                className={`payment-method-card ${paymentMethod === 'upi' ? 'selected' : ''}`}
                onClick={() => handleSelectPayment('upi')}
                disabled={loading}
              >
                <div className="payment-method-icon upi">
                  <QrCode size={32} />
                </div>
                <span className="payment-method-label">UPI / QR</span>
                {loading && paymentMethod === 'upi' && <Loader2 size={18} className="spinner" />}
              </button>
              
              <button
                className={`payment-method-card ${paymentMethod === 'card' ? 'selected' : ''}`}
                onClick={() => handleSelectPayment('card')}
                disabled={loading}
              >
                <div className="payment-method-icon card">
                  <CreditCard size={32} />
                </div>
                <span className="payment-method-label">Card</span>
                {loading && paymentMethod === 'card' && <Loader2 size={18} className="spinner" />}
              </button>
            </div>

            <button className="btn-back-link" onClick={() => navigate('/')}>
              <ArrowLeft size={16} /> Back to POS
            </button>
          </div>
        </div>
      )}

      {/* Step 2: UPI QR Code */}
      {order && showQRCode && !showReceipt && (
        <div className="bill-container">
          <div className="bill-qr-section">
            <QRCodePayment 
              order={order} 
              total={metadata.grand_total || cartTotal}
              onPaymentConfirmed={handlePaymentConfirmed}
            />
          </div>
        </div>
      )}

      {/* Step 3: Receipt + Print */}
      {order && showReceipt && (
        <div className="bill-container">
          <div className="bill-success-banner">
            <CheckCircle2 size={28} />
            <div>
              <strong>Payment Successful!</strong>
              <span>Order #{order.order_number} has been placed</span>
            </div>
          </div>

          <PrintBill 
            order={order} 
            cart={cartItems} 
            metadata={metadata} 
            total={metadata.grand_total || cartTotal}
            paymentMethod={paymentMethod}
            settings={receiptSettings}
          />

          <div className="bill-receipt-actions">
            <button className="btn-print" onClick={handlePrintBill}>
              <Printer size={18} /> Print Receipt
            </button>
            <button className="btn-new-order" onClick={() => navigate('/')}>
              New Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bill;
