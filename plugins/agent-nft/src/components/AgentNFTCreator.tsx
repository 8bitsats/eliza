import React, { useState } from 'react';
import AgentNFTVisualizer, { AgentNFTStatus } from './AgentNFTVisualizer';
import './AgentNFTVisualizer.css';
import { AgentNFTController, AgentCharacterData } from '../agent-nft-controller';
import { BlockchainPlatform } from '../nft-service';

export interface AgentNFTCreatorProps {
  onComplete?: (result: any) => void;
  defaultPlatform?: BlockchainPlatform;
}

const AgentNFTCreator: React.FC<AgentNFTCreatorProps> = ({ 
  onComplete,
  defaultPlatform = BlockchainPlatform.SOLANA 
}) => {
  const [agent, setAgent] = useState<AgentCharacterData>({
    name: '',
    adjectives: [],
    bio: []
  });
  const [status, setStatus] = useState<AgentNFTStatus>({
    step: 'idle'
  });
  const [platform, setPlatform] = useState<BlockchainPlatform>(defaultPlatform);
  
  // Create a controller instance
  const controller = new AgentNFTController();
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgent({ ...agent, name: e.target.value });
  };
  
  const handleAdjectivesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgent({ ...agent, adjectives: e.target.value.split(',').map(adj => adj.trim()) });
  };
  
  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAgent({ ...agent, bio: e.target.value.split('\n') });
  };
  
  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPlatform(e.target.value as BlockchainPlatform);
  };
  
  const generateDNA = async () => {
    if (!agent.name) {
      alert('Please enter an agent name');
      return;
    }
    
    setStatus({ 
      step: 'dna-generation',
      agentName: agent.name 
    });
    
    try {
      // Generate DNA using the controller
      const startSequence = agent.name
        .replace(/[^A-Za-z]/g, '')
        .substring(0, 10)
        .toUpperCase();
      
      // Mock DNA generation for the demo
      // In a real app, you'd use: await controller.generateAgentDNA(startSequence);
      const dnaSequence = await mockDNAGeneration(startSequence);
      
      setStatus(prev => ({
        ...prev,
        step: 'dna-generation',
        dnaSequence
      }));
    } catch (error) {
      console.error(error);
      setStatus({
        step: 'error',
        errorMessage: `DNA generation failed: ${error.message}`
      });
    }
  };
  
  const createAvatar = async () => {
    setStatus(prev => ({
      ...prev,
      step: 'avatar-creation'
    }));
    
    try {
      // Mock avatar creation for the demo
      // In a real app, you'd use a real avatar generation service
      const avatarUrl = await mockAvatarCreation(agent.name);
      
      setStatus(prev => ({
        ...prev,
        step: 'metadata-preparation',
        avatarUrl
      }));
    } catch (error) {
      console.error(error);
      setStatus(prev => ({
        ...prev,
        step: 'error',
        errorMessage: `Avatar creation failed: ${error.message}`
      }));
    }
  };
  
  const mintNFT = async () => {
    setStatus(prev => ({
      ...prev,
      step: 'minting'
    }));
    
    try {
      // Mock NFT minting for the demo
      // In a real app, you'd use the actual minting service
      const mintResult = await mockNFTMinting(agent, platform);
      
      setStatus(prev => ({
        ...prev,
        step: 'completed',
        nftAddress: mintResult.nftAddress,
        explorerUrl: mintResult.explorerUrl
      }));
      
      if (onComplete) {
        onComplete(mintResult);
      }
    } catch (error) {
      console.error(error);
      setStatus(prev => ({
        ...prev,
        step: 'error',
        errorMessage: `NFT minting failed: ${error.message}`
      }));
    }
  };
  
  // Mock functions for demo purposes
  const mockDNAGeneration = async (startSequence: string): Promise<string> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a simple DNA sequence for demo
    const bases = ['A', 'C', 'T', 'G'];
    let dna = startSequence || '';
    
    // Add random bases to reach 64 characters
    while (dna.length < 64) {
      const randomBase = bases[Math.floor(Math.random() * bases.length)];
      dna += randomBase;
    }
    
    return dna;
  };
  
  const mockAvatarCreation = async (agentName: string): Promise<string> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demo purposes, return a placeholder avatar URL
    // In a real app, this would be the URL of the generated avatar
    return `https://avatars.dicebear.com/api/bottts/${encodeURIComponent(agentName)}.svg`;
  };
  
  const mockNFTMinting = async (agentData: AgentCharacterData, nftPlatform: BlockchainPlatform) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock NFT minting result
    const nftAddress = '8Z3kBDgX7GCUj1uXdku9ViiFGQKgknzLnLXUy3QB4B29';
    
    return {
      agentName: agentData.name,
      nftAddress,
      dnaSequence: status.dnaSequence,
      avatarUrl: status.avatarUrl,
      platform: nftPlatform,
      explorerUrl: `https://explorer.solana.com/address/${nftAddress}?cluster=devnet`
    };
  };
  
  return (
    <div className="agent-nft-creator">
      {status.step === 'idle' && (
        <div className="agent-form">
          <h2>Create Agent NFT</h2>
          <div className="form-group">
            <label htmlFor="agentName">Agent Name</label>
            <input 
              type="text" 
              id="agentName" 
              value={agent.name} 
              onChange={handleNameChange} 
              placeholder="Enter agent name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="agentAdjectives">Agent Traits (comma-separated)</label>
            <input 
              type="text" 
              id="agentAdjectives" 
              value={agent.adjectives.join(', ')} 
              onChange={handleAdjectivesChange} 
              placeholder="intelligent, strategic, creative"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="agentBio">Agent Bio (one paragraph per line)</label>
            <textarea 
              id="agentBio" 
              value={agent.bio.join('\n')} 
              onChange={handleBioChange} 
              placeholder="Enter a description of your agent"
              rows={4}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="platform">Blockchain Platform</label>
            <select 
              id="platform" 
              value={platform} 
              onChange={handlePlatformChange}
            >
              <option value={BlockchainPlatform.SOLANA}>Solana</option>
              <option value={BlockchainPlatform.ETHEREUM}>Ethereum</option>
              <option value={BlockchainPlatform.BITCOIN}>Bitcoin (Ordinals)</option>
            </select>
          </div>
        </div>
      )}
      
      <AgentNFTVisualizer 
        status={status}
        onGenerateDNA={generateDNA}
        onCreateAvatar={createAvatar}
        onMintNFT={mintNFT}
      />
    </div>
  );
};

export default AgentNFTCreator;
