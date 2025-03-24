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
  Paper,
  TextField,
  Typography,
  Alert,
  Chip,
} from '@mui/material';

interface AgentCharacter {
  name: string;
  adjectives: string[];
  bio: string[];
}

const GenerateAvatar: React.FC = () => {
  const [character, setCharacter] = useState<AgentCharacter>({
    name: '',
    adjectives: [],
    bio: [],
  });
  const [adjectiveInput, setAdjectiveInput] = useState<string>('');
  const [bioInput, setBioInput] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleGenerateAvatar = async () => {
    // Validation
    if (!character.name) {
      setError('Please enter an agent name');
      return;
    }

    if (character.adjectives.length === 0) {
      setError('Please add at least one trait/adjective');
      return;
    }

    if (character.bio.length === 0) {
      setError('Please add at least one bio paragraph');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/generate-avatar', 
        { characterData: character }, 
        { responseType: 'blob' }
      );

      // Create a URL for the blob
      const url = URL.createObjectURL(response.data);
      setAvatarUrl(url);
    } catch (err) {
      console.error('Error generating avatar:', err);
      setError(
        err.response?.data?.error || err.message || 'Failed to generate avatar'
      );
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Generate Agent Avatar
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
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
              error={error.includes('name')}
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
                  error={error.includes('trait')}
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
                  error={error.includes('bio')}
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
                onClick={handleGenerateAvatar}
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} color="inherit" />}
              >
                {loading ? 'Generating...' : 'Generate Avatar'}
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
                Generated Avatar
              </Typography>

              {loading && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 400,
                  }}
                >
                  <CircularProgress />
                </Box>
              )}

              {avatarUrl && !loading && (
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
                  <img src={avatarUrl} alt="Agent Avatar" />
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = avatarUrl;
                        link.download = `${character.name.replace(/\s+/g, '-')}-avatar.png`;
                        link.click();
                      }}
                    >
                      Download Avatar
                    </Button>
                  </Box>
                </Box>
              )}

              {!loading && !avatarUrl && !error && (
                <Box
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    color: 'text.secondary',
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                    height: 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography>
                    Complete your agent's profile and click "Generate Avatar" to create a visual representation.
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

export default GenerateAvatar;
