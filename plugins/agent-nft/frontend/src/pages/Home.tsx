import React from 'react';
import { Typography, Button, Box, Paper, Grid, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <Container>
      <Box sx={{ mt: 8, mb: 6, textAlign: 'center' }}>
        <Typography variant="h2" gutterBottom>
          Agent NFT Creator
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Create unique agent NFTs by generating DNA, visualizing it, creating avatars, 
          and minting them on blockchain platforms like Solana.
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
            elevation={2}
          >
            <Typography variant="h5" gutterBottom>
              Create Individual Components
            </Typography>
            <Typography paragraph>
              Generate DNA sequences, visualize DNA, or generate avatars individually.
              Perfect for experimenting with different configurations.
            </Typography>
            <Box sx={{ mt: 'auto' }}>
              <Button
                variant="contained"
                component={RouterLink}
                to="/generate-dna"
                sx={{ mr: 2, mb: 1 }}
              >
                Generate DNA
              </Button>
              <Button
                variant="contained"
                component={RouterLink}
                to="/visualize-dna"
                sx={{ mr: 2, mb: 1 }}
              >
                Visualize DNA
              </Button>
              <Button
                variant="contained"
                component={RouterLink}
                to="/generate-avatar"
                sx={{ mb: 1 }}
              >
                Generate Avatar
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'primary.light',
              color: 'white',
            }}
            elevation={3}
          >
            <Typography variant="h5" gutterBottom>
              Complete NFT Creation
            </Typography>
            <Typography paragraph>
              Create a complete agent NFT in one go. Define your agent's character,
              generate DNA, create an avatar, and mint an NFT - all in a streamlined
              process.
            </Typography>
            <Box sx={{ mt: 'auto' }}>
              <Button
                variant="contained"
                component={RouterLink}
                to="/create-nft"
                sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: '#e0e0e0' } }}
                size="large"
              >
                Create Agent NFT
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 6, mb: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          How It Works
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, height: '100%' }} elevation={1}>
              <Typography variant="h6" gutterBottom>
                1. Generate DNA
              </Typography>
              <Typography>
                Create unique DNA sequences using NVIDIA's advanced DNA Generator API.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, height: '100%' }} elevation={1}>
              <Typography variant="h6" gutterBottom>
                2. Visualize DNA
              </Typography>
              <Typography>
                See your agent's DNA sequence visualized with color-coded nucleotides.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, height: '100%' }} elevation={1}>
              <Typography variant="h6" gutterBottom>
                3. Generate Avatar
              </Typography>
              <Typography>
                Create a visual representation of your agent based on its DNA and character.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, height: '100%' }} elevation={1}>
              <Typography variant="h6" gutterBottom>
                4. Mint NFT
              </Typography>
              <Typography>
                Mint an NFT on Solana blockchain to certify ownership of your unique agent.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;
