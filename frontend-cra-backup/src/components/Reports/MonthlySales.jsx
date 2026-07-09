import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../../services/api';
import { Loader2, TrendingUp, ShoppingBag, IndianRupee } from 'lucide-react';

const MonthlySales = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await reportsAPI.getMonthly(month, year);
      setReportData(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching report:', err);
      setLoading(false);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading && !reportData) {
    return (
      <div className="loading-state">
        <Loader2 className="spinner" size={48} color="var(--primary)" style={{ animation: 'spin 2s linear infinite' }} />
        <p>Loading report data...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header flex justify-between items-center mb-4">
        <div>
          <h2>Sales Dashboard</h2>
          <p>View your monthly revenue and item performance.</p>
        </div>
        
        <div className="flex gap-4 items-center" style={{ background: 'var(--bg-panel)', padding: '0.75rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
          <select 
            value={month} 
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="form-input"
            style={{ width: 'auto', border: 'none', background: 'var(--bg-color)' }}
          >
            {months.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            min="2020"
            max={new Date().getFullYear()}
            className="form-input"
            style={{ width: '80px', border: 'none', background: 'var(--bg-color)' }}
          />
        </div>
      </div>

      {reportData && (
        <>
          <div className="report-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="card flex items-center gap-4" style={{ marginBottom: 0 }}>
              <div style={{ background: 'var(--primary-light)', padding: '1rem', borderRadius: 'var(--radius-md)', color: 'var(--primary-dark)' }}>
                <ShoppingBag size={32} />
              </div>
              <div>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total Orders</h3>
                <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{reportData.summary?.total_orders || 0}</p>
              </div>
            </div>
            
            <div className="card flex items-center gap-4" style={{ marginBottom: 0 }}>
              <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: 'var(--radius-md)', color: 'var(--secondary)' }}>
                <TrendingUp size={32} />
              </div>
              <div>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total Revenue</h3>
                <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹{reportData.summary?.total_revenue?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {reportData.item_sales && reportData.item_sales.length > 0 && (
              <div className="card table-responsive">
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Top Selling Items</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th style={{ textAlign: 'center' }}>Qty</th>
                      <th style={{ textAlign: 'right' }}>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.item_sales.map((item, index) => (
                      <tr key={index}>
                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                        <td style={{ textAlign: 'center' }}>{item.total_quantity || 0}</td>
                        <td style={{ textAlign: 'right', color: 'var(--primary-dark)', fontWeight: 600 }}>₹{(item.total_revenue || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportData.daily_sales && reportData.daily_sales.length > 0 && (
              <div className="card table-responsive">
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Daily Breakdown</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th style={{ textAlign: 'center' }}>Orders</th>
                      <th style={{ textAlign: 'right' }}>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.daily_sales.map((day, index) => (
                      <tr key={index}>
                        <td>{new Date(day.date).toLocaleDateString()}</td>
                        <td style={{ textAlign: 'center' }}>{day.order_count || 0}</td>
                        <td style={{ textAlign: 'right', color: 'var(--primary-dark)', fontWeight: 600 }}>₹{(day.total_revenue || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {(!reportData.item_sales || reportData.item_sales.length === 0) && 
           (!reportData.daily_sales || reportData.daily_sales.length === 0) && (
            <div className="loading-state">
              <IndianRupee size={48} opacity={0.2} />
              <p>No sales data available for this month.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MonthlySales;
