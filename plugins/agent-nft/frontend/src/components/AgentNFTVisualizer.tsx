import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Paper,
  Typography,
  LinearProgress,
} from '@mui/material';

export interface AgentNFTStatus {
  step: 'idle' | 'dna-generation' | 'avatar-creation' | 'metadata-preparation' | 'minting' | 'completed' | 'error';
  dnaSequence?: string;
  agentName?: string;
  avatarUrl?: string;
  nftAddress?: string;
  explorerUrl?: string;
  errorMessage?: string;
}

interface AgentNFTVisualizerProps {
  status: AgentNFTStatus;
  onGenerateDNA: () => void;
  onCreateAvatar: () => void;
  onMintNFT: () => void;
}

export const AgentNFTVisualizer: React.FC<AgentNFTVisualizerProps> = ({
  status,
  onGenerateDNA,
  onCreateAvatar,
  onMintNFT,
}) => {
  // Helper function to determine if a step is active
  const isStepActive = (step: AgentNFTStatus['step']) => {
    return status.step === step;
  };

  // Helper function to determine if a step is completed
  const isStepCompleted = (step: AgentNFTStatus['step']) => {
    const steps: AgentNFTStatus['step'][] = [
      'idle',
      'dna-generation',
      'avatar-creation',
      'metadata-preparation',
      'minting',
      'completed',
    ];
    
    if (status.step === 'error') return false;
    
    const currentIndex = steps.indexOf(status.step);
    const stepIndex = steps.indexOf(step);
    
    return stepIndex < currentIndex;
  };

  // DNA nucleotide color mapping
  const getBaseColor = (base: string): string => {
    switch (base.toUpperCase()) {
      case 'A':
        return '#4CAF50'; // Green
      case 'T':
        return '#2196F3'; // Blue
      case 'G':
        return '#FFC107'; // Yellow/Amber
      case 'C':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Grey
    }
  };

  // Renders a DNA sequence with colored nucleotides
  const renderDNASequence = (sequence: string) => {
    return (
      <Box sx={{ overflowX: 'auto', whiteSpace: 'nowrap', py: 2 }}>
        {sequence.split('').map((base, index) => (
          <Typography
            key={index}
            component="span"
            sx={{
              color: getBaseColor(base),
              fontWeight: 'bold',
              fontSize: '1.1rem',
              fontFamily: 'monospace',
              mx: 0.2,
            }}
          >
            {base}
          </Typography>
        ))}
      </Box>
    );
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* DNA Generation */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', position: 'relative' }}>
            {isStepActive('dna-generation') && (
              <LinearProgress sx={{ position: 'absolute', top: 0, width: '100%' }} />
            )}
            <CardContent>
              <Typography variant="h6" gutterBottom>
                DNA Generation
              </Typography>

              {status.step === 'idle' ? (
                <Box sx={{ textAlign: 'center', my: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={onGenerateDNA}
                    size="large"
                  >
                    Generate DNA
                  </Button>
                </Box>
              ) : isStepActive('dna-generation') && !status.dnaSequence ? (
                <Box sx={{ textAlign: 'center', my: 4 }}>
                  <CircularProgress />
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    Generating unique DNA for {status.agentName || 'your agent'}...
                  </Typography>
                </Box>
              ) : (status.dnaSequence && (isStepCompleted('dna-generation') || isStepActive('dna-generation'))) ? (
                <Box>
                  <Paper
                    elevation={0}
                    sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}
                  >
                    {renderDNASequence(status.dnaSequence.substring(0, 32))}
                    {status.dnaSequence.length > 32 && (
                      <Typography variant="caption" display="block">
                        {status.dnaSequence.length - 32} more bases...
                      </Typography>
                    )}
                  </Paper>

                  <Box sx={{ mt: 2, textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">
                      DNA Sequence Generated
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    color: 'text.secondary',
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Typography>DNA Generation Pending</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Avatar Creation */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', position: 'relative' }}>
            {isStepActive('avatar-creation') && (
              <LinearProgress sx={{ position: 'absolute', top: 0, width: '100%' }} />
            )}
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Avatar Creation
              </Typography>

              {status.dnaSequence && !status.avatarUrl && !isStepActive('avatar-creation') ? (
                <Box sx={{ textAlign: 'center', my: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={onCreateAvatar}
                    size="large"
                  >
                    Create Avatar
                  </Button>
                </Box>
              ) : isStepActive('avatar-creation') ? (
                <Box sx={{ textAlign: 'center', my: 4 }}>
                  <CircularProgress />
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    Creating avatar from DNA and character traits...
                  </Typography>
                </Box>
              ) : isStepActive('metadata-preparation') || status.avatarUrl ? (
                <Box sx={{ textAlign: 'center' }}>
                  <img
                    src={status.avatarUrl}
                    alt="Agent Avatar"
                    style={{ maxWidth: '100%', maxHeight: '200px', margin: '0 auto' }}
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Avatar Created
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    color: 'text.secondary',
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Typography>Avatar Creation Pending</Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    (Requires DNA generation first)
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* NFT Minting */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', position: 'relative' }}>
            {isStepActive('minting') && (
              <LinearProgress sx={{ position: 'absolute', top: 0, width: '100%' }} />
            )}
            <CardContent>
              <Typography variant="h6" gutterBottom>
                NFT Minting
              </Typography>

              {status.avatarUrl && !isStepActive('minting') && status.step !== 'completed' ? (
                <Box sx={{ textAlign: 'center', my: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={onMintNFT}
                    size="large"
                  >
                    Mint NFT
                  </Button>
                </Box>
              ) : isStepActive('minting') ? (
                <Box sx={{ textAlign: 'center', my: 4 }}>
                  <CircularProgress />
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    Minting NFT on the blockchain...
                  </Typography>
                </Box>
              ) : status.step === 'completed' ? (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold' }}>
                    NFT Minted Successfully!
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    NFT Address: {status.nftAddress?.substring(0, 8)}...{status.nftAddress?.substring(status.nftAddress.length - 4)}
                  </Typography>
                  {status.explorerUrl && (
                    <Button
                      variant="outlined"
                      size="small"
                      href={status.explorerUrl}
                      target="_blank"
                      sx={{ mt: 2 }}
                    >
                      View on Explorer
                    </Button>
                  )}
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    color: 'text.secondary',
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Typography>NFT Minting Pending</Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    (Requires avatar creation first)
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Error messaging */}
      {status.step === 'error' && (
        <Box
          sx={{
            p: 2,
            mt: 3,
            bgcolor: '#FFEBEE',
            color: '#D32F2F',
            borderRadius: 1,
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            Error Occurred
          </Typography>
          <Typography variant="body2">{status.errorMessage}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default AgentNFTVisualizer;
