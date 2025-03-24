import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { AgentNFTVisualizer } from '../components/AgentNFTVisualizer';

interface AgentCharacter {
  name: string;
  adjectives: string[];
  bio: string[];
}

interface AgentNFTStatus {
  step: 'idle' | 'dna-generation' | 'avatar-creation' | 'metadata-preparation' | 'minting' | 'completed' | 'error';
  dnaSequence?: string;
  agentName?: string;
  avatarUrl?: string;
  nftAddress?: string;
  explorerUrl?: string;
  errorMessage?: string;
}

const steps = ['Agent Details', 'DNA Generation', 'Avatar Creation', 'Mint NFT'];

const AgentNFTCreator: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [character, setCharacter] = useState<AgentCharacter>({
    name: '',
    adjectives: [],
    bio: [],
  });
  const [adjectiveInput, setAdjectiveInput] = useState<string>('');
  const [bioInput, setBioInput] = useState<string>('');
  const [platform, setPlatform] = useState<string>('solana');
  const [status, setStatus] = useState<AgentNFTStatus>({ step: 'idle' });
  
  // Step navigation
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Character form handlers
  const handleAddAdjective = () => {
    if (adjectiveInput.trim()) {
      setCharacter({
        ...character,
        adjectives: [...character.adjectives, adjectiveInput.trim()],
      });
      setAdjectiveInput('');
    }
  };

  const handleRemoveAdjective = (index: number) => {
    setCharacter({
      ...character,
      adjectives: character.adjectives.filter((_, i) => i !== index),
    });
  };

  const handleAddBio = () => {
    if (bioInput.trim()) {
      setCharacter({
        ...character,
        bio: [...character.bio, bioInput.trim()],
      });
      setBioInput('');
    }
  };

  const handleRemoveBio = (index: number) => {
    setCharacter({
      ...character,
      bio: character.bio.filter((_, i) => i !== index),
    });
  };

  // Sample character generation
  const generateSampleCharacter = () => {
    setCharacter({
      name: 'Quantum Sage',
      adjectives: ['intelligent', 'strategic', 'creative', 'analytical', 'resourceful'],
      bio: [
        'Quantum Sage is an AI agent specializing in complex problem-solving and strategic planning.',
        'With expertise in data analysis and predictive modeling, Quantum Sage helps users navigate uncertain scenarios with clarity and precision.',
        'Created using advanced neural networks, this agent continually learns from interactions to provide increasingly personalized assistance.',
      ],
    });
  };

  // Validate character data
  const validateCharacterData = (): boolean => {
    if (!character.name) {
      alert('Please enter an agent name');
      return false;
    }

    if (character.adjectives.length === 0) {
      alert('Please add at least one trait/adjective');
      return false;
    }

    if (character.bio.length === 0) {
      alert('Please add at least one bio paragraph');
      return false;
    }

    return true;
  };

  // DNA Generation
  const handleGenerateDNA = async () => {
    if (!validateCharacterData()) return;

    setStatus({
      step: 'dna-generation',
      agentName: character.name,
    });

    try {
      // Generate DNA using character name as seed
      const nameBasedSeed = character.name
        .replace(/[^A-Za-z]/g, '')
        .substring(0, 10)
        .toUpperCase();
      
      const response = await axios.post('/api/generate-dna', {
        startSequence: nameBasedSeed,
        numTokens: 32,
        temperature: 0.8,
      });

      setStatus(prev => ({
        ...prev,
        dnaSequence: response.data.sequence,
      }));

      handleNext();
    } catch (error) {
      console.error('DNA generation error:', error);
      setStatus({
        step: 'error',
        errorMessage: `DNA generation failed: ${error.message || 'Unknown error'}`,
      });
    }
  };

  // Avatar Creation
  const handleCreateAvatar = async () => {
    setStatus(prev => ({
      ...prev,
      step: 'avatar-creation',
    }));

    try {
      const response = await axios.post('/api/generate-avatar', 
        { characterData: character }, 
        { responseType: 'blob' }
      );

      // Create a URL for the blob
      const url = URL.createObjectURL(response.data);
      
      setStatus(prev => ({
        ...prev,
        step: 'metadata-preparation',
        avatarUrl: url,
      }));

      handleNext();
    } catch (error) {
      console.error('Avatar generation error:', error);
      setStatus(prev => ({
        ...prev,
        step: 'error',
        errorMessage: `Avatar creation failed: ${error.message || 'Unknown error'}`,
      }));
    }
  };

  // NFT Minting
  const handleMintNFT = async () => {
    setStatus(prev => ({
      ...prev,
      step: 'minting',
    }));

    try {
      const response = await axios.post('/api/mint-nft', {
        characterData: character,
        platform: platform,
      });

      setStatus(prev => ({
        ...prev,
        step: 'completed',
        nftAddress: response.data.nftAddress,
        explorerUrl: response.data.explorerUrl,
      }));

      handleNext();
    } catch (error) {
      console.error('NFT minting error:', error);
      setStatus(prev => ({
        ...prev,
        step: 'error',
        errorMessage: `NFT minting failed: ${error.message || 'Unknown error'}`,
      }));
    }
  };

  // Reset process
  const handleReset = () => {
    setActiveStep(0);
    setStatus({ step: 'idle' });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Create Agent NFT
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Step 1: Agent Details */}
        {activeStep === 0 && (
          <Paper sx={{ p: 3 }} elevation={2}>
            <Typography variant="h6" gutterBottom>
              Agent Character Profile
            </Typography>

            <TextField
              label="Agent Name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={character.name}
              onChange={(e) => setCharacter({ ...character, name: e.target.value })}
            />

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Agent Traits/Adjectives
              </Typography>
              <Box sx={{ display: 'flex', mb: 2 }}>
                <TextField
                  label="Add a trait"
                  variant="outlined"
                  fullWidth
                  value={adjectiveInput}
                  onChange={(e) => setAdjectiveInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddAdjective()}
                />
                <Button
                  variant="contained"
                  onClick={handleAddAdjective}
                  sx={{ ml: 1 }}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {character.adjectives.map((adj, index) => (
                  <Chip
                    key={index}
                    label={adj}
                    onDelete={() => handleRemoveAdjective(index)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Agent Bio
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
                <TextField
                  label="Add a bio paragraph"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  sx={{ mb: 1 }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddBio}
                  sx={{ alignSelf: 'flex-end' }}
                >
                  Add Paragraph
                </Button>
              </Box>
              <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
                {character.bio.length > 0 ? (
                  character.bio.map((paragraph, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="body1">{paragraph}</Typography>
                      <Button
                        size="small"
                        onClick={() => handleRemoveBio(index)}
                        sx={{ mt: 1 }}
                        color="error"
                      >
                        Remove
                      </Button>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Add paragraphs to build your agent's bio.
                  </Typography>
                )}
              </Box>
            </Box>

            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel>Blockchain Platform</InputLabel>
              <Select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                label="Blockchain Platform"
              >
                <MenuItem value="solana">Solana</MenuItem>
                <MenuItem value="ethereum">Ethereum</MenuItem>
                <MenuItem value="bitcoin">Bitcoin (Ordinals)</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={generateSampleCharacter}
              >
                Use Sample Character
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerateDNA}
              >
                Continue to DNA Generation
              </Button>
            </Box>
          </Paper>
        )}

        {/* Step 2: DNA Generation */}
        {activeStep === 1 && (
          <Paper sx={{ p: 3 }} elevation={2}>
            <Typography variant="h6" gutterBottom>
              DNA Generation for {character.name}
            </Typography>
            
            <AgentNFTVisualizer 
              status={status} 
              onGenerateDNA={handleGenerateDNA}
              onCreateAvatar={handleCreateAvatar}
              onMintNFT={handleMintNFT}
            />

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleBack}>Back</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateAvatar}
                disabled={!status.dnaSequence}
              >
                Continue to Avatar Creation
              </Button>
            </Box>
          </Paper>
        )}

        {/* Step 3: Avatar Creation */}
        {activeStep === 2 && (
          <Paper sx={{ p: 3 }} elevation={2}>
            <Typography variant="h6" gutterBottom>
              Avatar Creation for {character.name}
            </Typography>

            <AgentNFTVisualizer 
              status={status} 
              onGenerateDNA={handleGenerateDNA}
              onCreateAvatar={handleCreateAvatar}
              onMintNFT={handleMintNFT}
            />

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleBack}>Back</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleMintNFT}
                disabled={!status.avatarUrl}
              >
                Continue to NFT Minting
              </Button>
            </Box>
          </Paper>
        )}

        {/* Step 4: NFT Minting */}
        {activeStep === 3 && (
          <Paper sx={{ p: 3 }} elevation={2}>
            <Typography variant="h6" gutterBottom>
              Mint NFT for {character.name}
            </Typography>

            <AgentNFTVisualizer 
              status={status} 
              onGenerateDNA={handleGenerateDNA}
              onCreateAvatar={handleCreateAvatar}
              onMintNFT={handleMintNFT}
            />

            {status.step === 'completed' && (
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="primary" gutterBottom>
                  NFT Created Successfully!
                </Typography>
                <Typography variant="body1">
                  Congratulations! Your agent NFT has been minted and is now available on the blockchain.
                </Typography>
                {status.explorerUrl && (
                  <Button 
                    variant="outlined" 
                    href={status.explorerUrl} 
                    target="_blank"
                    sx={{ mt: 2 }}
                  >
                    View on Blockchain Explorer
                  </Button>
                )}
              </Box>
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleBack} disabled={status.step === 'completed'}>Back</Button>
              {status.step === 'completed' ? (
                <Button variant="contained" color="primary" onClick={handleReset}>
                  Create Another NFT
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleMintNFT}
                  disabled={status.step === 'minting'}
                >
                  {status.step === 'minting' ? 'Minting...' : 'Mint NFT'}
                </Button>
              )}
            </Box>
          </Paper>
        )}

        {/* Error State */}
        {status.step === 'error' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {status.errorMessage || 'An unexpected error occurred.'}
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleReset}
              sx={{ ml: 2 }}
            >
              Restart Process
            </Button>
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default AgentNFTCreator;
