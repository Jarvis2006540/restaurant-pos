import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const PrintBill = ({ order, cart, total, metadata, paymentMethod }) => {
  if (!order) return null;

  // Use items from order if cart not provided (for reprint from orders page)
  const items = (cart && cart.length > 0) ? cart : (Array.isArray(order.items) ? order.items : []);
  const method = paymentMethod || order.payment_method_display || order.payment_method || 'Cash';
  const methodLabel = method === 'upi' ? 'UPI' : method === 'card' ? 'Card' : method === 'cash' ? 'Cash' : method;

  const orderTotal = total || order.grand_total || order.total_amount || 0;
  const taxAmount = metadata?.tax_amount ?? order.tax_amount ?? 0;
  const discountAmount = metadata?.discount_amount ?? order.discount_amount ?? 0;
  const subtotal = metadata?.subtotal ?? order.subtotal ?? orderTotal;

  const upiId = 'cssurya2006@okicici';
  const payeeName = 'Restaurant';
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${orderTotal.toFixed(2)}&cu=INR&tn=Order%20${order.order_number}`;

  return (
    <div className="print-bill" id="print-bill">
      <style>
        {`
          @media print {
            body * { visibility: hidden !important; }
            #print-bill, #print-bill * { visibility: visible !important; }
            #print-bill { 
              position: absolute; 
              left: 0; 
              top: 0; 
              width: 80mm; 
              font-family: 'Courier New', Courier, monospace;
              padding: 5mm;
              margin: 0 auto;
              background: #fff !important;
              color: #000 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .bill-receipt-actions,
            .bill-success-banner,
            .sidebar,
            .no-print { 
              display: none !important; 
            }
          }
        `}
      </style>
      
      <div className="thermal-receipt">
        {/* Header */}
        <div className="receipt-center">
          <h2 className="receipt-shop-name">THE GRAND RESTAURANT</h2>
          <p className="receipt-address">123 Food Street, City, 10001</p>
          <p className="receipt-phone">Ph: +91 98765 43210</p>
          <p className="receipt-gstin">GSTIN: 33AABCU9603R1ZM</p>
        </div>
        
        <div className="receipt-divider"></div>
        
        {/* Order Info */}
        <div className="receipt-info-section">
          <div className="receipt-info-row">
            <span>Order:</span>
            <span>{order.order_number}</span>
          </div>
          <div className="receipt-info-row">
            <span>Date:</span>
            <span>{new Date(order.created_at).toLocaleString('en-IN', { 
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit', hour12: true 
            })}</span>
          </div>
          <div className="receipt-info-row">
            <span>Payment:</span>
            <span>{methodLabel}</span>
          </div>
          {(metadata?.order_type || order.order_type) && (
            <div className="receipt-info-row">
              <span>Type:</span>
              <span>{metadata?.order_type || order.order_type}</span>
            </div>
          )}
          {(metadata?.table_number || order.table_number) && (
            <div className="receipt-info-row">
              <span>Table:</span>
              <span>{metadata?.table_number || order.table_number}</span>
            </div>
          )}
          {(metadata?.customer_name || order.customer_name) && (
            <div className="receipt-info-row">
              <span>Customer:</span>
              <span>{metadata?.customer_name || order.customer_name}</span>
            </div>
          )}
          {(metadata?.customer_phone || order.customer_phone) && (
            <div className="receipt-info-row">
              <span>Phone:</span>
              <span>{metadata?.customer_phone || order.customer_phone}</span>
            </div>
          )}
        </div>
        
        <div className="receipt-divider"></div>

        {/* Items Table */}
        <table className="receipt-items-table">
          <thead>
            <tr>
              <th className="receipt-col-item">Item</th>
              <th className="receipt-col-qty">Qty</th>
              <th className="receipt-col-amt">Amt</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id || index}>
                <td className="receipt-col-item">{item.name}</td>
                <td className="receipt-col-qty">{item.quantity}</td>
                <td className="receipt-col-amt">{(item.subtotal || item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="receipt-divider"></div>
        
        {/* Totals */}
        <div className="receipt-totals">
          {discountAmount > 0 && (
            <>
              <div className="receipt-total-row">
                <span>Subtotal:</span>
                <span>{subtotal.toFixed(2)}</span>
              </div>
              <div className="receipt-total-row">
                <span>Discount:</span>
                <span>-{discountAmount.toFixed(2)}</span>
              </div>
            </>
          )}
          <div className="receipt-total-row">
            <span>CGST:</span>
            <span>{(taxAmount / 2).toFixed(2)}</span>
          </div>
          <div className="receipt-total-row">
            <span>SGST:</span>
            <span>{(taxAmount / 2).toFixed(2)}</span>
          </div>
          <div className="receipt-divider-thin"></div>
          <div className="receipt-total-row receipt-grand-total">
            <span>GRAND TOTAL:</span>
            <span>₹{orderTotal.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="receipt-divider"></div>
        
        {/* QR Code - only for UPI payments */}
        {(method === 'upi' || method === 'UPI') && (
          <>
            <div className="receipt-center">
              <p className="receipt-scan-label">Scan to Pay with UPI</p>
              <div className="receipt-qr">
                <QRCodeCanvas value={upiUri} size={120} level={"M"} />
              </div>
              <p className="receipt-upi-id">UPI ID: {upiId}</p>
            </div>
            <div className="receipt-divider"></div>
          </>
        )}
        
        {/* Footer */}
        <div className="receipt-center receipt-footer">
          <p className="receipt-thank-you">Thank you for your visit!</p>
          <p className="receipt-visit-again">Please visit again</p>
        </div>
      </div>
    </div>
  );
};

export default PrintBill;
