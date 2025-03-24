import { createCanvas, CanvasRenderingContext2D as NodeCanvasRenderingContext2D } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';
import { DNAVisualizationOptions } from './types';

export class DNAVisualizer {
  /**
   * Create a visualization of a DNA sequence
   */
  async createVisualization(
    options: {
      dnaSequence: string;
      style: 'barcode' | 'radial' | 'matrix' | 'helix';
      width: number;
      height: number;
      colorScheme?: {
        A: string;
        T: string;
        G: string;
        C: string;
        background?: string;
      };
      animation?: {
        enabled: boolean;
        duration: number;
        type: 'rotate' | 'pulse' | 'wave';
      };
    }
  ): Promise<Buffer> {
    const {
      dnaSequence,
      style,
      width,
      height,
      colorScheme = {
        A: '#4CAF50', // Green
        T: '#2196F3', // Blue
        G: '#FFC107', // Yellow
        C: '#F44336', // Red
        background: '#121212'
      },
      animation
    } = options;

    // Create canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d') as NodeCanvasRenderingContext2D;

    // Fill background
    ctx.fillStyle = colorScheme.background || '#121212';
    ctx.fillRect(0, 0, width, height);

    // Choose appropriate drawing method
    switch (style) {
      case 'helix':
        await this.drawHelixStyle(ctx, dnaSequence, width, height, colorScheme, animation);
        break;
      case 'matrix':
        await this.drawGridStyle(ctx, dnaSequence, width, height, colorScheme);
        break;
      case 'radial':
        await this.drawCircularStyle(ctx, dnaSequence, width, height, colorScheme, animation);
        break;
      case 'barcode':
        await this.drawBarcodeStyle(ctx, dnaSequence, width, height, colorScheme);
        break;
      default:
        await this.drawHelixStyle(ctx, dnaSequence, width, height, colorScheme, animation);
    }

    // Return buffer
    return canvas.toBuffer('image/png');
  }

  /**
   * Draw DNA using a double helix style
   */
  private async drawHelixStyle(
    ctx: NodeCanvasRenderingContext2D,
    sequence: string,
    width: number,
    height: number,
    colorScheme: { A: string; T: string; G: string; C: string; background?: string },
    animation?: { enabled: boolean; duration: number; type: 'rotate' | 'pulse' | 'wave' }
  ): Promise<void> {
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.4;
    const turns = Math.max(3, sequence.length / 20);
    
    // Add background texture
    this.addBackgroundTexture(ctx, width, height);
    
    // Draw the double helix
    const angleStep = (Math.PI * 2 * turns) / sequence.length;
    const verticalStep = height * 0.8 / sequence.length;
    const startY = height * 0.1;
    
    // Draw connecting lines
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    
    for (let i = 0; i < sequence.length; i++) {
      const angle = i * angleStep;
      const y = startY + i * verticalStep;
      
      // Calculate positions for both strands
      const x1 = centerX + Math.sin(angle) * maxRadius * 0.5;
      const x2 = centerX + Math.sin(angle + Math.PI) * maxRadius * 0.5;
      
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }
    
    // Draw nucleotides
    ctx.globalAlpha = 1.0;
    for (let i = 0; i < sequence.length; i++) {
      const nucleotide = sequence[i];
      const complementary = this.getComplementaryNucleotide(nucleotide);
      const angle = i * angleStep;
      const y = startY + i * verticalStep;
      
      const x1 = centerX + Math.sin(angle) * maxRadius * 0.5;
      const x2 = centerX + Math.sin(angle + Math.PI) * maxRadius * 0.5;
      
      // Draw first nucleotide
      const size1 = 10;
      ctx.fillStyle = colorScheme[nucleotide as keyof typeof colorScheme] || '#ffffff';
      ctx.beginPath();
      ctx.arc(x1, y, size1, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw complementary nucleotide
      const size2 = 10;
      ctx.fillStyle = colorScheme[complementary as keyof typeof colorScheme] || '#ffffff';
      ctx.beginPath();
      ctx.arc(x2, y, size2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Add glow effect
    this.addGlowEffect(ctx, width, height);
    
    // Add title and metadata
    this.drawTitle(ctx, 'AGENT DNA PROFILE', width, height);
    this.drawMetadata(ctx, sequence, width, height);
    
    // Apply animation if enabled
    if (animation?.enabled) {
      await this.applyAnimation(ctx, animation.type, animation.duration);
    }
  }

  /**
   * Draw DNA using a grid pattern
   */
  private async drawGridStyle(
    ctx: NodeCanvasRenderingContext2D,
    sequence: string,
    width: number,
    height: number,
    colorScheme: { A: string; T: string; G: string; C: string; background?: string }
  ): Promise<void> {
    const gridSize = Math.ceil(Math.sqrt(sequence.length));
    const cellWidth = width / gridSize;
    const cellHeight = height / gridSize;
    
    // Add background texture
    this.addBackgroundTexture(ctx, width, height);
    
    // Draw the grid
    for (let i = 0; i < sequence.length; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      
      const x = col * cellWidth;
      const y = row * cellHeight;
      
      const nucleotide = sequence[i];
      
      // Draw cell
      ctx.fillStyle = colorScheme[nucleotide as keyof typeof colorScheme] || '#ffffff';
      ctx.fillRect(x, y, cellWidth, cellHeight);
      
      // Draw nucleotide letter
      ctx.fillStyle = '#ffffff';
      ctx.font = `${cellWidth * 0.6}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(nucleotide, x + cellWidth / 2, y + cellHeight / 2);
    }
    
    // Add grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    
    for (let i = 0; i <= gridSize; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(i * cellWidth, 0);
      ctx.lineTo(i * cellWidth, height);
      ctx.stroke();
      
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, i * cellHeight);
      ctx.lineTo(width, i * cellHeight);
      ctx.stroke();
    }
    
    // Add glow effect
    this.addGlowEffect(ctx, width, height);
    
    // Add title and metadata
    this.drawTitle(ctx, 'AGENT DNA MATRIX', width, height);
    this.drawMetadata(ctx, sequence, width, height);
  }

  /**
   * Draw DNA in a circular pattern (like a radial barcode)
   */
  private async drawCircularStyle(
    ctx: NodeCanvasRenderingContext2D,
    sequence: string,
    width: number,
    height: number,
    colorScheme: { A: string; T: string; G: string; C: string; background?: string },
    animation?: { enabled: boolean; duration: number; type: 'rotate' | 'pulse' | 'wave' }
  ): Promise<void> {
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.45;
    const minRadius = maxRadius * 0.2;
    
    // Add background texture
    this.addBackgroundTexture(ctx, width, height);
    
    // Draw circular background
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
    gradient.addColorStop(0, 'rgba(30, 30, 30, 0.8)');
    gradient.addColorStop(1, 'rgba(10, 10, 10, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw each nucleotide as a segment around the circle
    const angleStep = (Math.PI * 2) / sequence.length;
    
    for (let i = 0; i < sequence.length; i++) {
      const nucleotide = sequence[i];
      const startAngle = i * angleStep;
      const endAngle = (i + 1) * angleStep;
      
      // Calculate radius based on intensity
      const segmentRadius = minRadius + ((maxRadius - minRadius) * 0.8);
      
      // Draw segment
      ctx.fillStyle = colorScheme[nucleotide as keyof typeof colorScheme] || '#ffffff';
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, segmentRadius, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();
      
      // Add segment border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(startAngle) * maxRadius, centerY + Math.sin(startAngle) * maxRadius);
      ctx.stroke();
    }
    
    // Add glow effect
    this.addGlowEffect(ctx, width, height);
    
    // Add title and metadata
    this.drawTitle(ctx, 'AGENT DNA SEQUENCE', width, height);
    this.drawMetadata(ctx, sequence, width, height);
    
    // Apply animation if enabled
    if (animation?.enabled) {
      await this.applyAnimation(ctx, animation.type, animation.duration);
    }
  }

  /**
   * Draw DNA as a barcode style visualization
   */
  private async drawBarcodeStyle(
    ctx: NodeCanvasRenderingContext2D,
    sequence: string,
    width: number,
    height: number,
    colorScheme: { A: string; T: string; G: string; C: string; background?: string }
  ): Promise<void> {
    // Calculate barcode dimensions
    const margin = width * 0.1;
    const barWidth = (width - (margin * 2)) / sequence.length;
    const maxBarHeight = height * 0.6;
    
    // Add background texture
    this.addBackgroundTexture(ctx, width, height);
    
    // Draw bars
    for (let i = 0; i < sequence.length; i++) {
      const nucleotide = sequence[i];
      const x = margin + (i * barWidth);
      
      // Calculate bar height based on intensity
      const barHeight = maxBarHeight * 0.8;
      
      // Draw bar
      ctx.fillStyle = colorScheme[nucleotide as keyof typeof colorScheme] || '#ffffff';
      ctx.globalAlpha = 0.8;
      ctx.fillRect(x, height / 2 - barHeight / 2, barWidth, barHeight);
    }
    
    // Add glow effect
    this.addGlowEffect(ctx, width, height);
    
    // Add title and metadata
    this.drawTitle(ctx, 'AGENT DNA BARCODE', width, height);
    this.drawMetadata(ctx, sequence, width, height);
  }

  /**
   * Add texture to the background
   */
  private addBackgroundTexture(
    ctx: NodeCanvasRenderingContext2D,
    width: number,
    height: number
  ): void {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Add a glow/bloom effect to the image
   */
  private addGlowEffect(
    ctx: NodeCanvasRenderingContext2D,
    width: number,
    height: number
  ): void {
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
  }

  /**
   * Draw title at the top of the image
   */
  private drawTitle(
    ctx: NodeCanvasRenderingContext2D,
    title: string,
    width: number,
    height: number
  ): void {
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, width / 2, 30);
  }

  /**
   * Draw metadata at the bottom of the image
   */
  private drawMetadata(
    ctx: NodeCanvasRenderingContext2D,
    sequence: string,
    width: number,
    height: number
  ): void {
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Length: ${sequence.length}bp`, 10, height - 20);
  }

  /**
   * Get the complementary nucleotide
   */
  private getComplementaryNucleotide(nucleotide: string): string {
    const pairs: { [key: string]: string } = {
      'A': 'T',
      'T': 'A',
      'G': 'C',
      'C': 'G'
    };
    return pairs[nucleotide] || nucleotide;
  }

  /**
   * Apply animation to the canvas
   */
  private async applyAnimation(
    ctx: NodeCanvasRenderingContext2D,
    type: 'rotate' | 'pulse' | 'wave',
    duration: number
  ): Promise<void> {
    // Animation implementation would go here
    // For now, we'll just return as animations require a more complex setup
    return Promise.resolve();
  }
}
