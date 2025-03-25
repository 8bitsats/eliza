// Type declarations for node-canvas

declare module 'canvas' {
  export class Canvas {
    constructor(width: number, height: number);
    width: number;
    height: number;
    getContext(contextId: '2d'): CanvasRenderingContext2D;
    toBuffer(mime?: string, config?: any): Buffer;
    toDataURL(mime?: string, quality?: number): string;
    createPNGStream(config?: any): any;
    createJPEGStream(config?: any): any;
    createPDFStream(config?: any): any;
  }

  export class CanvasRenderingContext2D {
    canvas: Canvas;
    fillStyle: string | CanvasGradient | CanvasPattern;
    strokeStyle: string | CanvasGradient | CanvasPattern;
    font: string;
    globalAlpha: number;
    globalCompositeOperation: string;
    imageSmoothingEnabled: boolean;
    imageSmoothingQuality: 'low' | 'medium' | 'high';
    lineCap: 'butt' | 'round' | 'square';
    lineDashOffset: number;
    lineJoin: 'bevel' | 'round' | 'miter';
    lineWidth: number;
    miterLimit: number;
    shadowBlur: number;
    shadowColor: string;
    shadowOffsetX: number;
    shadowOffsetY: number;
    textAlign: 'start' | 'end' | 'left' | 'right' | 'center';
    textBaseline: 'top' | 'hanging' | 'middle' | 'alphabetic' | 'ideographic' | 'bottom';
    
    // Methods
    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
    beginPath(): void;
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
    clearRect(x: number, y: number, width: number, height: number): void;
    clip(fillRule?: 'nonzero' | 'evenodd'): void;
    closePath(): void;
    createImageData(width: number, height: number): ImageData;
    createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient;
    createPattern(image: any, repetition: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat'): CanvasPattern;
    createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient;
    drawImage(image: any, dx: number, dy: number): void;
    drawImage(image: any, dx: number, dy: number, dWidth: number, dHeight: number): void;
    drawImage(image: any, sx: number, sy: number, sWidth: number, sHeight: number, dx: number, dy: number, dWidth: number, dHeight: number): void;
    fill(fillRule?: 'nonzero' | 'evenodd'): void;
    fillRect(x: number, y: number, width: number, height: number): void;
    fillText(text: string, x: number, y: number, maxWidth?: number): void;
    getImageData(sx: number, sy: number, sw: number, sh: number): ImageData;
    getLineDash(): number[];
    isPointInPath(x: number, y: number, fillRule?: 'nonzero' | 'evenodd'): boolean;
    isPointInStroke(x: number, y: number): boolean;
    lineTo(x: number, y: number): void;
    measureText(text: string): TextMetrics;
    moveTo(x: number, y: number): void;
    putImageData(imageData: ImageData, dx: number, dy: number): void;
    putImageData(imageData: ImageData, dx: number, dy: number, dirtyX: number, dirtyY: number, dirtyWidth: number, dirtyHeight: number): void;
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
    rect(x: number, y: number, width: number, height: number): void;
    restore(): void;
    rotate(angle: number): void;
    save(): void;
    scale(x: number, y: number): void;
    setLineDash(segments: number[]): void;
    setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;
    stroke(): void;
    strokeRect(x: number, y: number, width: number, height: number): void;
    strokeText(text: string, x: number, y: number, maxWidth?: number): void;
    transform(a: number, b: number, c: number, d: number, e: number, f: number): void;
    translate(x: number, y: number): void;
  }

  export class CanvasGradient {
    addColorStop(offset: number, color: string): void;
  }

  export class CanvasPattern {
    // This is an opaque type
  }

  export interface ImageData {
    width: number;
    height: number;
    data: Uint8ClampedArray;
  }

  export interface TextMetrics {
    actualBoundingBoxAscent: number;
    actualBoundingBoxDescent: number;
    actualBoundingBoxLeft: number;
    actualBoundingBoxRight: number;
    alphabeticBaseline: number;
    emHeightAscent: number;
    emHeightDescent: number;
    fontBoundingBoxAscent: number;
    fontBoundingBoxDescent: number;
    hangingBaseline: number;
    ideographicBaseline: number;
    width: number;
  }

  // Export standard Image class for node-canvas
  export class Image {
    constructor();
    src: string;
    width: number;
    height: number;
    onload: (() => void) | null;
    onerror: ((err: Error) => void) | null;
  }

  // Exports for createImageData, etc.
  export function createImageData(width: number, height: number): ImageData;
  export function loadImage(src: string): Promise<Image>;
  export function registerFont(path: string, options: { family: string; weight?: string; style?: string }): void;
}
