import React, { useState, useEffect } from 'react';
import { cartAPI, ordersAPI } from '../../services/api';
import QRCodePayment from '../Payment/QRCodePayment';
import PrintBill from './PrintBill';
import { ArrowLeft, Printer } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Bill = ({ onOrderComplete }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const metadata = location.state?.metadata || {};
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [order, setOrder] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showPrint, setShowPrint] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await cartAPI.get();
      setCart(response.data.cart || []);
      setTotal(response.data.total || 0);
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  const handlePayNow = async () => {
    try {
      const response = await ordersAPI.create('upi', metadata);
      setOrder(response.data);
      setShowQRCode(true);
    } catch (err) {
      alert('Failed to create order: ' + err.message);
    }
  };

  const handlePaymentConfirmed = () => {
    setShowPrint(true);
    setTimeout(() => {
      if (onOrderComplete) {
        onOrderComplete();
      }
    }, 1000);
  };

  const handlePrintBill = () => {
    window.print();
  };

  if (cart.length === 0 && !order) {
    return (
      <div className="loading-state">
        <p>No active order to bill.</p>
        <button className="btn-primary" onClick={() => navigate('/')}>
          <ArrowLeft size={18} /> Return to POS
        </button>
      </div>
    );
  }

  return (
    <div className="receipt-container">
      <div className="receipt-header">
        <h2>Order Summary</h2>
        <p>Review and pay for your items</p>
      </div>
      
      {!order ? (
        <>
          <table className="receipt-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th className="text-right">Price</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {cart && cart.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td className="text-right">₹{item.price.toFixed(2)}</td>
                  <td className="text-right">₹{item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              {metadata.discount_amount > 0 && (
                <tr>
                  <td colSpan="3" style={{ paddingTop: '1.5rem' }}>Subtotal:</td>
                  <td className="text-right" style={{ paddingTop: '1.5rem' }}>₹{metadata.subtotal?.toFixed(2) || total.toFixed(2)}</td>
                </tr>
              )}
              {metadata.discount_amount > 0 && (
                <tr>
                  <td colSpan="3" style={{ color: 'var(--danger)' }}>Discount:</td>
                  <td className="text-right" style={{ color: 'var(--danger)' }}>-₹{metadata.discount_amount?.toFixed(2)}</td>
                </tr>
              )}
              <tr>
                <td colSpan="3" style={metadata.discount_amount === 0 ? { paddingTop: '1.5rem' } : {}}>Tax (Calculated):</td>
                <td className="text-right" style={metadata.discount_amount === 0 ? { paddingTop: '1.5rem' } : {}}>₹{metadata.tax_amount?.toFixed(2) || 0}</td>
              </tr>
              <tr>
                <td colSpan="3" style={{ fontWeight: 600 }}>Grand Total:</td>
                <td className="text-right" style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary-dark)' }}>
                  ₹{metadata.grand_total?.toFixed(2) || total.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
          <div className="receipt-actions">
            <button className="btn-secondary" onClick={() => navigate('/')}>
              <ArrowLeft size={18} /> Back
            </button>
            <button className="btn-primary" onClick={handlePayNow}>
              Pay ₹{metadata.grand_total?.toFixed(2) || total.toFixed(2)}
            </button>
          </div>
        </>
      ) : (
        <>
          {showQRCode && !showPrint && (
            <QRCodePayment 
              order={order} 
              total={metadata.grand_total || total}
              onPaymentConfirmed={handlePaymentConfirmed}
            />
          )}
          {showPrint && (
            <>
              <PrintBill order={order} cart={cart} metadata={metadata} total={metadata.grand_total || total} />
              <div className="receipt-actions">
                <button className="btn-primary" onClick={handlePrintBill}>
                  <Printer size={18} /> Print Receipt
                </button>
                <button className="btn-secondary" onClick={() => navigate('/')}>
                  New Order
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Bill;
