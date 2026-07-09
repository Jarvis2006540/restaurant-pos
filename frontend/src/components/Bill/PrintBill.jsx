import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const PrintBill = ({ order, cart, total, metadata }) => {
  if (!order || !cart || !Array.isArray(cart)) return null;

  const upiId = 'cssurya2006@okicici';
  const payeeName = 'Restaurant';
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${total.toFixed(2)}&cu=INR&tn=Order%20${order.order_number}`;

  return (
    <div className="print-bill" id="print-bill">
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #print-bill, #print-bill * { visibility: visible; }
            #print-bill { 
              position: absolute; 
              left: 0; 
              top: 0; 
              width: 80mm; 
              font-family: monospace;
              padding: 5mm;
              margin: 0 auto;
            }
          }
          
          .thermal-receipt {
            width: 80mm;
            margin: 0 auto;
            padding: 1rem;
            background: #fff;
            border: 1px solid #ddd;
            font-family: 'Courier New', Courier, monospace;
            color: #000;
          }
          .receipt-center { text-align: center; }
          .receipt-divider { border-bottom: 1px dashed #000; margin: 10px 0; }
          .receipt-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .receipt-table th { border-bottom: 1px dashed #000; padding-bottom: 5px; text-align: left; }
          .receipt-table td { padding: 5px 0; }
          .receipt-right { text-align: right; }
          .receipt-qr { display: flex; justify-content: center; margin: 15px 0; }
        `}
      </style>
      
      <div className="thermal-receipt">
        <div className="receipt-center">
          <h2 style={{ margin: '0 0 5px 0' }}>THE GRAND RESTAURANT</h2>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>123 Food Street, City, 10001</p>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem' }}>Ph: +91 98765 43210</p>
        </div>
        
        <div className="receipt-divider"></div>
        
        <div style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
          <p style={{ margin: 0 }}><strong>Order:</strong> {order.order_number}</p>
          <p style={{ margin: 0 }}><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
          {metadata?.order_type && <p style={{ margin: 0 }}><strong>Type:</strong> {metadata.order_type}</p>}
          {metadata?.table_number && <p style={{ margin: 0 }}><strong>Table:</strong> {metadata.table_number}</p>}
          {metadata?.customer_name && <p style={{ margin: 0 }}><strong>Customer:</strong> {metadata.customer_name}</p>}
        </div>
        
        <table className="receipt-table">
          <thead>
            <tr>
              <th style={{ width: '50%' }}>Item</th>
              <th style={{ width: '15%' }}>Qty</th>
              <th style={{ width: '35%' }} className="receipt-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item) => (
              <tr key={item.id}>
                <td style={{ fontSize: '0.9rem' }}>{item.name}</td>
                <td style={{ fontSize: '0.9rem' }}>{item.quantity}</td>
                <td style={{ fontSize: '0.9rem' }} className="receipt-right">{(item.subtotal || item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="receipt-divider"></div>
        
        <table style={{ width: '100%', fontSize: '0.9rem' }}>
          <tbody>
            {metadata?.discount_amount > 0 && (
              <>
                <tr>
                  <td>Subtotal:</td>
                  <td className="receipt-right">{(metadata.subtotal || total + metadata.discount_amount).toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Discount:</td>
                  <td className="receipt-right">- {metadata.discount_amount.toFixed(2)}</td>
                </tr>
              </>
            )}
            <tr>
              <td>CGST:</td>
              <td className="receipt-right">{((metadata?.tax_amount || 0) / 2).toFixed(2)}</td>
            </tr>
            <tr>
              <td>SGST:</td>
              <td className="receipt-right">{((metadata?.tax_amount || 0) / 2).toFixed(2)}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', paddingTop: '10px' }}>GRAND TOTAL:</td>
              <td className="receipt-right" style={{ fontWeight: 'bold', paddingTop: '10px', fontSize: '1.1rem' }}>₹{total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <div className="receipt-divider"></div>
        
        <div className="receipt-center">
          <p style={{ margin: '5px 0', fontSize: '0.9rem', fontWeight: 'bold' }}>Scan to Pay with UPI</p>
          <div className="receipt-qr">
            <QRCodeCanvas value={upiUri} size={120} level={"M"} />
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem' }}>UPI ID: {upiId}</p>
        </div>
        
        <div className="receipt-divider"></div>
        
        <div className="receipt-center" style={{ fontSize: '0.9rem', marginTop: '10px' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Thank you for your visit!</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem' }}>Please visit again</p>
        </div>
      </div>
    </div>
  );
};

export default PrintBill;
