import express, { Request, Response } from 'express';
import cors from 'cors';
import { pathToFileURL } from 'url';
import { PumpFunAgentIntegration } from './agent-integration.js';

const app = express();
const port = process.env.PORT || 3000;

// Configure CORS
app.use(cors());
app.use(express.json());

// Initialize agent
const agent = new PumpFunAgentIntegration(
  process.env.WALLET_PATH || './wallet.json',
  process.env.RPC_URL || 'https://api.devnet.solana.com',
  process.env.TOKEN_DIR || './tokens'
);

// API endpoints
app.post('/launch-token', async (req: Request, res: Response) => {
  try {
    const {
      name,
      symbol,
      description,
      initialBuyAmount,
      imagePath,
      telegram,
      twitter,
      website
    } = req.body;

    const result = await agent.launchToken(
      name,
      symbol,
      description,
      initialBuyAmount,
      imagePath,
      telegram,
      twitter,
      website
    );

    res.json(result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
