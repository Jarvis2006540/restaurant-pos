import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const QRCodePayment = ({ order, total, onPaymentConfirmed }) => {
  if (!order) {
    return <div>Loading...</div>;
  }

  // Generate UPI payment intent URI
  // pa = Payee Address (UPI ID)
  // pn = Payee Name
  // am = Amount
  // cu = Currency
  // tn = Transaction Note
  const upiId = 'cssurya2006@okicici';
  const payeeName = 'Restaurant';
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${total.toFixed(2)}&cu=INR&tn=Order%20${order.order_number}`;

  return (
    <div className="qr-code-payment">
      <h3 style={{ marginBottom: '1rem' }}>Scan to Pay with UPI</h3>
      <div className="qr-code-container" style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', margin: '0 auto', width: 'fit-content' }}>
        <QRCodeCanvas value={upiUri} size={200} level={"H"} />
      </div>
      <div className="payment-info" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <p><strong>UPI ID:</strong> {upiId}</p>
        <p><strong>Order Number:</strong> {order.order_number}</p>
        <p style={{ fontSize: '1.25rem', color: 'var(--primary-dark)', fontWeight: 700, marginTop: '0.5rem' }}>Amount: ₹{total.toFixed(2)}</p>
      </div>
      <button className="btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={onPaymentConfirmed}>
        Payment Confirmed
      </button>
    </div>
  );
};

export default QRCodePayment;
