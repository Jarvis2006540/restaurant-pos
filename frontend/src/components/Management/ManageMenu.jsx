import React, { useState, useEffect } from 'react';
import { menuAPI, BACKEND_URL } from '../../services/api';
import MenuForm from './MenuForm';
import { Edit2, Trash2, Plus } from 'lucide-react';

const ManageMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await menuAPI.getAll();
      setMenuItems(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching menu:', err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await menuAPI.delete(id);
        fetchMenu();
      } catch (err) {
        alert('Failed to delete item: ' + err.message);
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setEditingItem(null);
    setShowForm(false);
  };

  const handleFormSubmit = () => {
    fetchMenu();
    handleFormClose();
  };

  if (loading) {
    return <div className="loading-state"><p>Loading menu...</p></div>;
  }

  return (
    <div>
      <div className="section-header flex justify-between items-center mb-4">
        <div>
          <h2>Manage Menu</h2>
          <p>Add, edit, or remove items from your POS menu.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Add New Item
        </button>
      </div>

      {showForm && (
        <MenuForm
          item={editingItem}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}

      <div className="card table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Price</th>
              <th>GST %</th>
              <th>Stock</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img 
                      src={item.image ? (item.image.startsWith('http') || item.image.startsWith('data:') ? item.image : `${BACKEND_URL}${item.image}`) : `https://placehold.co/50x50/EAEAEA/888888?text=${encodeURIComponent(item.name.substring(0,2))}`}
                      alt={item.name}
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/50x50/EAEAEA/888888?text=' + encodeURIComponent(item.name.substring(0,2));
                      }}
                    />
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                  </div>
                </td>
                <td>
                  <span style={{ background: 'var(--bg-color)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                    {item.category || 'Uncategorized'}
                  </span>
                </td>
                <td style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>₹{item.price.toFixed(2)}</td>
                <td>{item.gst_percentage || 0}%</td>
                <td>
                  {item.stock_quantity === -1 ? (
                    <span style={{ color: 'var(--success)' }}>Unlimited</span>
                  ) : (
                    <span style={{ color: item.stock_quantity > 10 ? 'inherit' : 'var(--danger)', fontWeight: item.stock_quantity <= 10 ? 600 : 400 }}>
                      {item.stock_quantity ?? 0}
                    </span>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="action-btn edit-btn" onClick={() => handleEdit(item)}>
                    <Edit2 size={18} />
                  </button>
                  <button className="action-btn delete-btn" onClick={() => handleDelete(item.id)}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageMenu;
