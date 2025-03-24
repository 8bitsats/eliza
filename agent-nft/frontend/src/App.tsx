import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// Components
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import GenerateDNA from './pages/GenerateDNA';
import VisualizeDNA from './pages/VisualizeDNA';
import GenerateAvatar from './pages/GenerateAvatar';
import AgentNFTCreator from './pages/AgentNFTCreator';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.8rem',
      fontWeight: 500,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/generate-dna" element={<GenerateDNA />} />
            <Route path="/visualize-dna" element={<VisualizeDNA />} />
            <Route path="/generate-avatar" element={<GenerateAvatar />} />
            <Route path="/create-nft" element={<AgentNFTCreator />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
