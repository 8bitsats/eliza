import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';

interface DNASequence {
  sequence: string;
  probabilities: { [key: string]: number };
}

interface VisualizationOptions {
  dnaSequence: string;
  style: 'matrix' | 'helix';
  width: number;
  height: number;
  colorScheme: {
    A: string;
    T: string;
    G: string;
    C: string;
    background: string;
  };
  animation?: {
    enabled: boolean;
    duration: number;
    type: 'rotate' | 'zoom' | 'pan';
  };
}

export class DNAVisualizer {
  private readonly colorScheme = {
    A: '#00ff00',
    T: '#0000ff',
    G: '#ffff00',
    C: '#ff0000',
    background: '#000000'
  };

  async generateDNASequence(data: any): Promise<DNASequence> {
    try {
      // Generate a random DNA sequence
      const sequence = this.generateRandomDNASequence(1000);
      
      // Calculate probabilities
      const probabilities = this.calculateProbabilities(sequence);
      
      return {
        sequence,
        probabilities
      };
    } catch (error) {
      console.error('Error generating DNA sequence:', error);
      throw new Error(`Failed to generate DNA sequence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateAvatarImage(dnaSequence: string): Promise<Buffer> {
    try {
      // Create visualization
      const visualization = await this.createVisualization({
        dnaSequence,
        style: 'matrix',
        width: 1024,
        height: 1024,
        colorScheme: this.colorScheme
      });
      
      return visualization;
    } catch (error) {
      console.error('Error generating avatar image:', error);
      throw new Error(`Failed to generate avatar image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createVisualization(options: VisualizationOptions): Promise<Buffer> {
    try {
      // Create canvas
      const canvas = createCanvas(options.width, options.height);
      const ctx = canvas.getContext('2d');
      
      // Set background
      ctx.fillStyle = options.colorScheme.background;
      ctx.fillRect(0, 0, options.width, options.height);
      
      // Draw DNA sequence based on style
      if (options.style === 'matrix') {
        this.drawMatrix(ctx, options);
      } else if (options.style === 'helix') {
        this.drawHelix(ctx, options);
      }
      
      // Add animation if enabled
      if (options.animation?.enabled) {
        this.addAnimation(ctx, options);
      }
      
      // Convert to buffer
      return canvas.toBuffer();
    } catch (error) {
      console.error('Error creating visualization:', error);
      throw new Error(`Failed to create visualization: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateRandomDNASequence(length: number): string {
    const nucleotides = ['A', 'T', 'G', 'C'];
    let sequence = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * nucleotides.length);
      sequence += nucleotides[randomIndex];
    }
    
    return sequence;
  }

  private calculateProbabilities(sequence: string): { [key: string]: number } {
    const counts = { A: 0, T: 0, G: 0, C: 0 };
    
    for (const nucleotide of sequence) {
      counts[nucleotide]++;
    }
    
    const total = sequence.length;
    return {
      A: counts.A / total,
      T: counts.T / total,
      G: counts.G / total,
      C: counts.C / total
    };
  }

  private drawMatrix(ctx: CanvasRenderingContext2D, options: VisualizationOptions): void {
    const { width, height, dnaSequence, colorScheme } = options;
    const cellSize = Math.min(width, height) / 10;
    
    for (let i = 0; i < dnaSequence.length; i++) {
      const x = (i % 10) * cellSize;
      const y = Math.floor(i / 10) * cellSize;
      
      ctx.fillStyle = colorScheme[dnaSequence[i]];
      ctx.fillRect(x, y, cellSize, cellSize);
    }
  }

  private drawHelix(ctx: CanvasRenderingContext2D, options: VisualizationOptions): void {
    const { width, height, dnaSequence, colorScheme } = options;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;
    
    for (let i = 0; i < dnaSequence.length; i++) {
      const angle = (i / dnaSequence.length) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      ctx.fillStyle = colorScheme[dnaSequence[i]];
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private addAnimation(ctx: CanvasRenderingContext2D, options: VisualizationOptions): void {
    const { animation } = options;
    
    if (animation?.enabled) {
      // Add animation based on type
      switch (animation.type) {
        case 'rotate':
          this.addRotationAnimation(ctx, options);
          break;
        case 'zoom':
          this.addZoomAnimation(ctx, options);
          break;
        case 'pan':
          this.addPanAnimation(ctx, options);
          break;
      }
    }
  }

  private addRotationAnimation(ctx: CanvasRenderingContext2D, options: VisualizationOptions): void {
    const { width, height } = options;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Save current state
    ctx.save();
    
    // Rotate around center
    ctx.translate(centerX, centerY);
    ctx.rotate(Math.PI / 4);
    ctx.translate(-centerX, -centerY);
    
    // Restore state
    ctx.restore();
  }

  private addZoomAnimation(ctx: CanvasRenderingContext2D, options: VisualizationOptions): void {
    const { width, height } = options;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Save current state
    ctx.save();
    
    // Scale around center
    ctx.translate(centerX, centerY);
    ctx.scale(1.1, 1.1);
    ctx.translate(-centerX, -centerY);
    
    // Restore state
    ctx.restore();
  }

  private addPanAnimation(ctx: CanvasRenderingContext2D, options: VisualizationOptions): void {
    const { width, height } = options;
    
    // Save current state
    ctx.save();
    
    // Translate canvas
    ctx.translate(width * 0.1, height * 0.1);
    
    // Restore state
    ctx.restore();
  }
}
