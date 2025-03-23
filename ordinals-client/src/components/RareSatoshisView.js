import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const RareSatoshisView = () => {
  const { 
    findRareSatoshis, 
    rareSatoshis, 
    formatBytes,
    loading 
  } = useAppContext();
  
  const [rarity, setRarity] = useState('rare');
  const [limit, setLimit] = useState(5);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      await findRareSatoshis(rarity, limit);
      setSearchPerformed(true);
    } catch (error) {
      console.error('Error searching for rare satoshis:', error);
    }
  };

  return (
    <div className="rare-satoshis-view" style={{ padding: '1rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>Find Rare Satoshis</h2>
      
      <div style={{ maxWidth: '600px', marginBottom: '2rem' }}>
        <p style={{ marginBottom: '1rem' }}>
          Satoshis (the smallest unit of Bitcoin) can have different rarity levels based on their position
          in the Bitcoin blockchain. Search for inscriptions that contain rare satoshis.
        </p>
        
        <form onSubmit={handleSearch} style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label htmlFor="rarity">Rarity Level: </label>
              <select 
                id="rarity" 
                value={rarity} 
                onChange={(e) => setRarity(e.target.value)}
                className="message-input"
                style={{ marginLeft: '0.5rem', padding: '0.5rem', minWidth: '150px' }}
              >
                <option value="common">Common</option>
                <option value="uncommon">Uncommon</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
                <option value="mythic">Mythic</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="limit">Results: </label>
              <select 
                id="limit" 
                value={limit} 
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="message-input"
                style={{ marginLeft: '0.5rem', padding: '0.5rem', minWidth: '80px' }}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
            
            <div>
              <button 
                type="submit" 
                className="btn primary"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </form>
        
        <div className="rarity-info" style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          <div><strong>Common</strong> - Most satoshis</div>
          <div><strong>Uncommon</strong> - First satoshi of each block</div>
          <div><strong>Rare</strong> - First satoshi of each difficulty adjustment</div>
          <div><strong>Epic</strong> - First satoshi of each halving</div>
          <div><strong>Legendary</strong> - First satoshi of each cycle</div>
          <div><strong>Mythic</strong> - The genesis satoshi</div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
          {searchPerformed && (
            <div className="search-results">
              <h3>Results for {rarity} satoshis</h3>
              
              {rareSatoshis.length === 0 ? (
                <div className="system-message" style={{ margin: '1rem 0' }}>
                  No inscriptions found with {rarity} satoshis
                </div>
              ) : (
                <div className="inscriptions-container">
                  {rareSatoshis.map(inscription => (
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
                        <div className="inscription-type">
                          {inscription.mime_type} ({formatBytes(inscription.content_length)})
                        </div>
                        <div style={{ marginTop: '0.25rem' }}>
                          <strong>Satoshi:</strong> {inscription.sat_ordinal}
                        </div>
                        <div style={{ color: 'var(--color-accent)' }}>
                          <strong>Rarity:</strong> {inscription.sat_rarity}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RareSatoshisView;
