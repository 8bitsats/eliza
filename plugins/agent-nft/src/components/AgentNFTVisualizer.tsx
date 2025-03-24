import React, { useState, useEffect } from 'react';

// Types for our component
export interface AgentNFTStatus {
  step: 'idle' | 'dna-generation' | 'avatar-creation' | 'metadata-preparation' | 'minting' | 'completed' | 'error';
  agentName?: string;
  dnaSequence?: string;
  avatarUrl?: string;
  nftAddress?: string;
  explorerUrl?: string;
  errorMessage?: string;
}

export interface AgentNFTVisualizerProps {
  status: AgentNFTStatus;
  onGenerateDNA?: () => void;
  onCreateAvatar?: () => void;
  onMintNFT?: () => void;
}

/**
 * AgentNFTVisualizer - A component for visualizing the agent NFT creation process
 */
const AgentNFTVisualizer: React.FC<AgentNFTVisualizerProps> = ({ 
  status, 
  onGenerateDNA, 
  onCreateAvatar, 
  onMintNFT 
}) => {
  const [dnaColors, setDnaColors] = useState<string[]>([]);

  // Convert DNA sequence to colored visualization
  useEffect(() => {
    if (status.dnaSequence) {
      const colors = [];
      for (const base of status.dnaSequence) {
        switch (base) {
          case 'A': colors.push('#4CAF50'); break; // Green
          case 'T': colors.push('#2196F3'); break; // Blue
          case 'G': colors.push('#FFC107'); break; // Yellow
          case 'C': colors.push('#F44336'); break; // Red
          default: colors.push('#9E9E9E'); break;  // Gray
        }
      }
      setDnaColors(colors);
    }
  }, [status.dnaSequence]);

  return (
    <div className="agent-nft-visualizer">
      <h2>Agent NFT Creation</h2>
      
      {/* Progress steps */}
      <div className="progress-steps">
        {['DNA Generation', 'Avatar Creation', 'Metadata Preparation', 'NFT Minting', 'Completed']
          .map((step, index) => {
            // Calculate if step is active, completed, or pending
            let stepStatus = 'pending';
            const stepOrder = ['idle', 'dna-generation', 'avatar-creation', 'metadata-preparation', 'minting', 'completed'];
            const currentIdx = stepOrder.indexOf(status.step);
            
            if (index < currentIdx) stepStatus = 'completed';
            if (index === currentIdx) stepStatus = 'active';
            
            return (
              <div key={step} className={`step ${stepStatus}`}>
                <div className="step-number">{index + 1}</div>
                <div className="step-label">{step}</div>
              </div>
            );
          })}
      </div>
      
      {/* DNA Visualization */}
      {status.step !== 'idle' && status.step !== 'error' && (
        <div className="dna-container">
          <h3>DNA Sequence</h3>
          {status.dnaSequence ? (
            <div className="dna-visualization">
              <div className="dna-strand">
                {dnaColors.slice(0, 50).map((color, idx) => (
                  <span 
                    key={idx} 
                    className="dna-base" 
                    style={{ backgroundColor: color }}
                    title={status.dnaSequence![idx]}
                  >
                    {status.dnaSequence![idx]}
                  </span>
                ))}
                {status.dnaSequence.length > 50 && <span>...</span>}
              </div>
              <div className="dna-info">
                <p><strong>Length:</strong> {status.dnaSequence.length} bases</p>
                <p><strong>Hash:</strong> {status.dnaSequence.substring(0, 8)}</p>
              </div>
            </div>
          ) : (
            <div className="loading-dna">Generating DNA sequence...</div>
          )}
        </div>
      )}
      
      {/* Avatar Preview */}
      {(status.step === 'avatar-creation' || status.step === 'metadata-preparation' || 
        status.step === 'minting' || status.step === 'completed') && (
        <div className="avatar-container">
          <h3>Agent Avatar</h3>
          {status.avatarUrl ? (
            <div className="avatar-preview">
              <img src={status.avatarUrl} alt="Agent Avatar" />
            </div>
          ) : (
            <div className="loading-avatar">Creating avatar...</div>
          )}
        </div>
      )}
      
      {/* NFT Details */}
      {status.step === 'completed' && (
        <div className="nft-details">
          <h3>NFT Successfully Minted!</h3>
          <div className="detail-row">
            <span className="detail-label">Agent Name:</span>
            <span className="detail-value">{status.agentName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">NFT Address:</span>
            <span className="detail-value">{status.nftAddress}</span>
          </div>
          {status.explorerUrl && (
            <div className="detail-row">
              <a href={status.explorerUrl} target="_blank" rel="noopener noreferrer" className="explorer-link">
                View on Blockchain Explorer
              </a>
            </div>
          )}
        </div>
      )}
      
      {/* Error State */}
      {status.step === 'error' && (
        <div className="error-container">
          <h3>Error Occurred</h3>
          <p className="error-message">{status.errorMessage}</p>
          <button className="retry-button" onClick={onGenerateDNA}>Retry</button>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="action-buttons">
        {status.step === 'idle' && (
          <button className="action-button" onClick={onGenerateDNA}>Start NFT Creation</button>
        )}
        {status.step === 'dna-generation' && status.dnaSequence && (
          <button className="action-button" onClick={onCreateAvatar}>Create Avatar</button>
        )}
        {status.step === 'avatar-creation' && status.avatarUrl && (
          <button className="action-button" onClick={onMintNFT}>Mint NFT</button>
        )}
      </div>
    </div>
  );
};

export default AgentNFTVisualizer;
