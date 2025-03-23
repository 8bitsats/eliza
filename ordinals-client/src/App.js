import React, { useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAppContext } from './context/AppContext';

// Components
import ChatView from './components/ChatView';
import InscriptionsView from './components/InscriptionsView';
import InscriptionDetail from './components/InscriptionDetail';
import RareSatoshisView from './components/RareSatoshisView';

function App() {
  const { connectionStatus, connectToEliza, disconnectFromEliza, loading } = useAppContext();

  // Auto-connect to Eliza when app starts (optional)
  useEffect(() => {
    // Uncomment the line below to auto-connect on app start
    // connectToEliza();
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-logo">Ordinals Client</div>
        <div>
          {connectionStatus === 'connected' ? (
            <button className="btn" onClick={disconnectFromEliza}>
              Disconnect from Ord GPT
            </button>
          ) : (
            <button 
              className="btn primary" 
              onClick={() => connectToEliza()}
              disabled={loading || connectionStatus === 'connecting'}
            >
              {loading || connectionStatus === 'connecting' ? 'Connecting...' : 'Connect to Ord GPT'}
            </button>
          )}
        </div>
      </header>

      <div className="app-content">
        <aside className="sidebar">
          <div className={`status ${connectionStatus}`}>
            {connectionStatus === 'connected' ? 'Connected to Ord GPT' : 
             connectionStatus === 'connecting' ? 'Connecting...' : 
             connectionStatus === 'error' ? 'Connection Error' : 'Disconnected'}
          </div>

          <nav>
            <Link to="/" className="btn">Chat with Ord GPT</Link>
            <Link to="/inscriptions" className="btn">Browse Inscriptions</Link>
            <Link to="/rare-satoshis" className="btn">Find Rare Satoshis</Link>
          </nav>

          <div className="section-title">Ordinals Actions</div>
          <button 
            className="btn"
            onClick={() => window.open('https://docs.ordinals.com/', '_blank')}
          >
            Ordinals Documentation
          </button>
        </aside>

        <main className="main-content">
          {loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<ChatView />} />
              <Route path="/inscriptions" element={<InscriptionsView />} />
              <Route path="/inscriptions/:id" element={<InscriptionDetail />} />
              <Route path="/rare-satoshis" element={<RareSatoshisView />} />
            </Routes>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
