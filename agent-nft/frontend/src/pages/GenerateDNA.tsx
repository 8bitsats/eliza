import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Slider,
  TextField,
  Typography,
  Alert,
  Paper,
} from '@mui/material';

interface DNAResponse {
  sequence: string;
  sampledProbs?: number[][];
}

const GenerateDNA: React.FC = () => {
  const [startSequence, setStartSequence] = useState<string>('');
  const [numTokens, setNumTokens] = useState<number>(32);
  const [temperature, setTemperature] = useState<number>(0.8);
  const [dnaResult, setDnaResult] = useState<DNAResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const generateDNA = async () => {
    setLoading(true);
    setError('');

    try {
      // Start sequence validation (must be valid DNA bases if provided)
      if (startSequence && !/^[ATCG]*$/.test(startSequence.toUpperCase())) {
        throw new Error('Start sequence must contain only A, T, C, G characters');
      }

      const response = await axios.post<DNAResponse>('/api/generate-dna', {
        startSequence: startSequence.toUpperCase(),
        numTokens,
        temperature,
        enableSampledProbs: true,
      });

      setDnaResult(response.data);
    } catch (err) {
      console.error('Error generating DNA:', err);
      setError(
        err.response?.data?.error || err.message || 'Failed to generate DNA sequence'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRandomStart = () => {
    const bases = ['A', 'T', 'C', 'G'];
    let randomSeq = '';
    const length = Math.floor(Math.random() * 10) + 3; // 3-12 bases
    
    for (let i = 0; i < length; i++) {
      randomSeq += bases[Math.floor(Math.random() * bases.length)];
    }
    
    setStartSequence(randomSeq);
  };

  // Color coding for DNA bases
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

  // Renders probability bars for each nucleotide if sampledProbs is available
  const renderProbabilityBars = (probabilities: number[][]) => {
    const bases = ['A', 'T', 'C', 'G'];
    
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Base Probability Distribution
        </Typography>
        <Grid container spacing={1}>
          {probabilities.slice(0, 10).map((probs, index) => (
            <Grid item xs={12} key={index}>
              <Typography variant="body2" component="div" sx={{ mb: 1, fontFamily: 'monospace' }}>
                Position {index + 1}:
              </Typography>
              <Grid container spacing={1}>
                {bases.map((base, baseIndex) => (
                  <Grid item xs={3} key={baseIndex}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography
                        variant="body2"
                        sx={{ color: getBaseColor(base), fontWeight: 'bold', width: 20 }}
                      >
                        {base}:
                      </Typography>
                      <Box
                        sx={{
                          height: 12,
                          bgcolor: getBaseColor(base),
                          width: `${probs[baseIndex] * 100}%`,
                          borderRadius: 1,
                          ml: 1,
                        }}
                      />
                      <Typography variant="caption" sx={{ ml: 1 }}>
                        {(probs[baseIndex] * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          ))}
          {probabilities.length > 10 && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Showing first 10 positions only. Full probabilities available in API response.
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Generate Agent DNA
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }} elevation={2}>
            <Typography variant="h6" gutterBottom>
              Configuration
            </Typography>

            <TextField
              label="Start Sequence (optional)"
              variant="outlined"
              fullWidth
              margin="normal"
              value={startSequence}
              onChange={(e) => setStartSequence(e.target.value.toUpperCase())}
              helperText="Enter DNA bases (A, T, C, G) to seed the generation or leave blank"
              inputProps={{ style: { fontFamily: 'monospace' } }}
            />

            <Box sx={{ mt: 2, mb: 3 }}>
              <Button
                variant="outlined"
                onClick={handleRandomStart}
                sx={{ mr: 2 }}
              >
                Generate Random Seed
              </Button>
              <Button
                variant="outlined"
                onClick={() => setStartSequence('')}
              >
                Clear
              </Button>
            </Box>

            <Typography gutterBottom>Sequence Length (tokens)</Typography>
            <Slider
              value={numTokens}
              onChange={(_, newValue) => setNumTokens(newValue as number)}
              valueLabelDisplay="auto"
              min={8}
              max={64}
              step={4}
              marks={[
                { value: 8, label: '8' },
                { value: 32, label: '32' },
                { value: 64, label: '64' },
              ]}
            />

            <Typography gutterBottom sx={{ mt: 3 }}>
              Temperature (creativity): {temperature.toFixed(1)}
            </Typography>
            <Slider
              value={temperature}
              onChange={(_, newValue) => setTemperature(newValue as number)}
              valueLabelDisplay="auto"
              min={0.1}
              max={1.0}
              step={0.1}
              marks={[
                { value: 0.1, label: '0.1' },
                { value: 0.5, label: '0.5' },
                { value: 1.0, label: '1.0' },
              ]}
            />

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={generateDNA}
                disabled={loading}
                fullWidth
                size="large"
                startIcon={loading && <CircularProgress size={20} color="inherit" />}
              >
                {loading ? 'Generating...' : 'Generate DNA'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Generated DNA Sequence
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {loading && !dnaResult && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 200,
                  }}
                >
                  <CircularProgress />
                </Box>
              )}

              {!loading && !dnaResult && !error && (
                <Box
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    color: 'text.secondary',
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  Configure your parameters and click "Generate DNA" to create a unique DNA sequence.
                </Box>
              )}

              {dnaResult && (
                <Box>
                  <Typography variant="subtitle2">
                    Sequence Length: {dnaResult.sequence.length} bases
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{ p: 2, bgcolor: 'background.default', mt: 2, borderRadius: 1 }}
                  >
                    {renderDNASequence(dnaResult.sequence)}
                  </Paper>
                  
                  {dnaResult.sampledProbs && renderProbabilityBars(dnaResult.sampledProbs)}
                  
                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        navigator.clipboard.writeText(dnaResult.sequence);
                      }}
                    >
                      Copy Sequence
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default GenerateDNA;
