/**
 * DNA Color Utilities
 * Functions to transform DNA sequences into color palettes and aesthetic traits
 */

// Color mapping for nucleotides
export const nucleotideColors: Record<string, string> = {
  A: '#4CAF50', // Green - Adenine
  T: '#2196F3', // Blue - Thymine
  G: '#FFC107', // Yellow - Guanine
  C: '#F44336', // Red - Cytosine
};

// Interface for avatar color palette generated from DNA
export interface AvatarColorPalette {
  skinTone: string;
  hairColor: string;
  eyeColor: string;
  clothingColor: string;
  backgroundColor: string;
}

// Interface for avatar aesthetic traits
export interface AvatarAesthetics {
  style: 'futuristic' | 'retro' | 'minimalist';
  complexity: 'simple' | 'moderate' | 'complex';
  pattern: 'solid' | 'gradient' | 'striped' | 'grid';
  accessories: boolean;
}

/**
 * Converts hex color to RGB
 * @param hex Hex color code
 * @returns RGB values as array [r, g, b]
 */
export function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

/**
 * Converts RGB to hex color code
 * @param r Red value
 * @param g Green value
 * @param b Blue value
 * @returns Hex color code
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}

/**
 * Calculates a color based on the nucleotide distribution in a DNA segment
 * @param segment DNA segment
 * @returns Hex color code derived from the segment
 */
export function calculateSegmentColor(segment: string): string {
  const counts: Record<string, number> = { A: 0, T: 0, G: 0, C: 0 };
  for (const nucleotide of segment) {
    if (nucleotide in counts) counts[nucleotide]++;
  }

  const total = segment.length;
  let r = 0, g = 0, b = 0;
  for (const [nucleotide, count] of Object.entries(counts)) {
    const [nr, ng, nb] = hexToRgb(nucleotideColors[nucleotide]);
    const weight = count / total;
    r += nr * weight;
    g += ng * weight;
    b += nb * weight;
  }

  return rgbToHex(r, g, b);
}

/**
 * Generates a color palette for an avatar based on a DNA sequence
 * @param sequence DNA sequence
 * @param segmentLength Length of each segment for color calculation
 * @returns Color palette for the avatar
 */
export function generateAvatarColorPalette(sequence: string, segmentLength: number = 40): AvatarColorPalette {
  // Clone and normalize the sequence
  const normalizedSequence = sequence.toUpperCase().replace(/[^ATGC]/g, '');
  
  if (normalizedSequence.length < segmentLength * 5) {
    // If sequence is too short, repeat it
    const repeatedSequence = normalizedSequence.repeat(
      Math.ceil((segmentLength * 5) / normalizedSequence.length)
    );
    sequence = repeatedSequence;
  }

  const segments = [
    sequence.substring(0, segmentLength),
    sequence.substring(segmentLength, segmentLength * 2),
    sequence.substring(segmentLength * 2, segmentLength * 3),
    sequence.substring(segmentLength * 3, segmentLength * 4),
    sequence.substring(segmentLength * 4, segmentLength * 5),
  ];

  return {
    skinTone: calculateSegmentColor(segments[0]),
    hairColor: calculateSegmentColor(segments[1]),
    eyeColor: calculateSegmentColor(segments[2]),
    clothingColor: calculateSegmentColor(segments[3]),
    backgroundColor: calculateSegmentColor(segments[4]),
  };
}

/**
 * Calculates the GC content of a DNA sequence
 * @param sequence DNA sequence
 * @returns GC content percentage
 */
export function calculateGCContent(sequence: string): number {
  const normalizedSequence = sequence.toUpperCase();
  const gcCount = (normalizedSequence.match(/[GC]/g) || []).length;
  return (gcCount / normalizedSequence.length) * 100;
}

/**
 * Determines the aesthetic traits of an avatar based on the DNA sequence
 * @param sequence DNA sequence
 * @returns Avatar aesthetic traits
 */
export function determineAvatarAesthetics(sequence: string): AvatarAesthetics {
  const normalizedSequence = sequence.toUpperCase();
  
  // Determine style based on GC content
  const gcContent = calculateGCContent(normalizedSequence);
  const style = gcContent > 60 ? 'futuristic' : gcContent > 40 ? 'retro' : 'minimalist';
  
  // Determine complexity based on sequence length
  const complexity = normalizedSequence.length > 200 ? 'complex' : 
                    normalizedSequence.length > 100 ? 'moderate' : 'simple';
  
  // Use sequence hash to determine pattern and accessories
  const hash = generateSimpleHash(normalizedSequence);
  const pattern = ['solid', 'gradient', 'striped', 'grid'][hash % 4] as 'solid' | 'gradient' | 'striped' | 'grid';
  const accessories = hash % 3 === 0; // 1/3 chance of having accessories
  
  return {
    style,
    complexity,
    pattern,
    accessories
  };
}

/**
 * Generates a simple numeric hash from a string
 * @param str String to hash
 * @returns Numeric hash
 */
function generateSimpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Generates a prompt for AI image generation based on DNA-derived traits
 * @param colorPalette Color palette derived from DNA
 * @param aesthetics Aesthetic traits derived from DNA
 * @returns Prompt for image generation
 */
export function generateAvatarPrompt(colorPalette: AvatarColorPalette, aesthetics: AvatarAesthetics): string {
  return `
A ${aesthetics.style} styled NFT avatar with:
- Skin tone: ${colorPalette.skinTone}
- Hair color: ${colorPalette.hairColor} with a subtle glow
- Eye color: ${colorPalette.eyeColor} with a digital sparkle
- Clothing color: ${colorPalette.clothingColor} in a ${aesthetics.pattern} design
- Background color: ${colorPalette.backgroundColor} with a ${aesthetics.pattern === 'grid' ? 'faint grid pattern' : aesthetics.pattern === 'gradient' ? 'smooth gradient' : 'simple background'}
${aesthetics.accessories ? '- With digital accessories like a futuristic headset or glowing aura' : ''}
The overall style is ${aesthetics.complexity} and ${aesthetics.style}, inspired by a DNA sequence, with ${aesthetics.complexity === 'simple' ? 'clean lines' : 'intricate details'} and a tech-inspired vibe.
`;
}
