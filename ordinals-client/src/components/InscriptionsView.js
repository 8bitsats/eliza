import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const InscriptionsView = () => {
  const { 
    inscriptions, 
    fetchInscriptions, 
    pagination, 
    handlePagination, 
    formatBytes,
    loading 
  } = useAppContext();
  
  const [filter, setFilter] = useState({
    mimeType: '',
    order: 'desc'
  });

  // Fetch inscriptions on component mount
  useEffect(() => {
    fetchInscriptions();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilter = () => {
    const filterOptions = {};
    
    if (filter.mimeType) {
      filterOptions.mime_type = [filter.mimeType];
    }
    
    filterOptions.order = filter.order;
    
    fetchInscriptions(filterOptions);
  };

  const resetFilter = () => {
    setFilter({
      mimeType: '',
      order: 'desc'
    });
    
    fetchInscriptions({
      order: 'desc'
    });
  };

  // Get unique MIME types for filtering
  const getMimeTypes = () => {
    const mimeTypes = new Set();
    inscriptions.forEach(inscription => {
      if (inscription.mime_type) {
        mimeTypes.add(inscription.mime_type);
      }
    });
    return Array.from(mimeTypes);
  };

  return (
    <div className="inscriptions-view">
      <div className="filter-container" style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ marginBottom: '1rem' }}>Inscriptions</h2>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label htmlFor="mimeType">MIME Type: </label>
            <select 
              id="mimeType" 
              name="mimeType" 
              value={filter.mimeType} 
              onChange={handleFilterChange}
              className="message-input"
              style={{ marginLeft: '0.5rem', padding: '0.5rem', minWidth: '200px' }}
            >
              <option value="">All types</option>
              {getMimeTypes().map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="order">Order: </label>
            <select 
              id="order" 
              name="order" 
              value={filter.order} 
              onChange={handleFilterChange}
              className="message-input"
              style={{ marginLeft: '0.5rem', padding: '0.5rem', minWidth: '150px' }}
            >
              <option value="asc">Oldest first</option>
              <option value="desc">Newest first</option>
            </select>
          </div>
          
          <div>
            <button 
              className="btn primary" 
              onClick={applyFilter}
              disabled={loading}
            >
              Apply Filters
            </button>
            <button 
              className="btn" 
              onClick={resetFilter}
              disabled={loading}
              style={{ marginLeft: '0.5rem' }}
            >
              Reset
            </button>
          </div>
        </div>
        
        <div className="pagination-info">
          Showing {inscriptions.length > 0 ? pagination.offset + 1 : 0} - {Math.min(pagination.offset + inscriptions.length, pagination.total)} of {pagination.total} inscriptions
        </div>
      </div>
      
      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
          <div className="inscriptions-container">
            {inscriptions.length === 0 ? (
              <div className="system-message">No inscriptions found</div>
            ) : (
              inscriptions.map(inscription => (
                <Link 
                  key={inscription.id} 
                  to={`/inscriptions/${inscription.id}`}
                  className="inscription-item"
                >
                  <div className="inscription-preview">
                    {inscription.mime_type?.startsWith('image/') ? (
                      <img 
                        src={`https://api.hiro.so/ordinals/v1/inscriptions/${inscription.id}/content`} 
                        alt={`Inscription #${inscription.number}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMzMzIi8+Cjwvc3ZnPg==';
                        }}
                      />
                    ) : (
                      <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', textAlign: 'center' }}>
                        {inscription.mime_type?.split('/')[0] || 'unknown'}
                      </div>
                    )}
                  </div>
                  
                  <div className="inscription-info">
                    <div className="inscription-number">#{inscription.number}</div>
                    <div className="inscription-type">{inscription.mime_type} ({formatBytes(inscription.content_length)})</div>
                    <div className="inscription-date">
                      {new Date(inscription.genesis_timestamp).toLocaleString()}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
          
          <div className="pagination">
            <button 
              className="pagination-btn"
              onClick={() => handlePagination(0)}
              disabled={pagination.offset === 0 || loading}
            >
              First
            </button>
            
            <button 
              className="pagination-btn"
              onClick={() => handlePagination(Math.max(0, pagination.offset - pagination.limit))}
              disabled={pagination.offset === 0 || loading}
            >
              Previous
            </button>
            
            <button 
              className="pagination-btn"
              onClick={() => handlePagination(pagination.offset + pagination.limit)}
              disabled={pagination.offset + pagination.limit >= pagination.total || loading}
            >
              Next
            </button>
            
            <button 
              className="pagination-btn"
              onClick={() => handlePagination(Math.floor(pagination.total / pagination.limit) * pagination.limit)}
              disabled={pagination.offset + pagination.limit >= pagination.total || loading}
            >
              Last
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default InscriptionsView;
