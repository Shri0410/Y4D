import React, { useState, useEffect } from 'react';
import { impactService } from '../../api/services/impact.service';
import logger from "../../utils/logger";
import toast from "../../utils/toast";

const ImpactDataEditor = () => {
  const [impactData, setImpactData] = useState({
    beneficiaries: 15,
    states: 20,
    projects: 200
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchImpactData();
  }, []);

  const fetchImpactData = async () => {
    try {
      const data = await impactService.getImpactData();
      setImpactData(data);
    } catch (error) {
      logger.error('Error fetching impact data:', error);
      setMessage('Error fetching data. Please check if the server is running.');
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage('');
  
  try {
    await impactService.updateImpactData(impactData);
    toast.success('Impact data updated successfully!');
    
    // CRITICAL: Dispatch event to notify Home.jsx to refresh data
    window.dispatchEvent(new CustomEvent('impactDataUpdated'));
    
    setTimeout(() => setMessage(''), 3000);
  } catch (error) {
    logger.error('Error updating impact data:', error);
    let errorMessage = 'Error updating data. Please try again.';
    
    if (error.response && error.response.status === 404) {
      errorMessage = 'Error: API endpoint not found. Please check the server URL.';
    }
    
    setMessage(errorMessage);
    toast.error(errorMessage);
  }
  setLoading(false);
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setImpactData(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ color: '#333', borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>
        Edit Impact Numbers
      </h2>
      
      {message && (
        <div style={{
          padding: '10px',
          marginBottom: '15px',
          borderRadius: '4px',
          backgroundColor: message.includes('Error') ? '#f8d7da' : '#d4edda',
          color: message.includes('Error') ? '#721c24' : '#155724',
          border: `1px solid ${message.includes('Error') ? '#f5c6cb' : '#c3e6cb'}`
        }}>
          {message}
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h3 style={{ color: '#555' }}>Current Values</h3>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '15px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold' }}>Beneficiaries:</span>
              <span style={{ fontSize: '1.2em', color: '#007bff' }}>{impactData.beneficiaries}L+</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold' }}>States:</span>
              <span style={{ fontSize: '1.2em', color: '#007bff' }}>{impactData.states}+</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold' }}>Projects:</span>
              <span style={{ fontSize: '1.2em', color: '#007bff' }}>{impactData.projects}+</span>
            </div>
          </div>
        </div>
        
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h3 style={{ color: '#555' }}>Update Values</h3>
          <form onSubmit={handleSubmit} style={{
            padding: '20px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Beneficiaries (L+):
              </label>
              <input
                type="number"
                name="beneficiaries"
                value={impactData.beneficiaries}
                onChange={handleChange}
                min="0"
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                States:
              </label>
              <input
                type="number"
                name="states"
                value={impactData.states}
                onChange={handleChange}
                min="0"
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Projects:
              </label>
              <input
                type="number"
                name="projects"
                value={impactData.projects}
                onChange={handleChange}
                min="0"
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '10px 15px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%',
                fontSize: '1em'
              }}
            >
              {loading ? 'Updating...' : 'Update Impact Data'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ImpactDataEditor;
