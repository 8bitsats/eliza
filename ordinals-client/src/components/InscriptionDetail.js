import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const InscriptionDetail = () => {
  const { id } = useParams();
  const { 
    fetchInscription, 
    fetchInscriptionContent, 
    currentInscription, 
    formatBytes,
    loading 
  } = useAppContext();
  
  const [content, setContent] = useState(null);
  const [contentType, setContentType] = useState(null);
  const [contentUrl, setContentUrl] = useState(null);
  const [error, setError] = useState(null);

  // Fetch inscription details on component mount
  useEffect(() => {
    const loadInscriptionDetails = async () => {
      try {
        await fetchInscription(id);
      } catch (error) {
        setError('Failed to load inscription details');
        console.error(error);
      }
    };
    
    loadInscriptionDetails();
  }, [id]);

  // Fetch inscription content when we have the details
  useEffect(() => {
    if (!currentInscription) return;
    
    const loadInscriptionContent = async () => {
      try {
        const blob = await fetchInscriptionContent(id);
        
        // Set content type from the inscription data
        setContentType(currentInscription.mime_type);
        
        // Create a URL for the blob to display images, audio, etc.
        setContentUrl(URL.createObjectURL(blob));
        
        // For text content, read as text
        if (currentInscription.mime_type?.startsWith('text/') || 
           currentInscription.mime_type?.includes('json') ||
           currentInscription.mime_type?.includes('javascript')) {
          const text = await blob.text();
          setContent(text);
        }
      } catch (error) {
        setError('Failed to load inscription content');
        console.error(error);
      }
    };
    
    loadInscriptionContent();
    
    // Clean up object URL when unmounting
    return () => {
      if (contentUrl) {
        URL.revokeObjectURL(contentUrl);
      }
    };
  }, [currentInscription, id]);

  // Render content based on mime type
  const renderContent = () => {
    if (!contentType || !contentUrl) {
      return (
        <div className="system-message">No content available</div>
      );
    }
    
    if (contentType.startsWith('image/')) {
      return (
        <img 
          src={contentUrl} 
          alt={`Inscription #${currentInscription.number}`} 
          style={{ maxWidth: '100%', borderRadius: 'var(--border-radius)' }}
        />
      );
    }
    
    if (contentType.startsWith('video/')) {
      return (
        <video 
          controls 
          src={contentUrl} 
          style={{ maxWidth: '100%', borderRadius: 'var(--border-radius)' }}
        >
          Your browser does not support video playback
        </video>
      );
    }
    
    if (contentType.startsWith('audio/')) {
      return (
        <audio 
          controls 
          src={contentUrl} 
          style={{ width: '100%', marginTop: '1rem' }}
        >
          Your browser does not support audio playback
        </audio>
      );
    }
    
    if (contentType.startsWith('text/') || 
        contentType.includes('json') || 
        contentType.includes('javascript')) {
      let language = 'text';
      
      if (contentType.includes('html')) language = 'html';
      if (contentType.includes('css')) language = 'css';
      if (contentType.includes('javascript')) language = 'javascript';
      if (contentType.includes('json')) language = 'json';
      
      return (
        <SyntaxHighlighter 
          language={language}
          style={atomOneDark}
          customStyle={{ 
            borderRadius: 'var(--border-radius)',
            maxHeight: '500px'
          }}
        >
          {content || ''}
        </SyntaxHighlighter>
      );
    }
    
    // For all other types, show a download link
    return (
      <div>
        <p>Content type {contentType} cannot be displayed in browser</p>
        <a 
          href={contentUrl} 
          download={`inscription-${currentInscription.number}`}
          className="btn primary"
          style={{ display: 'inline-block', marginTop: '1rem' }}
        >
          Download Content
        </a>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="system-message" style={{ margin: '2rem' }}>
        {error}
      </div>
    );
  }

  if (!currentInscription) {
    return (
      <div className="system-message" style={{ margin: '2rem' }}>
        Inscription not found
      </div>
    );
  }

  return (
    <div className="inscription-detail-view" style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/inscriptions" className="btn">&larr; Back to Inscriptions</Link>
      </div>
      
      <div className="inscription-detail">
        <h2 style={{ color: 'var(--color-accent)', marginBottom: '1rem' }}>
          Inscription #{currentInscription.number}
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.5rem 1rem', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 'bold' }}>ID:</div>
          <div style={{ wordBreak: 'break-all' }}>{currentInscription.id}</div>
          
          <div style={{ fontWeight: 'bold' }}>Content Type:</div>
          <div>{currentInscription.mime_type}</div>
          
          <div style={{ fontWeight: 'bold' }}>Size:</div>
          <div>{formatBytes(currentInscription.content_length)}</div>
          
          <div style={{ fontWeight: 'bold' }}>Created:</div>
          <div>{new Date(currentInscription.genesis_timestamp).toLocaleString()}</div>
          
          <div style={{ fontWeight: 'bold' }}>Genesis Address:</div>
          <div style={{ wordBreak: 'break-all' }}>{currentInscription.genesis_address}</div>
          
          <div style={{ fontWeight: 'bold' }}>Genesis Fee:</div>
          <div>{currentInscription.genesis_fee} sats</div>
          
          <div style={{ fontWeight: 'bold' }}>Current Address:</div>
          <div style={{ wordBreak: 'break-all' }}>{currentInscription.address || 'Unknown'}</div>
          
          <div style={{ fontWeight: 'bold' }}>Sat Rarity:</div>
          <div>{currentInscription.sat_rarity}</div>
          
          <div style={{ fontWeight: 'bold' }}>Sat Ordinal:</div>
          <div style={{ wordBreak: 'break-all' }}>{currentInscription.sat_ordinal}</div>
        </div>
        
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Content</h3>
          <div className="inscription-content">
            {renderContent()}
          </div>
        </div>
        
        <div style={{ marginTop: '2rem' }}>
          <a 
            href={`https://ordinals.com/inscription/${currentInscription.id}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn"
          >
            View on Ordinals.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default InscriptionDetail;
