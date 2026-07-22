import React, { useState, useEffect } from 'react';
import { ordersAPI, settingsAPI } from '../../services/api';
import PrintBill from '../Bill/PrintBill';
import { Loader2, Search, Eye, Printer, X, ReceiptText, Filter, ChevronDown, Trash } from 'lucide-react';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [filterType, setFilterType] = useState('all'); // all, dine-in, takeaway
  const [receiptSettings, setReceiptSettings] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchOrders();
    // Fetch receipt settings
    settingsAPI.get().then(res => {
      if (res.data) setReceiptSettings(res.data);
    }).catch(err => console.error("Failed to load receipt settings:", err));
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReceipt = (order) => {
    setSelectedOrder(order);
    setShowReceipt(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await ordersAPI.delete(orderId);
      fetchOrders();
    } catch (err) {
      console.error('Failed to delete order:', err);
    }
  };

  const handleCloseReceipt = () => {
    setSelectedOrder(null);
    setShowReceipt(false);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.order_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer_phone || '').includes(searchTerm);
    
    const matchesFilter = filterType === 'all' || 
      (order.order_type || 'Dine-in').toLowerCase() === filterType.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const displayOrders = showAll ? filteredOrders : filteredOrders.slice(0, 5);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    // Ensure SQLite UTC dates (e.g. "2026-07-10 05:16:00") are parsed as UTC
    const normalized = dateStr.includes('Z') || dateStr.includes('T') 
      ? dateStr 
      : dateStr.replace(' ', 'T') + 'Z';
    const d = new Date(normalized);
    return d.toLocaleDateString('en-IN', { 
      day: '2-digit', month: 'short', year: 'numeric' 
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    // Ensure SQLite UTC dates are parsed as UTC
    const normalized = dateStr.includes('Z') || dateStr.includes('T') 
      ? dateStr 
      : dateStr.replace(' ', 'T') + 'Z';
    const d = new Date(normalized);
    return d.toLocaleTimeString('en-IN', { 
      hour: '2-digit', minute: '2-digit', hour12: true 
    });
  };

  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 className="spinner" size={48} color="var(--primary)" />
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      {/* Header */}
      <div className="orders-header">
        <div>
          <h2>Order History</h2>
          <p>{orders.length} total orders</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="orders-toolbar">
        <div className="orders-search">
          <Search size={18} className="orders-search-icon" />
          <input
            type="text"
            placeholder="Search by order #, customer, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="orders-filter">
          <Filter size={16} />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="dine-in">Dine-in</option>
            <option value="takeaway">Takeaway</option>
          </select>
          <ChevronDown size={14} className="orders-filter-chevron" />
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="orders-empty">
          <ReceiptText size={48} strokeWidth={1.5} />
          <h3>{searchTerm || filterType !== 'all' ? 'No matching orders found' : 'No orders yet'}</h3>
          <p>{searchTerm || filterType !== 'all' ? 'Try adjusting your search or filter' : 'Orders will appear here once customers place them'}</p>
        </div>
      ) : (
        <div className="orders-table-wrapper table-responsive">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date & Time</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Items</th>
                <th>Payment</th>
                <th className="text-right">Total</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayOrders.map((order) => {
                const items = Array.isArray(order.items) ? order.items : [];
                const displayTotal = order.grand_total || order.total_amount || 0;
                return (
                  <tr key={order.id}>
                    <td>
                      <span className="order-number-badge">
                        {order.order_number ? order.order_number.split('-').pop() : order.id}
                      </span>
                    </td>
                    <td>
                      <div className="order-date-cell">
                        <span className="order-date">{formatDate(order.created_at)}</span>
                        <span className="order-time">{formatTime(order.created_at)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="order-customer-cell">
                        <span className="order-customer-name">{order.customer_name || '-'}</span>
                        {order.customer_phone && (
                          <span className="order-customer-phone">{order.customer_phone}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`order-type-badge ${(order.order_type || 'Dine-in').toLowerCase().replace(/[\s-]/g, '')}`}>
                        {order.order_type || 'Dine-in'}
                      </span>
                    </td>
                    <td>
                      <span className="order-items-count">
                        {items.reduce((acc, item) => acc + (item.quantity || 1), 0)} items
                      </span>
                    </td>
                    <td>
                      <span className={`order-payment-badge ${(order.payment_method_display || order.payment_method || 'cash').toLowerCase()}`}>
                        {order.payment_method_display || order.payment_method || 'Cash'}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className="order-total">₹{Number(displayTotal).toFixed(2)}</span>
                    </td>
                    <td className="text-center">
                      <div className="order-actions">
                        <button 
                          className="order-action-btn view"
                          onClick={() => handleViewReceipt(order)}
                          title="View Receipt"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="order-action-btn delete"
                          onClick={() => handleDeleteOrder(order.id)}
                          title="Delete Order"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      {!showAll && filteredOrders.length > 5 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowAll(true)}
            style={{ padding: '0.75rem 2rem', fontWeight: 600, border: '1px solid var(--primary)', color: 'var(--primary)' }}
          >
            View All Orders
          </button>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && selectedOrder && (
        <div className="receipt-modal-overlay" onClick={handleCloseReceipt}>
          <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-modal-header">
              <h3>Order Receipt</h3>
              <button className="receipt-modal-close" onClick={handleCloseReceipt}>
                <X size={20} />
              </button>
            </div>
            <div className="receipt-modal-body">
              <PrintBill 
                order={selectedOrder} 
                cart={Array.isArray(selectedOrder.items) ? selectedOrder.items : []}
                metadata={{
                  order_type: selectedOrder.order_type,
                  table_number: selectedOrder.table_number,
                  customer_name: selectedOrder.customer_name,
                  customer_phone: selectedOrder.customer_phone,
                  subtotal: selectedOrder.subtotal,
                  discount_amount: selectedOrder.discount_amount,
                  tax_amount: selectedOrder.tax_amount,
                  grand_total: selectedOrder.grand_total,
                }}
                total={selectedOrder.grand_total || selectedOrder.total_amount}
                paymentMethod={selectedOrder.payment_method_display || selectedOrder.payment_method}
                settings={receiptSettings}
              />
            </div>
            <div className="receipt-modal-footer">
              <button className="btn-print" onClick={handlePrint}>
                <Printer size={18} /> Print Receipt
              </button>
              <button className="btn-secondary-outline" onClick={handleCloseReceipt}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersList;
