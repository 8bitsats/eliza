import { createCanvas } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Options for DNA visualization
 */
export interface DNAVisualizationOptions {
  /** Width of the output image */
  width?: number;
  /** Height of the output image */
  height?: number;
  /** Background color of the image */
  backgroundColor?: string;
  /** Visual style for DNA representation */
  style?: 'helix' | 'grid' | 'circular' | 'barcode';
  /** Optional seed value for deterministic rendering */
  seed?: number;
}

/**
 * Service for visualizing DNA sequences as images
 */
export class DNAVisualizer {
  /**
   * Create a visualization of a DNA sequence
   * @param sequence DNA sequence to visualize
   * @param probabilities Optional probability data for each nucleotide
   * @param options Visualization options
   * @returns Path to the generated image file
   */
  async createVisualization(
    sequence: string,
    outputPath: string = '',
    options: DNAVisualizationOptions = {}
  ): Promise<string> {
    // Default options
    const {
      width = 1024,
      height = 1024,
      backgroundColor = '#121212',
      style = 'helix',
      seed = Date.now()
    } = options;
    
    // Create canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    // Simplified probabilities as we're not using the complex format
    const probabilities: number[] = [];
    
    // Choose appropriate drawing method
    switch (style) {
      case 'helix':
        this.drawHelixStyle(ctx, sequence, probabilities, width, height, seed);
        break;
      case 'grid':
        this.drawGridStyle(ctx, sequence, probabilities, width, height, seed);
        break;
      case 'circular':
        this.drawCircularStyle(ctx, sequence, probabilities, width, height, seed);
        break;
      case 'barcode':
        this.drawBarcodeStyle(ctx, sequence, probabilities, width, height, seed);
        break;
      default:
        this.drawHelixStyle(ctx, sequence, probabilities, width, height, seed);
    }
    
    // If no output path provided, create one
    if (!outputPath) {
      const outputDir = path.join(process.cwd(), 'output');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      outputPath = path.join(outputDir, `dna_${Date.now()}.png`);
    }
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save the image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    
    return outputPath;
  }
  
  /**
   * Draw DNA using a double helix style
   */
  private drawHelixStyle(
    ctx: any, // Use 'any' to avoid the canvas type conflicts
    sequence: string,
    probabilities: number[] = [],
    width: number,
    height: number,
    seed: number
  ): void {
    // Set up parameters
    const nucleotideColors = {
      'A': '#4CAF50', // Green
      'T': '#2196F3', // Blue
      'G': '#FFC107', // Yellow
      'C': '#F44336'  // Red
    };
    
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.4;
    const turns = Math.max(3, sequence.length / 20);
    
    // Seeded random function
    let seedValue = seed;
    const seededRandom = () => {
      seedValue = (seedValue * 9301 + 49297) % 233280;
      return seedValue / 233280;
    };
    
    // Add some visual noise/texture to the background
    this.addBackgroundTexture(ctx, width, height, seededRandom);
    
    // Draw the double helix
    const angleStep = (Math.PI * 2 * turns) / sequence.length;
    const verticalStep = height * 0.8 / sequence.length;
    const startY = height * 0.1;
    
    // Draw the connecting lines first (behind the nucleotides)
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    
    for (let i = 0; i < sequence.length; i++) {
      const angle = i * angleStep;
      const y = startY + i * verticalStep;
      
      // Calculate positions for both strands
      const x1 = centerX + Math.sin(angle) * maxRadius * 0.5;
      const x2 = centerX + Math.sin(angle + Math.PI) * maxRadius * 0.5;
      
      // Draw connecting line
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
      
      // Calculate positions for both strands
      const x1 = centerX + Math.sin(angle) * maxRadius * 0.5;
      const x2 = centerX + Math.sin(angle + Math.PI) * maxRadius * 0.5;
      
      // Get probability for intensity if available
      const intensity1 = probabilities[i] || 0.8;
      const intensity2 = probabilities[i] || 0.8;
      
      // Draw first nucleotide
      const size1 = 10 + (intensity1 * 15);
      ctx.fillStyle = nucleotideColors[nucleotide as keyof typeof nucleotideColors] || '#ffffff';
      ctx.beginPath();
      ctx.arc(x1, y, size1, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw second (complementary) nucleotide
      const size2 = 10 + (intensity2 * 15);
      ctx.fillStyle = nucleotideColors[complementary as keyof typeof nucleotideColors] || '#ffffff';
      ctx.beginPath();
      ctx.arc(x2, y, size2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Add helix backbones
    this.drawHelixBackbones(ctx, centerX, startY, maxRadius, angleStep, verticalStep, sequence.length);
    
    // Add some glow/bloom effect
    this.addGlowEffect(ctx, width, height);
    
    // Add title and metadata
    this.drawTitle(ctx, 'AGENT DNA PROFILE', width, height);
    this.drawMetadata(ctx, sequence, width, height);
  }
  
  /**
   * Draw DNA using a grid pattern
   */
  private drawGridStyle(
    ctx: any, // Use 'any' to avoid the canvas type conflicts
    sequence: string,
    probabilities: number[] = [],
    width: number,
    height: number,
    seed: number
  ): void {
    // Set up parameters
    const nucleotideColors = {
      'A': '#4CAF50', // Green
      'T': '#2196F3', // Blue
      'G': '#FFC107', // Yellow
      'C': '#F44336'  // Red
    };
    
    // Calculate grid dimensions
    const gridSize = Math.ceil(Math.sqrt(sequence.length));
    const cellWidth = width / gridSize;
    const cellHeight = height / gridSize;
    
    // Seeded random function
    let seedValue = seed;
    const seededRandom = () => {
      seedValue = (seedValue * 9301 + 49297) % 233280;
      return seedValue / 233280;
    };
    
    // Add some visual noise/texture to the background
    this.addBackgroundTexture(ctx, width, height, seededRandom);
    
    // Draw the grid
    for (let i = 0; i < sequence.length; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      
      const x = col * cellWidth;
      const y = row * cellHeight;
      
      const nucleotide = sequence[i];
      
      // Get probability for intensity if available
      const intensity = probabilities[i] || 0.8;
      
      // Draw cell
      ctx.fillStyle = nucleotideColors[nucleotide as keyof typeof nucleotideColors] || '#ffffff';
      ctx.globalAlpha = 0.5 + (intensity * 0.5); // Vary opacity based on probability
      ctx.fillRect(x, y, cellWidth, cellHeight);
      
      // Draw nucleotide letter
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.8;
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
    
    // Add some glow/bloom effect
    this.addGlowEffect(ctx, width, height);
    
    // Add title and metadata
    ctx.globalAlpha = 1.0;
    this.drawTitle(ctx, 'AGENT DNA MATRIX', width, height);
    this.drawMetadata(ctx, sequence, width, height);
  }
  
  /**
   * Draw DNA in a circular pattern (like a radial barcode)
   */
  private drawCircularStyle(
    ctx: any, // Use 'any' to avoid the canvas type conflicts
    sequence: string,
    probabilities: number[] = [],
    width: number,
    height: number,
    seed: number
  ): void {
    // Set up parameters
    const nucleotideColors = {
      'A': '#4CAF50', // Green
      'T': '#2196F3', // Blue
      'G': '#FFC107', // Yellow
      'C': '#F44336'  // Red
    };
    
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.45;
    const minRadius = maxRadius * 0.2;
    
    // Seeded random function
    let seedValue = seed;
    const seededRandom = () => {
      seedValue = (seedValue * 9301 + 49297) % 233280;
      return seedValue / 233280;
    };
    
    // Add some visual noise/texture to the background
    this.addBackgroundTexture(ctx, width, height, seededRandom);
    
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
      
      // Get probability for intensity if available
      const intensity = probabilities[i] || 0.8;
      
      // Calculate radius based on intensity
      const segmentRadius = minRadius + ((maxRadius - minRadius) * intensity);
      
      // Draw segment
      ctx.fillStyle = nucleotideColors[nucleotide as keyof typeof nucleotideColors] || '#ffffff';
      ctx.globalAlpha = 0.7 + (intensity * 0.3);
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
    
    // Draw central circular text
    ctx.globalAlpha = 1.0;
    this.drawCircularText(ctx, 'AGENT DNA SEQUENCE', centerX, centerY, minRadius * 0.8);
    
    // Add some glow/bloom effect
    this.addGlowEffect(ctx, width, height);
    
    // Add metadata
    this.drawMetadata(ctx, sequence, width, height);
  }
  
  /**
   * Draw DNA as a barcode style visualization
   */
  private drawBarcodeStyle(
    ctx: any, // Use 'any' to avoid the canvas type conflicts
    sequence: string,
    probabilities: number[] = [],
    width: number,
    height: number,
    seed: number
  ): void {
    // Set up parameters
    const nucleotideColors = {
      'A': '#4CAF50', // Green
      'T': '#2196F3', // Blue
      'G': '#FFC107', // Yellow
      'C': '#F44336'  // Red
    };
    
    // Seeded random function
    let seedValue = seed;
    const seededRandom = () => {
      seedValue = (seedValue * 9301 + 49297) % 233280;
      return seedValue / 233280;
    };
    
    // Add some visual noise/texture to the background
    this.addBackgroundTexture(ctx, width, height, seededRandom);
    
    // Calculate barcode dimensions
    const margin = width * 0.1;
    const barWidth = (width - (margin * 2)) / sequence.length;
    const maxBarHeight = height * 0.6;
    
    // Draw bars
    for (let i = 0; i < sequence.length; i++) {
      const nucleotide = sequence[i];
      const x = margin + (i * barWidth);
      
      // Get probability for intensity if available
      const intensity = probabilities[i] || 0.8;
      
      // Calculate bar height based on intensity
      const barHeight = maxBarHeight * (0.4 + (intensity * 0.6));
      
      // Draw bar
      ctx.fillStyle = nucleotideColors[nucleotide as keyof typeof nucleotideColors] || '#ffffff';
      ctx.globalAlpha = 0.8;
      ctx.fillRect(x, height / 2 - barHeight / 2, barWidth, barHeight);
    }
    
    // Add some glow/bloom effect
    this.addGlowEffect(ctx, width, height);
    
    // Add title and metadata
    this.drawTitle(ctx, 'AGENT DNA BARCODE', width, height);
    this.drawMetadata(ctx, sequence, width, height);
    
    // Draw nucleotide count indicators along bottom
    const counts = this.countNucleotides(sequence);
    this.drawNucleotideCounts(ctx, counts, width, height);
  }
  
  /**
   * Add texture to the background
   */
  private addBackgroundTexture(
    ctx: any, // Use 'any' to avoid the canvas type conflicts
    width: number,
    height: number,
    randomFn: () => number
  ): void {
    // Add some subtle noise to the background
    ctx.globalAlpha = 0.05;
    
    for (let i = 0; i < width * height * 0.01; i++) {
      const x = randomFn() * width;
      const y = randomFn() * height;
      const size = 1 + randomFn() * 2;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${randomFn() * 0.2})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Add a few subtle grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    const gridSpacing = 50;
    for (let x = 0; x < width; x += gridSpacing) {
      if (randomFn() > 0.7) continue; // Skip some lines randomly
      
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y < height; y += gridSpacing) {
      if (randomFn() > 0.7) continue; // Skip some lines randomly
      
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1.0;
  }
  
  /**
   * Add a glow/bloom effect to the image
   */
  private addGlowEffect(
    ctx: any, // Use 'any' to avoid the canvas type conflicts
    width: number,
    height: number
  ): void {
    // Apply a subtle bloom effect by drawing a blurred overlay
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.3;
    ctx.filter = 'blur(10px)';
    
    // Copy the current canvas and draw it back with blur for the glow
    const imageData = ctx.getImageData(0, 0, width, height);
    ctx.putImageData(imageData, 0, 0);
    
    // Reset
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1.0;
    ctx.filter = 'none';
  }
  
  /**
   * Draw title at the top of the image
   */
  private drawTitle(
    ctx: any, // Use 'any' to avoid the canvas type conflicts
    title: string,
    width: number,
    height: number
  ): void {
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${width * 0.03}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.globalAlpha = 0.9;
    ctx.fillText(title, width / 2, height * 0.05);
  }
  
  /**
   * Draw metadata at the bottom of the image
   */
  private drawMetadata(
    ctx: any, // Use 'any' to avoid the canvas type conflicts
    sequence: string,
    width: number,
    height: number
  ): void {
    // Count nucleotides
    const counts = this.countNucleotides(sequence);
    
    // Format info text
    const infoText = [
      `LENGTH: ${sequence.length} bp`,
      `A: ${counts.A} (${Math.round(counts.A/sequence.length*100)}%)`,
      `T: ${counts.T} (${Math.round(counts.T/sequence.length*100)}%)`,
      `G: ${counts.G} (${Math.round(counts.G/sequence.length*100)}%)`,
      `C: ${counts.C} (${Math.round(counts.C/sequence.length*100)}%)`,
      `HASH: ${sequence.substring(0, 8)}...`
    ];
    
    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, height * 0.9, width, height * 0.1);
    
    // Draw text
    ctx.fillStyle = '#ffffff';
    ctx.font = `${width * 0.015}px monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.globalAlpha = 0.9;
    
    const padding = width * 0.05;
    infoText.forEach((text, index) => {
      ctx.fillText(text, padding, height * 0.91 + (index * width * 0.018));
    });
  }
  
  /**
   * Draw text in a circular pattern
   */
  private drawCircularText(
    ctx: any, // Use 'any' to avoid the canvas type conflicts
    text: string,
    centerX: number,
    centerY: number,
    radius: number
  ): void {
    ctx.font = `${radius * 0.2}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    
    const angleStep = (Math.PI * 2) / text.length;
    
    for (let i = 0; i < text.length; i++) {
      const angle = (i * angleStep) - (Math.PI / 2); // Start at the top
      
      ctx.save();
      ctx.translate(
        centerX + Math.cos(angle) * radius,
        centerY + Math.sin(angle) * radius
      );
      ctx.rotate(angle + (Math.PI / 2)); // Rotate the character
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }
  }
  
  /**
   * Draw helix backbone lines
   */
  private drawHelixBackbones(
    ctx: any, // Use 'any' to avoid the canvas type conflicts
    centerX: number,
    startY: number,
    maxRadius: number,
    angleStep: number,
    verticalStep: number,
    numNucleotides: number
  ): void {
    // Draw the DNA backbones as continuous curves
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    
    // First backbone
    ctx.beginPath();
    for (let i = 0; i < numNucleotides; i++) {
      const angle = i * angleStep;
      const y = startY + i * verticalStep;
      const x = centerX + Math.sin(angle) * maxRadius * 0.5;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    // Second backbone
    ctx.beginPath();
    for (let i = 0; i < numNucleotides; i++) {
      const angle = i * angleStep + Math.PI;
      const y = startY + i * verticalStep;
      const x = centerX + Math.sin(angle) * maxRadius * 0.5;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }
  
  /**
   * Draw nucleotide count indicators
   */
  private drawNucleotideCounts(
    ctx: any, // Use 'any' to avoid the canvas type conflicts
    counts: {A: number, T: number, G: number, C: number},
    width: number,
    height: number
  ): void {
    // Colors for each nucleotide
    const nucleotideColors = {
      'A': '#4CAF50', // Green
      'T': '#2196F3', // Blue
      'G': '#FFC107', // Yellow
      'C': '#F44336'  // Red
    };
    
    const barHeight = height * 0.03;
    const barY = height * 0.85;
    const total = counts.A + counts.T + counts.G + counts.C;
    
    let currentX = width * 0.1;
    const barWidth = width * 0.8;
    
    // A
    const aWidth = (counts.A / total) * barWidth;
    ctx.fillStyle = nucleotideColors['A'];
    ctx.fillRect(currentX, barY, aWidth, barHeight);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('A', currentX + aWidth / 2, barY + barHeight / 2);
    currentX += aWidth;
    
    // T
    const tWidth = (counts.T / total) * barWidth;
    ctx.fillStyle = nucleotideColors['T'];
    ctx.fillRect(currentX, barY, tWidth, barHeight);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('T', currentX + tWidth / 2, barY + barHeight / 2);
    currentX += tWidth;
    
    // G
    const gWidth = (counts.G / total) * barWidth;
    ctx.fillStyle = nucleotideColors['G'];
    ctx.fillRect(currentX, barY, gWidth, barHeight);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('G', currentX + gWidth / 2, barY + barHeight / 2);
    currentX += gWidth;
    
    // C
    const cWidth = (counts.C / total) * barWidth;
    ctx.fillStyle = nucleotideColors['C'];
    ctx.fillRect(currentX, barY, cWidth, barHeight);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('C', currentX + cWidth / 2, barY + barHeight / 2);
  }
  
  /**
   * Count the occurrence of each nucleotide in the sequence
   */
  private countNucleotides(sequence: string): {A: number, T: number, G: number, C: number} {
    const counts = { A: 0, T: 0, G: 0, C: 0 };
    
    for (const nucleotide of sequence) {
      if (nucleotide in counts) {
        counts[nucleotide as keyof typeof counts]++;
      }
    }
    
    return counts;
  }
  
  /**
   * Get the complementary nucleotide
   */
  private getComplementaryNucleotide(nucleotide: string): string {
    const complements = {
      'A': 'T',
      'T': 'A',
      'G': 'C',
      'C': 'G'
    };
    
    return complements[nucleotide as keyof typeof complements] || nucleotide;
  }
}
