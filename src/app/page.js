'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

export default function Home() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [billingDate, setBillingDate] = useState('');
  const [unitsConsumed, setUnitsConsumed] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);

  // AI Insights State
  const [insights, setInsights] = useState('');
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bills');
      const json = await res.json();
      if (json.success) {
        setBills(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billingDate,
          unitsConsumed: Number(unitsConsumed),
          amountPaid: Number(amountPaid),
          notes
        })
      });
      const json = await res.json();
      if (json.success) {
        setBillingDate('');
        setUnitsConsumed('');
        setAmountPaid('');
        setNotes('');
        fetchBills();
      } else {
        console.error('Server returned error on adding:', json.error);
        alert('Failed to save bill: ' + (json.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to add bill', error);
      alert('Network error when attempting to add bill.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAnalyzingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/analyze-bill', {
        method: 'POST',
        body: formData
      });
      const json = await res.json();
      
      if (json.success && json.data) {
        if (json.data.billingDate) setBillingDate(json.data.billingDate);
        if (json.data.unitsConsumed) setUnitsConsumed(json.data.unitsConsumed);
        if (json.data.amountPaid) setAmountPaid(json.data.amountPaid);
      } else {
        console.error("OCR API returned false:", json);
        alert(`Could not auto-fill: ${json.error || "Unknown error"}\n\nCheck console for details.`);
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert("Error analyzing image. Check console for details.");
    } finally {
      setAnalyzingImage(false);
      // Reset input so the same file could trigger onChange again if needed
      e.target.value = null;
    }
  };

  const generateInsights = async () => {
    if (bills.length === 0) return;
    setInsightsLoading(true);
    try {
      const res = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bills })
      });
      const json = await res.json();
      if (json.success) {
        setInsights(json.insights);
      } else {
        setInsights('Could not generate insights at this time.');
      }
    } catch (error) {
      console.error('Failed to generate insights', error);
      setInsights('An error occurred while generating insights.');
    } finally {
      setInsightsLoading(false);
    }
  };

  // Compute stats
  const totalSpent = bills.reduce((acc, bill) => acc + bill.amountPaid, 0);
  const totalUnits = bills.reduce((acc, bill) => acc + bill.unitsConsumed, 0);
  const avgUnits = bills.length ? (totalUnits / bills.length).toFixed(0) : 0;

  // Format data for charts
  const chartData = [...bills].reverse().map(bill => ({
    name: new Date(bill.billingDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
    units: bill.unitsConsumed,
    cost: bill.amountPaid
  }));

  return (
    <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr' }}>
      
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <h3 className="text-muted" style={{ fontSize: '0.875rem', textTransform: 'uppercase' }}>Total Spent</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{totalSpent.toLocaleString('en-IN')}</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <h3 className="text-muted" style={{ fontSize: '0.875rem', textTransform: 'uppercase' }}>Total Units Consumed</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalUnits} kWh</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
          <h3 className="text-muted" style={{ fontSize: '0.875rem', textTransform: 'uppercase' }}>Average Units / Bill</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{avgUnits} kWh</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
        {/* Main Content Area */}
        <div style={{ display: 'grid', gap: '2rem' }}>
          
          {/* Chart Section */}
          <div className="card">
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Usage Trend</h2>
            {loading ? (
              <p>Loading chart data...</p>
            ) : chartData.length > 0 ? (
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUnits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#aa00ff" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0, 85, 255, 0.1)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--primary)', fontFamily: '"JetBrains Mono", monospace', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--primary)', fontFamily: '"JetBrains Mono", monospace', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '4px', border: '1px solid var(--primary)', backgroundColor: 'var(--card-bg)', backdropFilter: 'blur(10px)', color: 'var(--primary)', fontFamily: '"JetBrains Mono", monospace' }}
                      itemStyle={{ color: '#aa00ff' }}
                    />
                    <Area type="monotone" dataKey="units" stroke="var(--primary)" fillOpacity={1} fill="url(#colorUnits)" strokeWidth={4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-muted">No usage data to display. Add your first bill.</p>
            )}
          </div>

          {/* AI Insights Section */}
          <div className="card" style={{ background: 'rgba(255, 255, 255, 0.8)', border: '1px solid #0055ff' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', color: '#aa00ff', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase' }}>
              <span>✨</span> AI // NEURAL_INSIGHTS
            </h2>
            <p className="text-muted" style={{ marginBottom: '1rem', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem' }}>Get personalized tips to reduce your electricity consumption based on your history.</p>
            
            {insights ? (
              <div style={{ padding: '1rem', backgroundColor: 'rgba(0, 85, 255, 0.05)', borderLeft: '2px solid #aa00ff', whiteSpace: 'pre-wrap', fontSize: '0.95rem', fontFamily: '"JetBrains Mono", monospace', backdropFilter: 'blur(5px)' }}>
                {insights}
              </div>
            ) : null}

            <button 
              className="btn-primary" 
              onClick={generateInsights} 
              disabled={insightsLoading || bills.length === 0}
              style={{ marginTop: '1rem', width: '100%', background: 'linear-gradient(135deg, #aa00ff, #0055ff)' }}
            >
              {insightsLoading ? 'CALCULATING NEURAL NET...' : 'INITIALIZE ANALYSIS'}
            </button>
          </div>
        </div>

        {/* Sidebar: Add Bill Form */}
        <div className="card" style={{ position: 'sticky', top: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', textTransform: 'uppercase' }}>INPUT // DATA</h2>

          <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '2px dashed var(--primary)', borderRadius: '4px', textAlign: 'center', backgroundColor: 'rgba(0, 85, 255, 0.05)', transition: 'all 0.2s' }}>
            <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.75rem' }}>SCAN</span>
              <span style={{ fontWeight: 800, color: '#aa00ff', textTransform: 'uppercase' }}>Optical Recognition</span>
              <span className="text-muted" style={{ fontSize: '0.75rem', fontFamily: '"JetBrains Mono", monospace' }}>Upload KSEB doc. System will extract.</span>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={analyzingImage} />
            </label>
            {analyzingImage && <p style={{ fontSize: '0.875rem', color: '#ff3d00', marginTop: '0.75rem', fontWeight: 800, animation: 'pulse 1s infinite' }}>PROCESSING... ⚡</p>}
          </div>

          <form style={{ display: 'grid', gap: '1rem' }} onSubmit={handleSubmit}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Billing Date</label>
              <input 
                type="date" 
                required 
                value={billingDate} 
                onChange={e => setBillingDate(e.target.value)} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Units Consumed (kWh)</label>
              <input 
                type="number" 
                required 
                placeholder="e.g. 240"
                value={unitsConsumed} 
                onChange={e => setUnitsConsumed(e.target.value)} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Amount Paid (₹)</label>
              <input 
                type="number" 
                required 
                placeholder="e.g. 1540"
                value={amountPaid} 
                onChange={e => setAmountPaid(e.target.value)} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Notes (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. Summer AC Usage"
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
              />
            </div>
            <button className="btn-primary" type="submit" disabled={submitting} style={{ marginTop: '0.5rem' }}>
               {submitting ? 'Adding...' : 'Add Bill'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
