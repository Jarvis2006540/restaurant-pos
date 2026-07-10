import React, { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { menuAPI, BACKEND_URL } from '../../services/api';

const MenuForm = ({ item, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    price: item?.price || '',
    category: item?.category || '',
    gst_percentage: item?.gst_percentage || 5.0,
    stock_quantity: item?.stock_quantity ?? -1,
    description: item?.description || '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        price: item.price || '',
        category: item.category || '',
        gst_percentage: item.gst_percentage || 5.0,
        stock_quantity: item.stock_quantity ?? -1,
        description: item.description || '',
        image: null,
      });
      if (item.image) {
        setImagePreview(item.image.startsWith('/') ? `${BACKEND_URL}${item.image}` : item.image);
      }
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('gst_percentage', formData.gst_percentage);
      formDataToSend.append('stock_quantity', formData.stock_quantity);
      formDataToSend.append('description', formData.description);
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (item) {
        await menuAPI.update(item.id, formDataToSend);
      } else {
        await menuAPI.create(formDataToSend);
      }
      
      onSubmit();
    } catch (err) {
      alert('Error saving menu item: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{item ? 'Edit Menu Item' : 'Add New Item'}</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="menu-form">
          <div className="form-group">
            <label>Item Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Masala Dosa"
              className="form-control"
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                className="form-control"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Breakfast"
                className="form-control"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>GST Percentage (%)</label>
              <input
                type="number"
                name="gst_percentage"
                value={formData.gst_percentage}
                onChange={handleChange}
                step="0.01"
                className="form-control"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Stock Qty (-1 for unlimited)</label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief item description..."
              className="form-control"
              rows="2"
            ></textarea>
          </div>

          <div className="form-group">
            <label>Image</label>
            <div className="image-upload-container">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="image-upload" className="image-upload-label">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                ) : (
                  <div className="image-upload-placeholder">
                    <Upload size={24} />
                    <span>Click to upload image</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (item ? 'Update Item' : 'Add Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuForm;
