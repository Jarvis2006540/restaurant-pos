import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../../services/api';
import { Loader2, Save, Store, MapPin, Phone, FileText, QrCode, Banknote, HeartHandshake, Smile } from 'lucide-react';

const ReceiptSettings = () => {
  const [settings, setSettings] = useState({
    shop_name: '',
    address: '',
    phone: '',
    gstin: '',
    upi_id: '',
    payee_name: '',
    thank_you_note: '',
    visit_again_note: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.get();
      if (response.data) {
        setSettings(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setMessage('Error loading settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      await settingsAPI.update(settings);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to save settings: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 className="spinner" size={48} color="var(--primary)" />
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="section-header">
        <h2>Receipt Settings</h2>
        <p>Customize the information printed on your thermal receipts</p>
      </div>

      <div className="card">
        {message && (
          <div className={`bill-success-banner ${message.includes('Error') || message.includes('Failed') ? 'error' : ''}`} style={{ marginBottom: '1.5rem', ...(message.includes('Error') || message.includes('Failed') ? { background: '#fef2f2', borderColor: '#fecaca', color: '#991b1b' } : {}) }}>
            <strong>{message}</strong>
          </div>
        )}

        <form onSubmit={handleSubmit} className="settings-form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            
            {/* General Info */}
            <div style={{ gridColumn: '1 / -1' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Store size={18} /> Basic Information
              </h3>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Shop Name</label>
              <input
                type="text"
                name="shop_name"
                className="form-control"
                value={settings.shop_name}
                onChange={handleChange}
                placeholder="e.g. THE GRAND RESTAURANT"
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label><MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} /> Address</label>
              <textarea
                name="address"
                className="form-control"
                value={settings.address}
                onChange={handleChange}
                placeholder="e.g. 123 Food Street, City, 10001"
                rows="2"
              ></textarea>
            </div>

            <div className="form-group">
              <label><Phone size={14} style={{ display: 'inline', marginRight: '4px' }} /> Phone Number</label>
              <input
                type="text"
                name="phone"
                className="form-control"
                value={settings.phone}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210"
              />
            </div>

            <div className="form-group">
              <label><FileText size={14} style={{ display: 'inline', marginRight: '4px' }} /> GSTIN</label>
              <input
                type="text"
                name="gstin"
                className="form-control"
                value={settings.gstin}
                onChange={handleChange}
                placeholder="e.g. 33AABCU9603R1ZM"
              />
            </div>

            {/* Payment Info */}
            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <QrCode size={18} /> UPI Payment QR Settings
              </h3>
            </div>

            <div className="form-group">
              <label>UPI ID (VPA)</label>
              <input
                type="text"
                name="upi_id"
                className="form-control"
                value={settings.upi_id}
                onChange={handleChange}
                placeholder="e.g. merchant@upi"
              />
            </div>

            <div className="form-group">
              <label>Payee Name (Registered Name)</label>
              <input
                type="text"
                name="payee_name"
                className="form-control"
                value={settings.payee_name}
                onChange={handleChange}
                placeholder="e.g. Grand Restaurant Pvt Ltd"
              />
            </div>

            {/* Footer Messages */}
            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HeartHandshake size={18} /> Footer Messages
              </h3>
            </div>

            <div className="form-group">
              <label>Thank You Note</label>
              <input
                type="text"
                name="thank_you_note"
                className="form-control"
                value={settings.thank_you_note}
                onChange={handleChange}
                placeholder="e.g. Thank you for your visit!"
              />
            </div>

            <div className="form-group">
              <label><Smile size={14} style={{ display: 'inline', marginRight: '4px' }} /> Visit Again Note</label>
              <input
                type="text"
                name="visit_again_note"
                className="form-control"
                value={settings.visit_again_note}
                onChange={handleChange}
                placeholder="e.g. Please visit again"
              />
            </div>
            
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Loader2 size={18} className="spinner" /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReceiptSettings;
