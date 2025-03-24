import { describe, it, expect, beforeEach } from 'vitest';
import { vi } from 'vitest';
import { PumpFunAgentIntegration } from '../src/agent-integration';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs and other dependencies
vi.mock('fs', async () => {
  return {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn()
  };
});

vi.mock('@solana/web3.js', () => ({
  Connection: vi.fn(),
  Keypair: {
    fromSecretKey: vi.fn(),
    generate: vi.fn(() => ({
      publicKey: { toBase58: () => 'mockPubKey', toString: () => 'mockPubKey' },
      secretKey: new Uint8Array(32)
    }))
  }
}));

// Mock the PumpFunPlugin
vi.mock('../src/pumpfun-plugin', () => ({
  PumpFunPlugin: vi.fn().mockImplementation(() => ({
    launchToken: vi.fn().mockImplementation((name, symbol, description) => {
      if (!name) {
        throw new Error('Token name is required');
      }
      return {
        success: true,
        tokenAddress: 'mock-token-address',
        tokenBalance: 100,
        keypairPath: '/mock/keypair.json',
        pumpfunUrl: 'https://pump.fun/mock-token-address'
      };
    }),
    getTokenBalance: vi.fn().mockReturnValue({
      success: true,
      tokenBalance: 100
    }),
    getWalletInfo: vi.fn().mockReturnValue({
      address: 'mock-wallet-address',
      balance: 10.5
    })
  }))
}));

describe('PumpFunAgentIntegration', () => {
  const mockConfig = {
    rpcUrl: 'https://api.devnet.solana.com',
    tokenDir: '/mock/token/dir',
    walletPath: '/mock/wallet.json'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (fs.existsSync as any).mockReturnValue(true);
    (fs.readFileSync as any).mockReturnValue(JSON.stringify({
      privateKey: new Array(32).fill(0)
    }));
  });

  describe('launchToken', () => {
    it('should validate token parameters', async () => {
      const agent = new PumpFunAgentIntegration(
        mockConfig.walletPath,
        mockConfig.rpcUrl,
        mockConfig.tokenDir
      );

      const tokenParams = {
        name: 'Test Token',
        symbol: 'TEST',
        description: 'A test token',
        initialBuyAmount: 0.5,
        imagePath: '/path/to/image.png',
        telegram: '@test',
        twitter: '@test',
        website: 'https://test.com'
      };

      await expect(agent.launchToken(
        tokenParams.name,
        tokenParams.symbol,
        tokenParams.description,
        tokenParams.initialBuyAmount,
        tokenParams.imagePath,
        tokenParams.telegram,
        tokenParams.twitter,
        tokenParams.website
      )).resolves.toMatchObject({
        success: true,
        tokenAddress: expect.any(String)
      });
    });

    it('should reject invalid parameters', async () => {
      const agent = new PumpFunAgentIntegration(
        mockConfig.walletPath,
        mockConfig.rpcUrl,
        mockConfig.tokenDir
      );

      await expect(agent.launchToken(
        '', // invalid name
        'TEST',
        'Description',
        0.5,
        '/path/to/image.png',
        '',
        '',
        ''
      )).rejects.toThrow('Token name is required');
    });
  });
});
