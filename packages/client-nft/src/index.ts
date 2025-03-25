import { Connection, Keypair } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import axios from 'axios';
import { createCanvas } from 'canvas';
import { DNAGenerationOptions, DNAVisualizationStyle } from './types';

export class AgentNFTClient {
  private nvidiaApiKey: string;
  private connection: Connection;
  private wallet: Keypair;
  private metaplex: Metaplex;

  constructor(
    nvidiaApiKey: string,
    rpcEndpoint: string,
    walletPrivateKey: string
  ) {
    this.nvidiaApiKey = nvidiaApiKey;
    this.connection = new Connection(rpcEndpoint);
    this.wallet = Keypair.fromSecretKey(
      Buffer.from(walletPrivateKey, 'base64')
    );
    this.metaplex = Metaplex.make(this.connection);
  }

  /**
   * Generate a DNA sequence using NVIDIA's API
   */
  async generateDNA(options: DNAGenerationOptions): Promise<string> {
    const response = await axios.post(
      'https://api.nvidia.com/dna/v1/generate',
      {
        prompt: options.prompt,
        temperature: options.temperature || 0.8,
        length: options.length || 300,
        top_k: options.topK || 40
      },
      {
        headers: {
          'Authorization': `Bearer ${this.nvidiaApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.sequence;
  }

  /**
   * Create a visual representation of DNA sequence
   */
  async visualizeDNA(
    sequence: string,
    style: DNAVisualizationStyle = 'helix'
  ): Promise<Buffer> {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 800, 600);

    switch (style) {
      case 'helix':
        this.drawHelixVisualization(ctx, sequence);
        break;
      case 'grid':
        this.drawGridVisualization(ctx, sequence);
        break;
      case 'circular':
        this.drawCircularVisualization(ctx, sequence);
        break;
      case 'barcode':
        this.drawBarcodeVisualization(ctx, sequence);
        break;
    }

    return canvas.toBuffer('image/png');
  }

  /**
   * Draw DNA as a double helix
   */
  private drawHelixVisualization(
    ctx: CanvasRenderingContext2D,
    sequence: string
  ): void {
    const colors = {
      A: '#00FF00', // Green
      T: '#0000FF', // Blue
      G: '#FFFF00', // Yellow
      C: '#FF0000'  // Red
    };

    const centerY = 300;
    const amplitude = 100;
    const frequency = 0.02;

    sequence.split('').forEach((base, i) => {
      const x = i * 4;
      const y1 = centerY + Math.sin(i * frequency) * amplitude;
      const y2 = centerY + Math.sin(i * frequency + Math.PI) * amplitude;

      ctx.beginPath();
      ctx.arc(x, y1, 3, 0, Math.PI * 2);
      ctx.fillStyle = colors[base];
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y2, 3, 0, Math.PI * 2);
      ctx.fillStyle = colors[base];
      ctx.fill();

      // Draw connecting lines
      ctx.beginPath();
      ctx.moveTo(x, y1);
      ctx.lineTo(x, y2);
      ctx.strokeStyle = '#333333';
      ctx.stroke();
    });
  }

  /**
   * Draw DNA as a grid
   */
  private drawGridVisualization(
    ctx: CanvasRenderingContext2D,
    sequence: string
  ): void {
    const colors = {
      A: '#00FF00',
      T: '#0000FF',
      G: '#FFFF00',
      C: '#FF0000'
    };

    const cellSize = 20;
    const cols = Math.floor(800 / cellSize);
    const rows = Math.floor(600 / cellSize);

    sequence.split('').forEach((base, i) => {
      const x = (i % cols) * cellSize;
      const y = Math.floor(i / cols) * cellSize;

      if (y < 600) {
        ctx.fillStyle = colors[base];
        ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
      }
    });
  }

  /**
   * Draw DNA as a circular visualization
   */
  private drawCircularVisualization(
    ctx: CanvasRenderingContext2D,
    sequence: string
  ): void {
    const colors = {
      A: '#00FF00',
      T: '#0000FF',
      G: '#FFFF00',
      C: '#FF0000'
    };

    const centerX = 400;
    const centerY = 300;
    const radius = 200;

    sequence.split('').forEach((base, i) => {
      const angle = (i / sequence.length) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = colors[base];
      ctx.fill();
    });
  }

  /**
   * Draw DNA as a barcode
   */
  private drawBarcodeVisualization(
    ctx: CanvasRenderingContext2D,
    sequence: string
  ): void {
    const colors = {
      A: '#00FF00',
      T: '#0000FF',
      G: '#FFFF00',
      C: '#FF0000'
    };

    const barWidth = Math.floor(800 / sequence.length);
    const barHeight = 600;

    sequence.split('').forEach((base, i) => {
      const x = i * barWidth;
      ctx.fillStyle = colors[base];
      ctx.fillRect(x, 0, barWidth - 1, barHeight);
    });
  }
}

export * from './types';
