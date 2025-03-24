import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Alert,
} from '@mui/material';

type VisualizationType = 'chart' | 'helix' | 'grid' | 'circular';

const VisualizeDNA: React.FC = () => {
  const [dnaSequence, setDnaSequence] = useState<string>('');
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('chart');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const validateDNA = (sequence: string): boolean => {
    return /^[ATCG]+$/i.test(sequence);
  };

  const handleVisualize = async () => {
    // Validation
    if (!dnaSequence) {
      setError('Please enter a DNA sequence');
      return;
    }

    const formattedSequence = dnaSequence.toUpperCase().trim();
    if (!validateDNA(formattedSequence)) {
      setError('DNA sequence must only contain A, T, C, G characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/visualize-dna', 
        { 
          sequence: formattedSequence,
          visualizationType 
        }, 
        { responseType: 'blob' }
      );

      // Create a URL for the blob
      const url = URL.createObjectURL(response.data);
      setImageUrl(url);
    } catch (err) {
      console.error('Error visualizing DNA:', err);
      setError(
        err.response?.data?.error || err.message || 'Failed to visualize DNA sequence'
      );
    } finally {
      setLoading(false);
    }
  };

  const generateRandomDNA = () => {
    const bases = ['A', 'T', 'C', 'G'];
    let randomDNA = '';
    const length = 32; // Generate a fixed length for simplicity

    for (let i = 0; i < length; i++) {
      randomDNA += bases[Math.floor(Math.random() * bases.length)];
    }

    setDnaSequence(randomDNA);
  };

  // Color coding for DNA bases display
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
    <Container>
      <Typography variant="h4" gutterBottom>
        Visualize DNA Sequence
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }} elevation={2}>
            <Typography variant="h6" gutterBottom>
              Enter DNA Sequence
            </Typography>

            <TextField
              label="DNA Sequence"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              margin="normal"
              value={dnaSequence}
              onChange={(e) => setDnaSequence(e.target.value.toUpperCase())}
              helperText="Enter DNA bases (A, T, C, G)"
              error={!!error}
              inputProps={{ style: { fontFamily: 'monospace' } }}
            />

            <Box sx={{ mt: 2, mb: 3 }}>
              <Button
                variant="outlined"
                onClick={generateRandomDNA}
                sx={{ mr: 2 }}
              >
                Generate Random DNA
              </Button>
              <Button
                variant="outlined"
                onClick={() => setDnaSequence('')}
              >
                Clear
              </Button>
            </Box>

            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel>Visualization Type</InputLabel>
              <Select
                value={visualizationType}
                onChange={(e) => setVisualizationType(e.target.value as VisualizationType)}
                label="Visualization Type"
              >
                <MenuItem value="chart">Chart View</MenuItem>
                <MenuItem value="helix">DNA Helix</MenuItem>
                <MenuItem value="grid">Grid Pattern</MenuItem>
                <MenuItem value="circular">Circular Visualization</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleVisualize}
                disabled={loading}
                fullWidth
                size="large"
                startIcon={loading && <CircularProgress size={20} color="inherit" />}
              >
                {loading ? 'Visualizing...' : 'Visualize DNA'}
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                DNA Visualization
              </Typography>

              {dnaSequence && (
                <Typography variant="subtitle2" gutterBottom>
                  Visualizing {dnaSequence.length} base pairs
                </Typography>
              )}

              {dnaSequence && (
                <Paper
                  elevation={0}
                  sx={{ p: 2, bgcolor: 'background.default', mb: 3, borderRadius: 1 }}
                >
                  {renderDNASequence(dnaSequence.substring(0, 50))}
                  {dnaSequence.length > 50 && (
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Showing first 50 bases only. Full sequence will be used for visualization.
                    </Typography>
                  )}
                </Paper>
              )}

              {loading && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 300,
                  }}
                >
                  <CircularProgress />
                </Box>
              )}

              {imageUrl && !loading && (
                <Box
                  sx={{
                    mt: 2,
                    textAlign: 'center',
                    img: {
                      maxWidth: '100%',
                      maxHeight: 400,
                      objectFit: 'contain',
                    },
                  }}
                >
                  <img src={imageUrl} alt="DNA Visualization" />
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = imageUrl;
                        link.download = `dna-visualization-${Date.now()}.png`;
                        link.click();
                      }}
                    >
                      Download Image
                    </Button>
                  </Box>
                </Box>
              )}

              {!loading && !imageUrl && !error && (
                <Box
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    color: 'text.secondary',
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                    height: 300,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography>
                    Enter a DNA sequence and click "Visualize DNA" to generate a visualization.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default VisualizeDNA;
